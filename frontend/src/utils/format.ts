export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isCurrentMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
}

/**
 * Formats a backend analytics "period" string for chart axes.
 * Handles monthly ("2026-08"), weekly ("2026-W33"), and yearly ("2026").
 */
export function formatPeriodLabel(period: string): string {
  if (/^\d{4}-W\d{2}$/.test(period)) {
    const [year, week] = period.split("-W");
    return `Wk ${week} '${year.slice(2)}`;
  }
  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });
  }
  return period; // yearly - already just "2026"
}
