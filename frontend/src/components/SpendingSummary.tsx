import { useEffect, useState } from "react";
import { getSpendingAnalytics, type DateRange } from "../api/analytics";
import type { SpendingAnalytics } from "../types/analytics";
import { formatCurrency } from "../utils/format";
import StubCard from "./StubCard";

interface SpendingSummaryProps {
  range: DateRange;
}

function SpendingSummary({ range }: SpendingSummaryProps) {
  const [data, setData] = useState<SpendingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSpendingAnalytics(range)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range.startDate, range.endDate]);

  if (loading) {
    return (
      <div className="bg-card border border-line rounded-lg p-8 text-center text-ink-soft text-sm">
        Loading…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-card border border-line rounded-lg p-8 text-center text-ink-soft text-sm">
        Unable to load spending summary.
      </div>
    );
  }

  const mom = data.month_over_month;
  const changeUp = mom.change_percent !== null && mom.change_percent > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <StubCard
          label="Total spending"
          value={formatCurrency(data.total_spending)}
          tone="brick"
        />
        <StubCard
          label="Avg. daily"
          value={formatCurrency(data.average_daily_spending)}
          tone="ink"
        />
      </div>

      <div className="bg-card border border-line rounded-lg p-5">
        <h2 className="font-display font-semibold text-lg mb-4">
          Month over month
        </h2>
        <p className="text-sm text-ink-soft mb-2">
          {mom.current_month} vs. {mom.previous_month}
        </p>
        <p className="font-mono text-xl tabular-nums mb-1">
          {formatCurrency(mom.current_total)}{" "}
          <span className="text-ink-soft text-sm font-body">
            (was {formatCurrency(mom.previous_total)})
          </span>
        </p>
        {mom.change_percent !== null ? (
          <p
            className={`text-sm font-medium ${changeUp ? "text-brick" : "text-teal"}`}
          >
            {changeUp ? "▲" : "▼"} {Math.abs(mom.change_percent).toFixed(1)}%{" "}
            {changeUp ? "increase" : "decrease"} vs. last month
          </p>
        ) : (
          <p className="text-sm text-ink-soft">
            No prior month data to compare.
          </p>
        )}

        {mom.top_contributors.length > 0 && (
          <div className="mt-3 pt-3 border-t border-line">
            <p className="text-xs uppercase tracking-wide text-ink-soft/70 mb-2">
              Biggest contributors
            </p>
            <ul className="flex flex-col gap-1">
              {mom.top_contributors.map((c) => (
                <li
                  key={c.category_id ?? c.name}
                  className="ledger-row text-sm"
                >
                  <span>
                    {c.icon && <span className="mr-1">{c.icon}</span>}
                    {c.name}
                  </span>
                  <span className="ledger-leader" />
                  <span className="amount text-ink-soft">
                    {formatCurrency(c.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-card border border-line rounded-lg p-5">
        <h2 className="font-display font-semibold text-lg mb-4">
          By payment method
        </h2>
        {data.by_payment_method.length === 0 ? (
          <p className="text-sm text-ink-soft">No expenses for this period.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.by_payment_method.map((m) => (
              <li key={m.payment_method} className="ledger-row text-sm">
                <span>{m.payment_method}</span>
                <span className="ledger-leader" />
                <span className="amount text-ink-soft">
                  {formatCurrency(m.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SpendingSummary;
