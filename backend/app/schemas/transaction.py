from datetime import date as date_type
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

TransactionType = Literal["income", "expense"]
PaymentMethod = Literal["Cash", "UPI", "Credit Card", "Debit Card", "Bank Transfer", "Other"]


class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0, description="Amount must be greater than zero")
    type: TransactionType
    category_id: int | None = None
    description: str = Field(..., min_length=1, max_length=255)
    date: date_type
    payment_method: PaymentMethod | None = None
    notes: str | None = Field(default=None, max_length=500)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(TransactionBase):
    pass


class TransactionOut(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
