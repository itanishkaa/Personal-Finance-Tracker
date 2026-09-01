from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.category import Category
from app.models.recurring import RecurringTransaction
from app.schemas.recurring import RecurringCreate, RecurringOut, RecurringUpdate

# Average conversions so commitments of any frequency can be compared and
# summed on a common monthly basis (PRD section 26). 365.25/12 and 52/12
# account for leap years and the fact that 52 weeks isn't exactly a year.
_MONTHLY_FACTORS = {
    "daily": 365.25 / 12,
    "weekly": 52 / 12,
    "monthly": 1.0,
    "yearly": 1 / 12,
}


def _monthly_equivalent(amount: float, frequency: str) -> float:
    return amount * _MONTHLY_FACTORS[frequency]


def _validate_category(db: Session, user_id: int, category_id: int, txn_type: str) -> Category:
    category = db.execute(
        select(Category).where(Category.id == category_id, Category.user_id == user_id)
    ).scalar_one_or_none()

    if category is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category not found for this id :: {category_id}",
        )
    if category.type != txn_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category.name}' is a {category.type} category and cannot be used for a {txn_type} recurring transaction",
        )
    return category


def _to_recurring_out(recurring: RecurringTransaction) -> RecurringOut:
    return RecurringOut(
        id=recurring.id,
        category_id=recurring.category_id,
        category_name=recurring.category.name if recurring.category else None,
        category_icon=recurring.category.icon if recurring.category else None,
        amount=recurring.amount,
        type=recurring.type,
        description=recurring.description,
        frequency=recurring.frequency,
        next_date=recurring.next_date,
        active=recurring.active,
        monthly_equivalent=_monthly_equivalent(recurring.amount, recurring.frequency),
        created_at=recurring.created_at,
        updated_at=recurring.updated_at,
    )


def get_recurring(db: Session, user_id: int) -> list[RecurringOut]:
    stmt = (
        select(RecurringTransaction)
        .where(RecurringTransaction.user_id == user_id)
        .options(joinedload(RecurringTransaction.category))
        .order_by(RecurringTransaction.next_date.asc())
    )
    items = db.execute(stmt).scalars().all()
    return [_to_recurring_out(r) for r in items]


def _get_recurring_or_404(db: Session, user_id: int, recurring_id: int) -> RecurringTransaction:
    stmt = (
        select(RecurringTransaction)
        .where(RecurringTransaction.id == recurring_id, RecurringTransaction.user_id == user_id)
        .options(joinedload(RecurringTransaction.category))
    )
    recurring = db.execute(stmt).scalar_one_or_none()
    if recurring is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recurring transaction not found for this id :: {recurring_id}",
        )
    return recurring


def create_recurring(db: Session, user_id: int, recurring_in: RecurringCreate) -> RecurringOut:
    if recurring_in.category_id is not None:
        _validate_category(db, user_id, recurring_in.category_id, recurring_in.type)

    recurring = RecurringTransaction(user_id=user_id, **recurring_in.model_dump())
    db.add(recurring)
    db.commit()
    db.refresh(recurring)
    return _to_recurring_out(recurring)


def update_recurring(
    db: Session, user_id: int, recurring_id: int, recurring_in: RecurringUpdate
) -> RecurringOut:
    recurring = _get_recurring_or_404(db, user_id, recurring_id)

    if recurring_in.category_id is not None:
        _validate_category(db, user_id, recurring_in.category_id, recurring_in.type)

    for field, value in recurring_in.model_dump().items():
        setattr(recurring, field, value)

    db.commit()
    db.refresh(recurring)
    return _to_recurring_out(recurring)


def delete_recurring(db: Session, user_id: int, recurring_id: int) -> bool:
    recurring = _get_recurring_or_404(db, user_id, recurring_id)
    db.delete(recurring)
    db.commit()
    return True
