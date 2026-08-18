import { useEffect, useState } from "react";
import { getOverview, type DateRange } from "../api/analytics";
import type { Overview } from "../types/analytics";
import { formatCurrency } from "../utils/format";
import Header from "../components/Header";
import StubCard from "../components/StubCard";
import DateFilter from "../components/DateFilter";
import CashflowChart from "../components/CashflowChart";
import CategoryBreakdown from "../components/CategoryBreakdown";
import SpendingSummary from "../components/SpendingSummary";
import MonthlyTrendsChart from "../components/MonthlyTrendsChart";

function Analytics() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedRange, setAppliedRange] = useState<DateRange>({});
  const [overview, setOverview] = useState<Overview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setOverviewLoading(true);
    getOverview(appliedRange)
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch(() => {
        if (!cancelled) setOverview(null);
      })
      .finally(() => {
        if (!cancelled) setOverviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appliedRange]);

  const handleApplyFilter = () => {
    setAppliedRange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setAppliedRange({});
  };

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="font-display font-semibold text-xl text-ink mb-1">
            Analytics
          </h1>
          <p className="text-sm text-ink-soft">
            Defaults to the current month where a period isn't specified below.
          </p>
        </div>

        <div className="bg-card border border-line rounded-lg p-5">
          <DateFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onApply={handleApplyFilter}
            onClear={handleClearFilter}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {overviewLoading || !overview ? (
            <div className="col-span-2 sm:col-span-4 bg-card border border-line rounded-lg p-8 text-center text-ink-soft text-sm">
              Loading…
            </div>
          ) : (
            <>
              <StubCard
                label="Balance"
                value={formatCurrency(overview.balance)}
                tone="ink"
              />
              <StubCard
                label="Income"
                value={formatCurrency(overview.income)}
                tone="teal"
              />
              <StubCard
                label="Expenses"
                value={formatCurrency(overview.expenses)}
                tone="brick"
              />
              <StubCard
                label="Savings rate"
                value={`${overview.savings_rate.toFixed(1)}%`}
                tone="gold"
              />
            </>
          )}
        </div>

        <CashflowChart range={appliedRange} />
        <CategoryBreakdown range={appliedRange} />
        <SpendingSummary range={appliedRange} />
        <MonthlyTrendsChart />
      </main>
    </div>
  );
}

export default Analytics;
