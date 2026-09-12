from datetime import date as date_type

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db_session
from app.models.user import User
from app.schemas.report import MonthlyReportOut
from app.services import report_service

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


@router.get("/monthly", response_model=MonthlyReportOut)
def get_monthly_report(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2000, le=2100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    today = date_type.today()
    return report_service.calculate_monthly_report(
        db, current_user.id, month or today.month, year or today.year
    )


@router.get("/export/csv")
def export_transactions_csv(
    startDate: date_type | None = None,
    endDate: date_type | None = None,
    type: str | None = None,
    categoryId: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    csv_text = report_service.export_transactions_csv(
        db, current_user.id, startDate, endDate, type, categoryId
    )
    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="transactions.csv"'},
    )


@router.get("/export/pdf")
def export_monthly_report_pdf(
    month: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2000, le=2100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    today = date_type.today()
    resolved_month = month or today.month
    resolved_year = year or today.year

    report = report_service.calculate_monthly_report(
        db, current_user.id, resolved_month, resolved_year
    )
    pdf_bytes = report_service.generate_monthly_report_pdf(report)
    filename = f"fintrack-report-{resolved_year}-{resolved_month:02d}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
