from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_session
from app.models.user import User
from app.schemas.auth import Token, UserLogin, UserOut, UserRegister
from app.services import auth_service

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
def register(user_in: UserRegister, db: Session = Depends(get_db_session)):
    return auth_service.register_user(db, user_in)


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db_session)):
    access_token = auth_service.authenticate_user(db, credentials)
    return Token(access_token=access_token)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
