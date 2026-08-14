from datetime import date as date_type

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate


def _validate_category(db: Session, user_id: int, category_id: int, txn_type: str) -> None:
    """
    A category_id must belong to the current user and match the
    transaction's type (an expense can't be filed under an income
    category and vice versa).
    """
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
            detail=f"Category '{category.name}' is a {category.type} category and cannot be used for a {txn_type} transaction",
        )


def get_transactions(
    db: Session,
    user_id: int,
    start_date: date_type | None = None,
    end_date: date_type | None = None,
    txn_type: str | None = None,
    category_id: int | None = None,
) -> list[Transaction]:
    stmt = select(Transaction).where(Transaction.user_id == user_id)

    if start_date is not None and end_date is not None:
        stmt = stmt.where(Transaction.date.between(start_date, end_date))
    if txn_type is not None:
        stmt = stmt.where(Transaction.type == txn_type)
    if category_id is not None:
        stmt = stmt.where(Transaction.category_id == category_id)

    stmt = stmt.order_by(Transaction.date.desc())
    return list(db.execute(stmt).scalars().all())


def get_transaction_or_404(db: Session, user_id: int, transaction_id: int) -> Transaction:
    """
    Scoped to user_id: a transaction ID belonging to another user returns
    404 rather than leaking its existence (PRD section 42).
    """
    stmt = select(Transaction).where(
        Transaction.id == transaction_id, Transaction.user_id == user_id
    )
    transaction = db.execute(stmt).scalar_one_or_none()
    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction not found for this id :: {transaction_id}",
        )
    return transaction


def create_transaction(
    db: Session, user_id: int, transaction_in: TransactionCreate
) -> Transaction:
    if transaction_in.category_id is not None:
        _validate_category(db, user_id, transaction_in.category_id, transaction_in.type)

    transaction = Transaction(user_id=user_id, **transaction_in.model_dump())
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def update_transaction(
    db: Session, user_id: int, transaction_id: int, transaction_in: TransactionUpdate
) -> Transaction:
    transaction = get_transaction_or_404(db, user_id, transaction_id)

    if transaction_in.category_id is not None:
        _validate_category(db, user_id, transaction_in.category_id, transaction_in.type)

    for field, value in transaction_in.model_dump().items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction(db: Session, user_id: int, transaction_id: int) -> bool:
    transaction = get_transaction_or_404(db, user_id, transaction_id)
    db.delete(transaction)
    db.commit()
    return True
