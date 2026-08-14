from datetime import date as date_type
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.user import User


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # "income" | "expense"
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    date: Mapped[date_type] = mapped_column(Date, nullable=False, index=True)
    payment_method: Mapped[str | None] = mapped_column(String(30), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="transactions")
    category: Mapped["Category | None"] = relationship(back_populates="transactions")
