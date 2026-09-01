from datetime import date as date_type
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

RecurringType = Literal["income", "expense"]
RecurringFrequency = Literal["daily", "weekly", "monthly", "yearly"]


class RecurringBase(BaseModel):
    category_id: int | None = None
    amount: float = Field(..., gt=0, description="Amount must be greater than zero")
    type: RecurringType
    description: str = Field(..., min_length=1, max_length=255)
    frequency: RecurringFrequency
    next_date: date_type
    active: bool = True


class RecurringCreate(RecurringBase):
    pass


class RecurringUpdate(RecurringBase):
    pass


class RecurringOut(RecurringBase):
    """
    monthly_equivalent is computed at read time (never stored) - it's what
    this commitment works out to per month regardless of its actual
    frequency, so a weekly and a yearly commitment can be compared and
    summed on the same basis (PRD section 26).
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    category_name: str | None
    category_icon: str | None
    monthly_equivalent: float
    created_at: datetime
    updated_at: datetime
