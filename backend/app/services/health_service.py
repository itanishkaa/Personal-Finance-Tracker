"""
Financial health score (PRD sections 27-28). Deterministic and transparent
by design - every sub-score is a plain formula over data already produced
by analytics_service, budget_service, and goal_service, with no ML/black
box involved, so the score can always be explained back to the user.

Weights (PRD section 27):
    Savings Rate            25%
    Budget Adherence        25%
    Expense Stability       20%
    Goal Progress           15%
    Income/Expense Ratio    15%

Every scoring threshold below (what counts as "healthy", the exact
percentages) is a judgment call filling gaps the PRD leaves open - it
specifies the five weighted factors and their weights, not the formulas.
"""

import calendar
from datetime import date as date_type

from sqlalchemy.orm import Session

from app.schemas.health import FinancialHealthOut, HealthFactor, HealthInsight
from app.services import budget_service, goal_service
from app.services.analytics_service import (
    _transactions_dataframe,
    calculate_category_breakdown,
    calculate_monthly_trends,
    calculate_overview,
)

FACTOR_WEIGHTS = {
    "Savings Rate": 25.0,
    "Budget Adherence": 25.0,
    "Expense Stability": 20.0,
    "Goal Progress": 15.0,
    "Income/Expense Ratio": 15.0,
}

# Category MoM increases below this are just normal variation, not worth
# flagging as an insight.
_CATEGORY_SPIKE_THRESHOLD_PERCENT = 15.0
# A goal is "falling behind" if it's under half-funded and its target date
# is within this many days.
_GOAL_BEHIND_PROGRESS_THRESHOLD = 50.0
_GOAL_BEHIND_DAYS_WINDOW = 120


def _month_bounds(year: int, month: int) -> tuple[date_type, date_type]:
    last_day = calendar.monthrange(year, month)[1]
    return date_type(year, month, 1), date_type(year, month, last_day)


def _previous_month(year: int, month: int) -> tuple[int, int]:
    return (year - 1, 12) if month == 1 else (year, month - 1)


def _score_savings_rate(savings_rate: float) -> tuple[float, str, str]:
    # 0% savings -> 0 score, 30%+ savings -> full score, linear between.
    score = max(0.0, min(savings_rate / 30 * 100, 100.0))
    if score >= 70:
        return score, "positive", "Savings rate is healthy"
    return score, "warning", f"Savings rate is low ({savings_rate:.1f}%)"


def _score_income_expense_ratio(income: float, expenses: float) -> tuple[float, str, str]:
    if income <= 0 and expenses <= 0:
        return 100.0, "positive", "No income or expenses recorded yet this period"
    if expenses <= 0:
        return 100.0, "positive", "Income comfortably covers expenses"
    if income <= 0:
        return 0.0, "warning", "No income recorded against your expenses this period"

    ratio = income / expenses
    # ratio 1.0 (breaking even) -> 0 score, ratio 1.5+ -> full score.
    score = max(0.0, min((ratio - 1.0) / 0.5 * 100, 100.0))
    if score >= 70:
        return score, "positive", "Income comfortably covers expenses"
    return score, "warning", "Expenses are close to or exceeding income"


def _score_budget_adherence(budgets: list) -> tuple[float, str, str]:
    if not budgets:
        return 100.0, "warning", "No budgets set for this month yet"

    within = sum(1 for b in budgets if b.status != "over_budget")
    score = within / len(budgets) * 100
    if score >= 80:
        return score, "positive", "Most categories are within budget"
    over_count = len(budgets) - within
    return score, "warning", f"{over_count} budget{'s' if over_count != 1 else ''} exceeded this month"


def _score_expense_stability(monthly_trends: list[dict]) -> tuple[float, str, str]:
    active_months = [m for m in monthly_trends if m["income"] > 0 or m["expenses"] > 0]
    if len(active_months) < 2:
        return 100.0, "positive", "Not enough transaction history yet to assess spending stability"

    expenses = [m["expenses"] for m in active_months]
    mean = sum(expenses) / len(expenses)
    if mean == 0:
        return 100.0, "positive", "No expenses recorded in this period"

    variance = sum((x - mean) ** 2 for x in expenses) / len(expenses)
    coefficient_of_variation = (variance**0.5) / mean
    score = max(0.0, min(100 - coefficient_of_variation * 100, 100.0))
    if score >= 70:
        return score, "positive", "Spending has been consistent month to month"
    return score, "warning", "Spending has fluctuated significantly month to month"


