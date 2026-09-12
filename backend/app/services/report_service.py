"""
Monthly financial reports and export (PRD sections 34-35). The monthly
report reuses analytics_service for income/expenses/category breakdown
rather than re-querying - only the "largest single expense" figure is new
here, since nothing built so far computes that.
"""

import calendar
import csv
import io
from datetime import date as date_type

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.transaction import Transaction
from app.schemas.report import CategoryAmount, LargestExpense, MonthlyReportOut
from app.services import analytics_service, transaction_service

_MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


def _month_bounds(year: int, month: int) -> tuple[date_type, date_type]:
    last_day = calendar.monthrange(year, month)[1]
    return date_type(year, month, 1), date_type(year, month, last_day)


def calculate_monthly_report(db: Session, user_id: int, month: int, year: int) -> MonthlyReportOut:
    start, end = _month_bounds(year, month)

    overview = analytics_service.get_overview(db, user_id, start, end)
    breakdown = analytics_service.get_category_breakdown(db, user_id, "expense", start, end)
    top = breakdown[0] if breakdown else None

    largest = db.execute(
        select(Transaction)
        .where(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date.between(start, end),
        )
        .options(joinedload(Transaction.category))
        .order_by(Transaction.amount.desc())
        .limit(1)
    ).scalar_one_or_none()

    return MonthlyReportOut(
        period=f"{_MONTH_NAMES[month - 1]} {year}",
        month=month,
        year=year,
        income=overview["income"],
        expenses=overview["expenses"],
        savings=overview["balance"],
        savings_rate=overview["savings_rate"],
        top_category=CategoryAmount(name=top["name"], amount=top["amount"]) if top else None,
        largest_expense=(
            LargestExpense(
                description=largest.description,
                amount=largest.amount,
                date=largest.date,
                category_name=largest.category.name if largest.category else None,
            )
            if largest is not None
            else None
        ),
    )


def export_transactions_csv(
    db: Session,
    user_id: int,
    start_date: date_type | None,
    end_date: date_type | None,
    txn_type: str | None,
    category_id: int | None,
) -> str:
    """
    Reuses transaction_service.get_transactions so the CSV export honors
    exactly the same filters as the transactions list view (PRD section 35:
    "CSV export should support filtered transaction data").
    """
    transactions = transaction_service.get_transactions(
        db, user_id, start_date, end_date, txn_type, category_id
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Type", "Category", "Description", "Amount", "Payment Method", "Notes"])
    for txn in transactions:
        writer.writerow(
            [
                txn.date.isoformat(),
                txn.type,
                txn.category.name if txn.category else "",
                txn.description,
                f"{txn.amount:.2f}",
                txn.payment_method or "",
                txn.notes or "",
            ]
        )
    return output.getvalue()


def generate_monthly_report_pdf(report: MonthlyReportOut) -> bytes:
    """
    A concise one-page PDF matching the PRD's section 34 layout. Uses
    "Rs." rather than the ₹ glyph - reportlab's built-in Helvetica font
    doesn't reliably render the rupee sign without bundling a custom
    Unicode font, which felt like unnecessary weight for one report.
    """
    from io import BytesIO

    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import mm
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    def fmt(amount: float) -> str:
        return f"Rs. {amount:,.2f}"

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm, leftMargin=20 * mm, rightMargin=20 * mm
    )
    styles = getSampleStyleSheet()
    elements = [
        Paragraph(f"{report.period} Financial Summary", styles["Title"]),
        Spacer(1, 16),
    ]

    summary_rows = [
        ["Income", fmt(report.income)],
        ["Expenses", fmt(report.expenses)],
        ["Savings", fmt(report.savings)],
        ["Savings Rate", f"{report.savings_rate:.1f}%"],
    ]
    summary_table = Table(summary_rows, colWidths=[220, 220])
    summary_table.setStyle(
        TableStyle(
            [
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("LINEBELOW", (0, 0), (-1, -2), 0.5, colors.HexColor("#D8DBD3")),
            ]
        )
    )
    elements.append(summary_table)
    elements.append(Spacer(1, 24))

    if report.top_category:
        elements.append(Paragraph("Top Category", styles["Heading3"]))
        elements.append(
            Paragraph(
                f"{report.top_category.name} &mdash; {fmt(report.top_category.amount)}",
                styles["Normal"],
            )
        )
        elements.append(Spacer(1, 16))

    if report.largest_expense:
        elements.append(Paragraph("Largest Expense", styles["Heading3"]))
        elements.append(
            Paragraph(
                f"{report.largest_expense.description} &mdash; {fmt(report.largest_expense.amount)}",
                styles["Normal"],
            )
        )

    if not report.top_category and not report.largest_expense:
        elements.append(Paragraph("No expenses recorded for this period.", styles["Normal"]))

    doc.build(elements)
    return buffer.getvalue()
