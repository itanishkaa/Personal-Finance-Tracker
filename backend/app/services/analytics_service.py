"""
Analytics engine (PRD section 36). All calculations run on a Pandas
DataFrame built from the user's transactions, joined with their category
info. Function names deliberately mirror the PRD's spec:

    calculate_overview()
    calculate_cashflow()
    calculate_category_breakdown()
    calculate_savings_rate()   (folded into calculate_overview)
    calculate_monthly_trends()

Every function here is a pure function over a DataFrame - the only
thing that touches the database is `_transactions_dataframe`, which
keeps the calculations themselves easy to unit test.
"""

from calendar import monthrange
from datetime import date as date_type

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.transaction import Transaction

TRANSACTION_COLUMNS = [
    "date",
    "type",
    "amount",
    "category_id",
    "category_name",
    "category_icon",
    "payment_method",
]


def _empty_transactions_df() -> pd.DataFrame:
    df = pd.DataFrame(columns=TRANSACTION_COLUMNS)
    df["date"] = pd.to_datetime(df["date"])
    df["amount"] = df["amount"].astype(float)
    return df


def _transactions_dataframe(
    db: Session,
    user_id: int,
    start_date: date_type | None = None,
    end_date: date_type | None = None,
) -> pd.DataFrame:
    """
    Loads a user's transactions (optionally date-bounded) into a DataFrame,
    left-joined against their category for name/icon.
    """
    stmt = (
        select(
            Transaction.date,
            Transaction.type,
            Transaction.amount,
            Transaction.category_id,
            Category.name.label("category_name"),
            Category.icon.label("category_icon"),
            Transaction.payment_method,
        )
        .outerjoin(Category, Transaction.category_id == Category.id)
        .where(Transaction.user_id == user_id)
    )
    if start_date is not None and end_date is not None:
        stmt = stmt.where(Transaction.date.between(start_date, end_date))

    rows = db.execute(stmt).all()
    if not rows:
        return _empty_transactions_df()

    df = pd.DataFrame(rows, columns=TRANSACTION_COLUMNS)
    df["date"] = pd.to_datetime(df["date"])
    df["amount"] = df["amount"].astype(float)
    df["category_name"] = df["category_name"].fillna("Uncategorized")
    return df


def calculate_overview(df: pd.DataFrame) -> dict:
    """Income, expenses, balance, and savings rate for the given period."""
    income = float(df.loc[df["type"] == "income", "amount"].sum())
    expenses = float(df.loc[df["type"] == "expense", "amount"].sum())
    balance = income - expenses
    savings_rate = (balance / income * 100) if income > 0 else 0.0
    return {
        "income": income,
        "expenses": expenses,
        "balance": balance,
        "savings_rate": round(savings_rate, 2),
    }


def calculate_cashflow(df: pd.DataFrame, granularity: str) -> list[dict]:
    """
    Income vs. expense totals bucketed by period. `granularity` is
    "weekly", "monthly", or "yearly" (PRD section 14).
    """
    if df.empty:
        return []

    working = df.copy()

    if granularity == "weekly":
        iso = working["date"].dt.isocalendar()
        working["period"] = iso["year"].astype(str) + "-W" + iso["week"].astype(str).str.zfill(2)
    elif granularity == "yearly":
        working["period"] = working["date"].dt.year.astype(str)
    else:  # monthly (default)
        working["period"] = working["date"].dt.to_period("M").astype(str)

    grouped = (
        working.groupby(["period", "type"])["amount"]
        .sum()
        .unstack(fill_value=0.0)
        .reindex(columns=["income", "expense"], fill_value=0.0)
        .reset_index()
        .sort_values("period")
    )

    return [
        {"period": row["period"], "income": float(row["income"]), "expense": float(row["expense"])}
        for _, row in grouped.iterrows()
    ]


def calculate_category_breakdown(df: pd.DataFrame, txn_type: str) -> list[dict]:
    """
    Per-category totals and percentage share for one transaction type,
    sorted descending by amount (PRD section 16).
    """
    subset = df[df["type"] == txn_type]
    if subset.empty:
        return []

    total = subset["amount"].sum()
    grouped = (
        subset.groupby(["category_id", "category_name", "category_icon"], dropna=False)["amount"]
        .sum()
        .reset_index()
        .sort_values("amount", ascending=False)
    )

    results = []
    for _, row in grouped.iterrows():
        amount = float(row["amount"])
        category_id = row["category_id"]
        results.append(
            {
                "category_id": int(category_id) if pd.notna(category_id) else None,
                "name": row["category_name"],
                "icon": row["category_icon"] if pd.notna(row["category_icon"]) else None,
                "amount": amount,
                "percentage": round((amount / total * 100) if total > 0 else 0.0, 2),
            }
        )
    return results


def _month_bounds(year: int, month: int) -> tuple[date_type, date_type]:
    last_day = monthrange(year, month)[1]
    return date_type(year, month, 1), date_type(year, month, last_day)


def _previous_month(year: int, month: int) -> tuple[int, int]:
    return (year - 1, 12) if month == 1 else (year, month - 1)