def _score_goal_progress(goals: list) -> tuple[float, str, str]:
    if not goals:
        return 100.0, "warning", "No savings goals set"

    active_goals = [g for g in goals if g.status == "active"]
    if not active_goals:
        return 100.0, "positive", "All savings goals completed"

    average_progress = sum(min(g.progress_percent, 100.0) for g in active_goals) / len(active_goals)
    if average_progress >= 60:
        return average_progress, "positive", "Savings goals are progressing well"
    return average_progress, "warning", "Some savings goals are falling behind"


def _category_spike_insight(df_current, df_previous) -> HealthInsight | None:
    """Biggest category with a >=15% expense increase vs. the prior month (PRD section 28 example)."""
    current = {item["name"]: item["amount"] for item in calculate_category_breakdown(df_current, "expense")}
    previous = {item["name"]: item["amount"] for item in calculate_category_breakdown(df_previous, "expense")}

    biggest: tuple[str, float] | None = None
    for name, current_amount in current.items():
        previous_amount = previous.get(name, 0.0)
        if previous_amount <= 0:
            continue
        pct_change = (current_amount - previous_amount) / previous_amount * 100
        if pct_change >= _CATEGORY_SPIKE_THRESHOLD_PERCENT:
            if biggest is None or pct_change > biggest[1]:
                biggest = (name, pct_change)

    if biggest is None:
        return None
    name, pct_change = biggest
    return HealthInsight(status="warning", message=f"{name} spending increased {pct_change:.0f}%")


def _goal_behind_insight(goals: list, as_of: date_type) -> "HealthInsight | None":
    candidates = [
        g
        for g in goals
        if g.status == "active"
        and g.progress_percent < _GOAL_BEHIND_PROGRESS_THRESHOLD
        and (g.target_date - as_of).days <= _GOAL_BEHIND_DAYS_WINDOW
    ]
    if not candidates:
        return None
    nearest = min(candidates, key=lambda g: g.target_date)
    return HealthInsight(status="warning", message=f"{nearest.name} is below target")


def calculate_financial_health(db: Session, user_id: int) -> FinancialHealthOut:
    today = date_type.today()
    month_start, month_end = _month_bounds(today.year, today.month)
    prev_year, prev_month = _previous_month(today.year, today.month)
    prev_start, prev_end = _month_bounds(prev_year, prev_month)

    current_df = _transactions_dataframe(db, user_id, month_start, month_end)
    previous_df = _transactions_dataframe(db, user_id, prev_start, prev_end)
    overview = calculate_overview(current_df)
    trends = calculate_monthly_trends(db, user_id, months=6)
    budgets = budget_service.get_budgets(db, user_id, today.month, today.year)
    goals = goal_service.get_goals(db, user_id)

    factor_results = {
        "Savings Rate": _score_savings_rate(overview["savings_rate"]),
        "Budget Adherence": _score_budget_adherence(budgets),
        "Expense Stability": _score_expense_stability(trends),
        "Goal Progress": _score_goal_progress(goals),
        "Income/Expense Ratio": _score_income_expense_ratio(overview["income"], overview["expenses"]),
    }

    factors = [
        HealthFactor(
            name=name,
            weight=FACTOR_WEIGHTS[name],
            score=round(score, 2),
            status=status,
            message=message,
        )
        for name, (score, status, message) in factor_results.items()
    ]

    overall_score = round(
        sum(score * FACTOR_WEIGHTS[name] / 100 for name, (score, _, _) in factor_results.items())
    )
    overall_score = max(0, min(overall_score, 100))

    if overall_score >= 80:
        label = "Excellent"
    elif overall_score >= 60:
        label = "Good"
    elif overall_score >= 40:
        label = "Fair"
    else:
        label = "Needs attention"

    insights = []
    spike = _category_spike_insight(current_df, previous_df)
    if spike:
        insights.append(spike)
    behind = _goal_behind_insight(goals, today)
    if behind:
        insights.append(behind)

    return FinancialHealthOut(score=overall_score, label=label, factors=factors, insights=insights)
