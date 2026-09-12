"""
The three AI-powered features from PRD sections 29-33: free-form Q&A,
transaction categorization, and periodic insights. Every prompt embeds
only the pre-aggregated context from ai_context_service - never raw
transaction rows - and every LLM response is treated as untrusted input:
JSON is parsed defensively, and category suggestions are matched against
the user's real categories before a category_id is ever returned.
"""

import json

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.schemas.ai import CategorizeOut, ChatOut, InsightsOut
from app.services import category_service
from app.services.ai_client import AIClient, AIServiceError
from app.services.ai_context_service import build_financial_context

_UNAVAILABLE_DETAIL = "The AI assistant is currently unavailable. Please try again shortly."

_CHAT_SYSTEM_PROMPT = (
    "You are FinTrack's financial assistant. Answer the user's question about "
    "their personal finances using ONLY the financial summary provided below - "
    "never invent figures that aren't in it. If the summary doesn't contain "
    "enough information to answer, say so plainly. Be concise (2-4 sentences), "
    "use ₹ for currency, and speak directly to the user in second person.\n\n"
    "Financial summary (JSON):\n{context}"
)

_CATEGORIZE_SYSTEM_PROMPT = (
    "You categorize personal finance transactions for an expense tracker. "
    "Given a transaction description, pick the single best-matching category "
    "from this exact list (respond with the category name exactly as written, "
    "no others): {categories}\n\n"
    'Respond with STRICT JSON only, no other text, in the form: '
    '{{"category": "<exact category name from the list>", "confidence": <integer 0-100>}}'
)

_INSIGHTS_SYSTEM_PROMPT = (
    "You are FinTrack's financial assistant. Based ONLY on the financial summary "
    "below, write up to 3 short, actionable insights about the user's spending "
    "this month - similar in style to: \"Your spending increased 14.6% this month. "
    "Food and Shopping contributed most to the increase.\" Use ₹ for currency. "
    "If there isn't enough data to say anything meaningful, return an empty list.\n\n"
    'Respond with STRICT JSON only, no other text, in the form: '
    '{{"insights": ["...", "..."]}}\n\n'
    "Financial summary (JSON):\n{context}"
)


def _call_ai_or_503(ai_client: AIClient, system_prompt: str, user_message: str, json_mode: bool) -> str:
    try:
        return ai_client.chat(system_prompt, user_message, json_mode=json_mode)
    except AIServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=_UNAVAILABLE_DETAIL
        ) from exc


def answer_question(db: Session, user_id: int, ai_client: AIClient, question: str) -> ChatOut:
    context = build_financial_context(db, user_id)
    system_prompt = _CHAT_SYSTEM_PROMPT.format(context=json.dumps(context))
    response_text = _call_ai_or_503(ai_client, system_prompt, question, json_mode=False)
    return ChatOut(response=response_text.strip())


def categorize_transaction(
    db: Session, user_id: int, ai_client: AIClient, description: str, txn_type: str
) -> CategorizeOut:
    all_categories = category_service.get_categories(db, user_id)
    candidates = [c for c in all_categories if c.type == txn_type]
    if not candidates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No {txn_type} categories exist yet to categorize against",
        )

    category_names = [c.name for c in candidates]
    system_prompt = _CATEGORIZE_SYSTEM_PROMPT.format(categories=", ".join(category_names))
    raw = _call_ai_or_503(ai_client, system_prompt, description, json_mode=True)

    suggested_name = ""
    confidence = 0.0
    try:
        parsed = json.loads(raw)
        suggested_name = str(parsed.get("category", "")).strip()
        confidence = float(parsed.get("confidence", 0))
    except (json.JSONDecodeError, TypeError, ValueError):
        pass  # fall through with empty suggestion below - never crash on a bad LLM response

    confidence = max(0.0, min(confidence, 100.0))

    # Never trust the LLM's suggestion directly - only ever return a
    # category_id that's a real, exact match among this user's own
    # categories of the right type.
    match = next((c for c in candidates if c.name.lower() == suggested_name.lower()), None)

    return CategorizeOut(
        category_id=match.id if match else None,
        category_name=match.name if match else (suggested_name or None),
        confidence=confidence,
    )


def generate_insights(db: Session, user_id: int, ai_client: AIClient) -> InsightsOut:
    context = build_financial_context(db, user_id)
    system_prompt = _INSIGHTS_SYSTEM_PROMPT.format(context=json.dumps(context))
    raw = _call_ai_or_503(ai_client, system_prompt, "Generate insights.", json_mode=True)

    insights: list[str] = []
    try:
        parsed = json.loads(raw)
        insights = [str(i) for i in parsed.get("insights", []) if str(i).strip()][:5]
    except (json.JSONDecodeError, TypeError, ValueError):
        pass  # a malformed response just yields no insights, never a 500

    return InsightsOut(insights=insights)
