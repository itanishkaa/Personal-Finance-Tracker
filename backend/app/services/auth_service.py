from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.category import Category
from app.models.user import User
from app.schemas.auth import UserLogin, UserRegister
from app.services.default_categories import (
    DEFAULT_EXPENSE_CATEGORIES,
    DEFAULT_INCOME_CATEGORIES,
)


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.execute(select(User).where(User.email == email)).scalar_one_or_none()


def register_user(db: Session, user_in: UserRegister) -> User:
    if get_user_by_email(db, user_in.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=hash_password(user_in.password),
    )
    db.add(user)
    db.flush()  # assigns user.id without committing yet

    # Seed default categories so the user has something to categorize
    # transactions with immediately after registering.
    for icon, name in DEFAULT_EXPENSE_CATEGORIES:
        db.add(Category(user_id=user.id, name=name, type="expense", icon=icon))
    for icon, name in DEFAULT_INCOME_CATEGORIES:
        db.add(Category(user_id=user.id, name=name, type="income", icon=icon))

    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, credentials: UserLogin) -> str:
    """Verifies credentials and returns a signed access token."""
    user = get_user_by_email(db, credentials.email)
    if user is None or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    return create_access_token(subject=str(user.id))
