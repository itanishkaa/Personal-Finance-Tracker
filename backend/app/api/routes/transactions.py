from datetime import date as date_type

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_session
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionOut, TransactionUpdate
from app.services import transaction_service

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionOut])
def get_transactions(
    startDate: date_type | None = None,
    endDate: date_type | None = None,
    type: str | None = None,
    categoryId: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return transaction_service.get_transactions(
        db, current_user.id, startDate, endDate, type, categoryId
    )


@router.post("", response_model=TransactionOut, status_code=201)
def create_transaction(
    transaction_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return transaction_service.create_transaction(db, current_user.id, transaction_in)


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return transaction_service.get_transaction_or_404(db, current_user.id, transaction_id)


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    transaction_in: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return transaction_service.update_transaction(
        db, current_user.id, transaction_id, transaction_in
    )


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    deleted = transaction_service.delete_transaction(db, current_user.id, transaction_id)
    return {"deleted": deleted}
