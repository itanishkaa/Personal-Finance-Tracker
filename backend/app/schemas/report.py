from datetime import date as date_type

from pydantic import BaseModel


class CategoryAmount(BaseModel):
    name: str
    amount: float


class LargestExpense(BaseModel):
    description: str
    amount: float
    date: date_type
    category_name: str | None


class MonthlyReportOut(BaseModel):
    period: str  # e.g. "August 2026"
    month: int
    year: int
    income: float
    expenses: float
    savings: float
    savings_rate: float
    top_category: CategoryAmount | None
    largest_expense: LargestExpense | None
