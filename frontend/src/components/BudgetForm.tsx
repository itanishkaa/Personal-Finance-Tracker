import { useEffect, useState, type FormEvent } from "react";
import type { Category } from "../types/category";
import type { Budget, BudgetInput } from "../types/budget";

interface BudgetFormProps {
  categories: Category[];
  month: number;
  year: number;
  editingBudget: Budget | null;
  onSubmit: (budget: BudgetInput) => Promise<void>;
  onCancelEdit: () => void;
}

function BudgetForm({
  categories,
  month,
  year,
  editingBudget,
  onSubmit,
  onCancelEdit,
}: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  useEffect(() => {
    if (editingBudget) {
      setCategoryId(String(editingBudget.category_id));
      setAmount(String(editingBudget.amount));
    } else {
      setCategoryId("");
      setAmount("");
    }
    setFormError(null);
  }, [editingBudget]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) {
      setFormError("Choose a category and set an amount.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        category_id: Number(categoryId),
        amount: parsedAmount,
        month,
        year,
      });
      if (!editingBudget) {
        setCategoryId("");
        setAmount("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-line rounded-lg p-5"
    >
      <h2 className="font-display font-semibold text-lg mb-4">
        {editingBudget
          ? `Edit ${editingBudget.category_name} budget`
          : "New budget"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Category
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!!editingBudget}
            className="border border-line rounded-md px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal disabled:opacity-60"
          >
            <option value="">Select…</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon ? `${c.icon} ` : ""}
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Amount (₹)
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="border border-line rounded-md px-3 py-2 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          />
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-teal hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md px-4 py-2 transition-colors"
          >
            {submitting
              ? "Saving…"
              : editingBudget
                ? "Save changes"
                : "Add budget"}
          </button>
          {editingBudget && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-ink-soft hover:text-ink text-sm px-3 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {formError && (
        <p className="text-brick text-sm mt-3" role="alert">
          {formError}
        </p>
      )}
    </form>
  );
}

export default BudgetForm;
