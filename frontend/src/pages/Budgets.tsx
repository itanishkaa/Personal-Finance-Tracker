import { useEffect, useState } from "react";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../api/budget";
import { getCategories } from "../api/categories";
import { extractErrorMessage } from "../api/client";
import type { Budget, BudgetInput } from "../types/budget";
import type { Category } from "../types/category";
import Header from "../components/Header";
import BudgetForm from "../components/BudgetForm";
import BudgetCard from "../components/BudgetCard";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function currentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

function Budgets() {
  const [{ month, year }, setPeriod] = useState(currentMonthYear());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBudgets(month, year);
      setBudgets(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to load your budgets."));
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleMonthInputChange = (value: string) => {
    // value is "YYYY-MM" from <input type="month">
    const [y, m] = value.split("-").map(Number);
    if (y && m) setPeriod({ month: m, year: y });
  };

  const handleSubmit = async (input: BudgetInput) => {
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, input);
        setEditingBudget(null);
      } else {
        await createBudget(input);
      }
      await fetchBudgets();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to save budget."));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this budget?")) return;
    setDeletingId(id);
    try {
      await deleteBudget(id);
      await fetchBudgets();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to delete budget."));
    } finally {
      setDeletingId(null);
    }
  };

  const monthInputValue = `${year}-${String(month).padStart(2, "0")}`;
  const budgetedCategoryIds = new Set(budgets.map((b) => b.category_id));
  const availableCategoryCount = categories.filter(
    (c) => c.type === "expense" && !budgetedCategoryIds.has(c.id),
  ).length;

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display font-semibold text-xl text-ink mb-1">
              Budgets
            </h1>
            <p className="text-sm text-ink-soft">
              {MONTH_NAMES[month - 1]} {year}
            </p>
          </div>
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            Month
            <input
              type="month"
              value={monthInputValue}
              onChange={(e) => handleMonthInputChange(e.target.value)}
              className="border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
            />
          </label>
        </div>

        <BudgetForm
          categories={categories}
          month={month}
          year={year}
          editingBudget={editingBudget}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingBudget(null)}
        />

        {loading ? (
          <div className="bg-card border border-line rounded-lg p-8 text-center text-ink-soft">
            Loading budgets…
          </div>
        ) : error ? (
          <div className="bg-brick-light border border-brick/30 rounded-lg p-6 text-center">
            <p className="text-brick font-medium mb-3">{error}</p>
            <button
              onClick={fetchBudgets}
              className="bg-brick hover:bg-brick/90 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : budgets.length === 0 ? (
          <div className="bg-card border border-line rounded-lg p-8 text-center text-ink-soft">
            <p className="font-display font-medium text-ink mb-1">
              No budgets for this month
            </p>
            <p className="text-sm">
              {availableCategoryCount > 0
                ? "Set one above to start tracking against a category."
                : "You've budgeted every expense category for this month."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={setEditingBudget}
                onDelete={handleDelete}
                deleting={deletingId === budget.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Budgets;
