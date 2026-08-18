import { useEffect, useState } from "react";
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../api/transactions";
import { getCategories } from "../api/categories";
import { getOverview } from "../api/analytics";
import { extractErrorMessage } from "../api/client";
import type { Category } from "../types/category";
import type { Overview } from "../types/analytics";
import type { Transaction, TransactionInput } from "../types/transaction";
import { formatCurrency } from "../utils/format";
import Header from "../components/Header";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import TransactionChart from "../components/TransactionChart";
import DateFilter from "../components/DateFilter";
import StubCard from "../components/StubCard";

function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // KPI figures come from the backend's Pandas-backed /analytics/overview
  // (Phase 4) rather than being computed client-side, and are scoped to
  // whatever date range is currently applied - defaulting to the current
  // month on the backend when no range is given, same as before.
  const fetchOverview = async (
    appliedStart = startDate,
    appliedEnd = endDate,
  ) => {
    try {
      const data = await getOverview({
        startDate: appliedStart || undefined,
        endDate: appliedEnd || undefined,
      });
      setOverview(data);
    } catch {
      setOverview(null);
    }
  };

  const fetchTransactions = async (
    appliedStart = startDate,
    appliedEnd = endDate,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions({
        startDate: appliedStart || undefined,
        endDate: appliedEnd || undefined,
      });
      const sorted = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setTransactions(sorted);
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to load your financial data."));
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async (appliedStart = startDate, appliedEnd = endDate) => {
    await Promise.all([
      fetchTransactions(appliedStart, appliedEnd),
      fetchOverview(appliedStart, appliedEnd),
    ]);
  };

  useEffect(() => {
    refresh();
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTransaction = async (transaction: TransactionInput) => {
    try {
      await addTransaction(transaction);
      await refresh();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to add entry."));
    }
  };

  const handleUpdateTransaction = async (
    id: number,
    transaction: TransactionInput,
  ) => {
    try {
      await updateTransaction(id, transaction);
      await refresh();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to update entry."));
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      await deleteTransaction(id);
      await refresh();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to delete entry."));
    }
  };

  const handleApplyFilter = () => {
    refresh();
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    refresh("", "");
  };

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {overview ? (
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
          ) : (
            <div className="col-span-2 sm:col-span-4 bg-card border border-line rounded-lg p-8 text-center text-ink-soft text-sm">
              Loading…
            </div>
          )}
        </div>

        <TransactionForm
          categories={categories}
          onAddTransaction={handleAddTransaction}
        />

        <div className="bg-card border border-line rounded-lg p-5">
          <h2 className="font-display font-semibold text-lg mb-4">
            Filter entries
          </h2>
          <DateFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onApply={handleApplyFilter}
            onClear={handleClearFilter}
          />
        </div>

        {loading ? (
          <div className="bg-card border border-line rounded-lg p-8 text-center text-ink-soft">
            Loading financial data…
          </div>
        ) : error ? (
          <div className="bg-brick-light border border-brick/30 rounded-lg p-6 text-center">
            <p className="text-brick font-medium mb-3">{error}</p>
            <button
              onClick={() => refresh()}
              className="bg-brick hover:bg-brick/90 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <TransactionList
              transactions={transactions}
              categories={categories}
              onTransactionUpdated={handleUpdateTransaction}
              onTransactionDeleted={handleDeleteTransaction}
            />
            <TransactionChart transactions={transactions} />
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
