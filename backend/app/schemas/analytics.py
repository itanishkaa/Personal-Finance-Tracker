from typing import Literal

from pydantic import BaseModel

Granularity = Literal["weekly", "monthly", "yearly"]


class OverviewOut(BaseModel):
    income: float
    expenses: float
    balance: float
    savings_rate: float  # percentage, 0 if income is 0


class CashflowPoint(BaseModel):
    period: str  # e.g. "2026-08" for monthly, "2026-W33" for weekly, "2026" for yearly
    income: float
    expense: float


class CategoryBreakdownItem(BaseModel):
    category_id: int | None
    name: str
    icon: str | None
    amount: float
    percentage: float  # of total for that transaction type, 0-100


class PaymentMethodTotal(BaseModel):
    payment_method: str
    amount: float


class MonthOverMonthOut(BaseModel):
    current_month: str  # "2026-08"
    previous_month: str  # "2026-07"
    current_total: float
    previous_total: float
    change_percent: float | None  # None if previous_total is 0 (undefined % change)
    top_contributors: list[CategoryBreakdownItem]  # categories driving the change


class SpendingAnalyticsOut(BaseModel):
    total_spending: float
    average_daily_spending: float
    highest_category: CategoryBreakdownItem | None
    lowest_category: CategoryBreakdownItem | None
    by_payment_method: list[PaymentMethodTotal]
    month_over_month: MonthOverMonthOut


class MonthlyTrendPoint(BaseModel):
    month: str  # "2026-08"
    income: float
    expenses: float
    savings: float
