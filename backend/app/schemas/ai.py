from typing import Literal

from pydantic import BaseModel, Field

TransactionTypeForCategorization = Literal["income", "expense"]


class ChatIn(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)


class ChatOut(BaseModel):
    response: str


class CategorizeIn(BaseModel):
    description: str = Field(..., min_length=1, max_length=255)
    type: TransactionTypeForCategorization = "expense"


class CategorizeOut(BaseModel):
    """
    category_id is only ever a real category the user owns, or None - the
    LLM's raw suggestion is matched against the user's actual categories
    server-side (see app/services/ai_service.py) rather than trusted
    directly, since it's free-text and could hallucinate a name that isn't
    a real category.
    """

    category_id: int | None
    category_name: str | None
    confidence: float = Field(..., ge=0, le=100)


class InsightsOut(BaseModel):
    insights: list[str]
