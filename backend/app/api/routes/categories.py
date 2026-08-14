from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_session
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.services import category_service

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])


@router.get("", response_model=list[CategoryOut])
def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return category_service.get_categories(db, current_user.id)


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(
    category_in: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return category_service.create_category(db, current_user.id, category_in)


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return category_service.update_category(db, current_user.id, category_id, category_in)


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    deleted = category_service.delete_category(db, current_user.id, category_id)
    return {"deleted": deleted}
