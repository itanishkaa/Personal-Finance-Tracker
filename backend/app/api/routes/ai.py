from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_ai_client, get_current_user, get_db_session
from app.models.user import User
from app.schemas.ai import CategorizeIn, CategorizeOut, ChatIn, ChatOut, InsightsOut
from app.services import ai_service
from app.services.ai_client import AIClient

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@router.post("/chat", response_model=ChatOut)
def chat(
    payload: ChatIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
    ai_client: AIClient = Depends(get_ai_client),
):
    return ai_service.answer_question(db, current_user.id, ai_client, payload.message)


@router.post("/categorize", response_model=CategorizeOut)
def categorize(
    payload: CategorizeIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
    ai_client: AIClient = Depends(get_ai_client),
):
    return ai_service.categorize_transaction(
        db, current_user.id, ai_client, payload.description, payload.type
    )


@router.post("/insights", response_model=InsightsOut)
def insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
    ai_client: AIClient = Depends(get_ai_client),
):
    return ai_service.generate_insights(db, current_user.id, ai_client)
