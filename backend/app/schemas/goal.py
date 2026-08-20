from datetime import date as date_type
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

GoalStatus = Literal["active", "completed"]


class GoalBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    target_amount: float = Field(..., gt=0, description="Target amount must be greater than zero")
    target_date: date_type


class GoalCreate(GoalBase):
    current_amount: float = Field(default=0.0, ge=0)


class GoalUpdate(GoalBase):
    """
    Deliberately excludes current_amount - contributions are the only way
    to move that figure (POST /goals/{id}/contribute), so editing a goal
    can't silently overwrite progress someone has already logged.
    """

    pass


class GoalContribution(BaseModel):
    amount: float = Field(..., gt=0, description="Contribution must be greater than zero")


class GoalOut(GoalBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    current_amount: float
    remaining_amount: float
    progress_percent: float
    status: GoalStatus
    created_at: datetime
    updated_at: datetime
