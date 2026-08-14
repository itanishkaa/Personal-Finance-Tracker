from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_categories(db: Session, user_id: int) -> list[Category]:
    stmt = select(Category).where(Category.user_id == user_id).order_by(Category.name)
    return list(db.execute(stmt).scalars().all())


def get_category_or_404(db: Session, user_id: int, category_id: int) -> Category:
    """
    Scoped to user_id so a category ID belonging to another user returns
    404 rather than leaking its existence.
    """
    stmt = select(Category).where(
        Category.id == category_id, Category.user_id == user_id
    )
    category = db.execute(stmt).scalar_one_or_none()
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category not found for this id :: {category_id}",
        )
    return category


def create_category(db: Session, user_id: int, category_in: CategoryCreate) -> Category:
    category = Category(user_id=user_id, **category_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(
    db: Session, user_id: int, category_id: int, category_in: CategoryUpdate
) -> Category:
    category = get_category_or_404(db, user_id, category_id)
    category.name = category_in.name
    category.type = category_in.type
    category.icon = category_in.icon
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, user_id: int, category_id: int) -> bool:
    category = get_category_or_404(db, user_id, category_id)
    db.delete(category)
    db.commit()
    return True
