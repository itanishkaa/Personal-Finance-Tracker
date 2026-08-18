from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

BudgetStatus = Literal["healthy", "warning", "near_limit", "over_budget"]


class BudgetBase(BaseModel):
    category_id: int
    amount: float = Field(..., gt=0, description="Amount must be greater than zero")
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000, le=2100)


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BudgetBase):
    pass


class BudgetOut(BudgetBase):
    """
    Includes usage figures computed at read time from the category's
    expense transactions for that month/year - never stored, so it's
    always current (PRD sections 19-21).
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    category_name: str
    category_icon: str | None
    spent: float
    remaining: float
    percent_used: float
    status: BudgetStatus
    alert_message: str | None
    created_at: datetime
    updated_at: datetime