def calculate_month_over_month(
    db: Session, user_id: int, as_of: date_type | None = None
) -> dict:
    """
    Compares the current calendar month's spending to the previous one,
    and surfaces which categories drove the change (PRD section 18).
    """
    today = as_of or date_type.today()
    curr_start, curr_end = _month_bounds(today.year, today.month)
    prev_year, prev_month = _previous_month(today.year, today.month)
    prev_start, prev_end = _month_bounds(prev_year, prev_month)

    current_df = _transactions_dataframe(db, user_id, curr_start, curr_end)
    previous_df = _transactions_dataframe(db, user_id, prev_start, prev_end)

    current_total = float(current_df.loc[current_df["type"] == "expense", "amount"].sum())
    previous_total = float(previous_df.loc[previous_df["type"] == "expense", "amount"].sum())

    change_percent = (
        round((current_total - previous_total) / previous_total * 100, 2)
        if previous_total > 0
        else None
    )

    current_breakdown = {
        item["category_id"]: item for item in calculate_category_breakdown(current_df, "expense")
    }
    previous_breakdown = {
        item["category_id"]: item for item in calculate_category_breakdown(previous_df, "expense")
    }

    deltas = []
    for category_id, item in current_breakdown.items():
        previous_amount = previous_breakdown.get(category_id, {}).get("amount", 0.0)
        deltas.append((item, item["amount"] - previous_amount))

    # Only surface categories that actually grew, largest increase first.
    top_contributors = [
        item for item, delta in sorted(deltas, key=lambda x: x[1], reverse=True) if delta > 0
    ][:3]

    return {
        "current_month": curr_start.strftime("%Y-%m"),
        "previous_month": prev_start.strftime("%Y-%m"),
        "current_total": current_total,
        "previous_total": previous_total,
        "change_percent": change_percent,
        "top_contributors": top_contributors,
    }


def calculate_spending_analytics(
    db: Session,
    user_id: int,
    start_date: date_type | None,
    end_date: date_type | None,
) -> dict:
    """
    Aggregates total spending, average daily spending, category extremes,
    spending by payment method, and the month-over-month comparison
    (PRD section 15). If no date range is given, defaults to the current
    calendar month.
    """
    if start_date is None or end_date is None:
        today = date_type.today()
        start_date, end_date = _month_bounds(today.year, today.month)

    df = _transactions_dataframe(db, user_id, start_date, end_date)
    expense_df = df[df["type"] == "expense"]

    total_spending = float(expense_df["amount"].sum())
    days_in_range = max((end_date - start_date).days + 1, 1)
    average_daily_spending = round(total_spending / days_in_range, 2)

    breakdown = calculate_category_breakdown(df, "expense")
    highest_category = breakdown[0] if breakdown else None
    lowest_category = breakdown[-1] if breakdown else None

    by_payment_method = []
    if not expense_df.empty:
        grouped = (
            expense_df.assign(payment_method=expense_df["payment_method"].fillna("Unspecified"))
            .groupby("payment_method")["amount"]
            .sum()
            .reset_index()
            .sort_values("amount", ascending=False)
        )
        by_payment_method = [
            {"payment_method": row["payment_method"], "amount": float(row["amount"])}
            for _, row in grouped.iterrows()
        ]

    return {
        "total_spending": total_spending,
        "average_daily_spending": average_daily_spending,
        "highest_category": highest_category,
        "lowest_category": lowest_category,
        "by_payment_method": by_payment_method,
        # Anchored to the requested period (not wall-clock "today"), so a
        # query for a past month compares against the month before it,
        # not against whatever the real current month happens to be.
        "month_over_month": calculate_month_over_month(db, user_id, as_of=end_date),
    }


def calculate_monthly_trends(
    db: Session, user_id: int, months: int = 6, as_of: date_type | None = None
) -> list[dict]:
    """
    Income, expenses, and savings for each of the trailing N calendar
    months, oldest first (PRD section 18/27 groundwork).
    """
    today = as_of or date_type.today()
    year, month = today.year, today.month
    month_starts: list[tuple[int, int]] = []
    for _ in range(months):
        month_starts.append((year, month))
        year, month = _previous_month(year, month)
    month_starts.reverse()

    results = []
    for y, m in month_starts:
        start, end = _month_bounds(y, m)
        df = _transactions_dataframe(db, user_id, start, end)
        overview = calculate_overview(df)
        results.append(
            {
                "month": start.strftime("%Y-%m"),
                "income": overview["income"],
                "expenses": overview["expenses"],
                "savings": overview["balance"],
            }
        )
    return results


def get_overview(
    db: Session, user_id: int, start_date: date_type | None, end_date: date_type | None
) -> dict:
    if start_date is None or end_date is None:
        today = date_type.today()
        start_date, end_date = _month_bounds(today.year, today.month)
    df = _transactions_dataframe(db, user_id, start_date, end_date)
    return calculate_overview(df)


def get_cashflow(
    db: Session,
    user_id: int,
    granularity: str,
    start_date: date_type | None,
    end_date: date_type | None,
) -> list[dict]:
    df = _transactions_dataframe(db, user_id, start_date, end_date)
    return calculate_cashflow(df, granularity)


def get_category_breakdown(
    db: Session,
    user_id: int,
    txn_type: str,
    start_date: date_type | None,
    end_date: date_type | None,
) -> list[dict]:
    if start_date is None or end_date is None:
        today = date_type.today()
        start_date, end_date = _month_bounds(today.year, today.month)
    df = _transactions_dataframe(db, user_id, start_date, end_date)
    return calculate_category_breakdown(df, txn_type)
