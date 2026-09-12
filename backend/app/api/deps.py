from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.services.ai_client import AIClient

get_db_session = get_db

# Expects `Authorization: Bearer <token>`, matching the PRD's protected
# route spec (section 42).
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db_session),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise unauthorized

    user = db.get(User, int(user_id))
    if user is None:
        raise unauthorized

    return user


def get_ai_client() -> AIClient:
    """
    Real Ollama-backed client for production. Tests override this via
    app.dependency_overrides with a fake implementing the same .chat()
    interface, so no test depends on Ollama actually running (PRD
    section 48: "Mock Ollama responses during automated tests").
    """
    return AIClient(base_url=settings.ollama_base_url, model=settings.ollama_model)
