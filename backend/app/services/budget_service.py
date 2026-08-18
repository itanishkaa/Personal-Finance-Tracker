import calendar
from datetime import date as date_type

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.budget import Budget
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.budget import BudgetCreate, BudgetOut, BudgetStatus, BudgetUpdate


def _month_bounds(month: int, year: int) -> tuple[date_type, date_type]:
    last_day = calendar.monthrange(year, month)[1]
    return date_type(year, month, 1), date_type(year, month, last_day)


def _calculate_status(percent_used: float) -> BudgetStatus:
    """Thresholds per PRD section 20."""
    if percent_used > 100:
        return "over_budget"
    if percent_used >= 90:
        return "near_limit"
    if percent_used >= 70:
        return "warning"
    return "healthy"


def _calculate_alert_message(
    category_name: str, percent_used: float, budget_status: BudgetStatus
) -> str | None:
    """Alert copy per PRD section 21 - only surfaced at/above the warning threshold."""
    if budget_status == "over_budget":
        return f"⚠️ You've exceeded your {category_name} budget ({percent_used:.0f}% used)."
    if budget_status in ("near_limit", "warning"):
        return f"⚠️ You've used {percent_used:.0f}% of your {category_name} budget."
    return None


def _calculate_spent(db: Session, user_id: int, category_id: int, month: int, year: int) -> float:
    start, end = _month_bounds(month, year)
    stmt = select(Transaction.amount).where(
        Transaction.user_id == user_id,
        Transaction.category_id == category_id,
        Transaction.type == "expense",
        Transaction.date.between(start, end),
    )
    return sum(db.execute(stmt).scalars().all())


def _to_budget_out(db: Session, budget: Budget) -> BudgetOut:
    spent = _calculate_spent(db, budget.user_id, budget.category_id, budget.month, budget.year)
    remaining = budget.amount - spent
    percent_used = (spent / budget.amount * 100) if budget.amount > 0 else 0.0
    budget_status = _calculate_status(percent_used)
    alert_message = _calculate_alert_message(budget.category.name, percent_used, budget_status)

    return BudgetOut(
        id=budget.id,
        category_id=budget.category_id,
        category_name=budget.category.name,
        category_icon=budget.category.icon,
        amount=budget.amount,
        month=budget.month,
        year=budget.year,
        spent=spent,
        remaining=remaining,
        percent_used=percent_used,
        status=budget_status,
        alert_message=alert_message,
        created_at=budget.created_at,
        updated_at=budget.updated_at,
    )


def _validate_expense_category(db: Session, user_id: int, category_id: int) -> Category:
    category = db.execute(
        select(Category).where(Category.id == category_id, Category.user_id == user_id)
    ).scalar_one_or_none()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category not found for this id :: {category_id}",
        )
    if category.type != "expense":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category.name}' is an income category and cannot have a budget",
        )
    return category


def _ensure_no_duplicate_period(
    db: Session,
    user_id: int,
    category_id: int,
    month: int,
    year: int,
    exclude_budget_id: int | None = None,
) -> None:
    stmt = select(Budget).where(
        Budget.user_id == user_id,
        Budget.category_id == category_id,
        Budget.month == month,
        Budget.year == year,
    )
    if exclude_budget_id is not None:
        stmt = stmt.where(Budget.id != exclude_budget_id)

    if db.execute(stmt).scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A budget for this category already exists for {month}/{year}",
        )


def get_budgets(
    db: Session, user_id: int, month: int | None = None, year: int | None = None
) -> list[BudgetOut]:
    stmt = (
        select(Budget)
        .where(Budget.user_id == user_id)
        .options(joinedload(Budget.category))
    )
    if month is not None:
        stmt = stmt.where(Budget.month == month)
    if year is not None:
        stmt = stmt.where(Budget.year == year)
    stmt = stmt.order_by(Budget.year.desc(), Budget.month.desc())

    budgets = db.execute(stmt).scalars().all()
    return [_to_budget_out(db, b) for b in budgets]


def _get_budget_or_404(db: Session, user_id: int, budget_id: int) -> Budget:
    stmt = (
        select(Budget)
        .where(Budget.id == budget_id, Budget.user_id == user_id)
        .options(joinedload(Budget.category))
    )
    budget = db.execute(stmt).scalar_one_or_none()
    if budget is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget not found for this id :: {budget_id}",
        )
    return budget


def create_budget(db: Session, user_id: int, budget_in: BudgetCreate) -> BudgetOut:
    _validate_expense_category(db, user_id, budget_in.category_id)
    _ensure_no_duplicate_period(
        db, user_id, budget_in.category_id, budget_in.month, budget_in.year
    )

    budget = Budget(user_id=user_id, **budget_in.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return _to_budget_out(db, budget)


def update_budget(
    db: Session, user_id: int, budget_id: int, budget_in: BudgetUpdate
) -> BudgetOut:
    budget = _get_budget_or_404(db, user_id, budget_id)
    _validate_expense_category(db, user_id, budget_in.category_id)
    _ensure_no_duplicate_period(
        db,
        user_id,
        budget_in.category_id,
        budget_in.month,
        budget_in.year,
        exclude_budget_id=budget_id,
    )

    for field, value in budget_in.model_dump().items():
        setattr(budget, field, value)

    db.commit()
    db.refresh(budget)
    return _to_budget_out(db, budget)


def delete_budget(db: Session, user_id: int, budget_id: int) -> bool:
    budget = _get_budget_or_404(db, user_id, budget_id)
    db.delete(budget)
    db.commit()
    return True
