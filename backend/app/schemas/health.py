from typing import Literal

from pydantic import BaseModel, Field

HealthStatus = Literal["positive", "warning"]


class HealthFactor(BaseModel):
    """One of the five weighted components of the overall score (PRD section 27)."""

    name: str
    weight: float = Field(..., description="Percentage weight of this factor in the overall score")
    score: float = Field(..., description="0-100 sub-score for this factor alone")
    status: HealthStatus
    message: str


class HealthInsight(BaseModel):
    """
    Supplementary, non-weighted observations (e.g. a category spending
    spike, a goal falling behind) - PRD section 28's warning examples that
    aren't themselves one of the five scored factors.
    """

    status: HealthStatus
    message: str


class FinancialHealthOut(BaseModel):
    score: int = Field(..., ge=0, le=100)
    label: str
    factors: list[HealthFactor]
    insights: list[HealthInsight]
