"""
Builds the small, pre-computed "Structured Context" the AI is given
(PRD section 31) - never raw transaction rows, only already-aggregated
summary figures reused from the analytics/budget/goal services built in
earlier phases. This is the boundary that keeps the LLM from ever seeing
more of a user's data than it needs to answer a question.
"""

from datetime import date as date_type

from sqlalchemy.orm import Session

from app.services import analytics_service, budget_service, goal_service


def build_financial_context(db: Session, user_id: int) -> dict:
    today = date_type.today()

    overview = analytics_service.get_overview(db, user_id, None, None)  # defaults to current month
    breakdown = analytics_service.get_category_breakdown(db, user_id, "expense", None, None)
    top_category = breakdown[0] if breakdown else None
    month_over_month = analytics_service.calculate_month_over_month(db, user_id)

    budgets = budget_service.get_budgets(db, user_id, today.month, today.year)
    over_budget_categories = [b.category_name for b in budgets if b.status == "over_budget"]

    goals = goal_service.get_goals(db, user_id)
    active_goals = [g for g in goals if g.status == "active"]
    avg_goal_progress = (
        round(sum(g.progress_percent for g in active_goals) / len(active_goals), 1)
        if active_goals
        else None
    )

    return {
        "monthly_income": overview["income"],
        "monthly_expenses": overview["expenses"],
        "savings_rate": overview["savings_rate"],
        "top_category": top_category["name"] if top_category else None,
        "top_category_spending": top_category["amount"] if top_category else 0.0,
        "month_over_month_change_percent": month_over_month["change_percent"],
        "budgets_over_limit": over_budget_categories,
        "active_goals_count": len(active_goals),
        "goals_avg_progress_percent": avg_goal_progress,
    }
