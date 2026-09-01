from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_session
from app.models.user import User
from app.schemas.recurring import RecurringCreate, RecurringOut, RecurringUpdate
from app.services import recurring_service

router = APIRouter(prefix="/api/v1/recurring", tags=["recurring"])


@router.get("", response_model=list[RecurringOut])
def get_recurring(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return recurring_service.get_recurring(db, current_user.id)


@router.post("", response_model=RecurringOut, status_code=201)
def create_recurring(
    recurring_in: RecurringCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return recurring_service.create_recurring(db, current_user.id, recurring_in)


@router.put("/{recurring_id}", response_model=RecurringOut)
def update_recurring(
    recurring_id: int,
    recurring_in: RecurringUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return recurring_service.update_recurring(db, current_user.id, recurring_id, recurring_in)


@router.delete("/{recurring_id}")
def delete_recurring(
    recurring_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    deleted = recurring_service.delete_recurring(db, current_user.id, recurring_id)
    return {"deleted": deleted}
