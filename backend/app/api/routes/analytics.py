from datetime import date as date_type

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_session
from app.models.user import User
from app.schemas.analytics import (
    CashflowPoint,
    CategoryBreakdownItem,
    Granularity,
    MonthlyTrendPoint,
    OverviewOut,
    SpendingAnalyticsOut,
)
from app.schemas.health import FinancialHealthOut
from app.services import analytics_service, health_service

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


@router.get("/overview", response_model=OverviewOut)
def get_overview(
    startDate: date_type | None = None,
    endDate: date_type | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return analytics_service.get_overview(db, current_user.id, startDate, endDate)


@router.get("/cashflow", response_model=list[CashflowPoint])
def get_cashflow(
    granularity: Granularity = "monthly",
    startDate: date_type | None = None,
    endDate: date_type | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return analytics_service.get_cashflow(db, current_user.id, granularity, startDate, endDate)


@router.get("/categories", response_model=list[CategoryBreakdownItem])
def get_category_breakdown(
    type: str = Query(default="expense", pattern="^(income|expense)$"),
    startDate: date_type | None = None,
    endDate: date_type | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return analytics_service.get_category_breakdown(
        db, current_user.id, type, startDate, endDate
    )


@router.get("/spending", response_model=SpendingAnalyticsOut)
def get_spending_analytics(
    startDate: date_type | None = None,
    endDate: date_type | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return analytics_service.calculate_spending_analytics(
        db, current_user.id, startDate, endDate
    )


@router.get("/trends", response_model=list[MonthlyTrendPoint])
def get_monthly_trends(
    months: int = Query(default=6, ge=1, le=24),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return analytics_service.calculate_monthly_trends(db, current_user.id, months)


@router.get("/health", response_model=FinancialHealthOut)
def get_financial_health(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return health_service.calculate_financial_health(db, current_user.id)
