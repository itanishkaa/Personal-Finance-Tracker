from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_session
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetOut, BudgetUpdate
from app.services import budget_service

router = APIRouter(prefix="/api/v1/budgets", tags=["budgets"])


@router.get("", response_model=list[BudgetOut])
def get_budgets(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2000, le=2100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return budget_service.get_budgets(db, current_user.id, month, year)


@router.post("", response_model=BudgetOut, status_code=201)
def create_budget(
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return budget_service.create_budget(db, current_user.id, budget_in)


@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(
    budget_id: int,
    budget_in: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return budget_service.update_budget(db, current_user.id, budget_id, budget_in)


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    deleted = budget_service.delete_budget(db, current_user.id, budget_id)
    return {"deleted": deleted}
