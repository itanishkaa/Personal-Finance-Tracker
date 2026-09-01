import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Category } from "../types/category";
import type { TransactionType } from "../types/transaction";
import type {
  RecurringFrequency,
  RecurringInput,
  RecurringTransaction,
} from "../types/recurring";

interface RecurringFormProps {
  categories: Category[];
  editingItem: RecurringTransaction | null;
  onSubmit: (input: RecurringInput) => Promise<void>;
  onCancelEdit: () => void;
}

const FREQUENCIES: RecurringFrequency[] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
];

function RecurringForm({
  categories,
  editingItem,
  onSubmit,
  onCancelEdit,
}: RecurringFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [nextDate, setNextDate] = useState("");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categoriesForType = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );

  useEffect(() => {
    if (editingItem) {
      setType(editingItem.type);
      setCategoryId(
        editingItem.category_id ? String(editingItem.category_id) : "",
      );
      setDescription(editingItem.description);
      setAmount(String(editingItem.amount));
      setFrequency(editingItem.frequency);
      setNextDate(editingItem.next_date);
      setActive(editingItem.active);
    } else {
      setType("expense");
      setCategoryId("");
      setDescription("");
      setAmount("");
      setFrequency("monthly");
      setNextDate("");
      setActive(true);
    }
    setFormError(null);
  }, [editingItem]);

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    setCategoryId("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !nextDate) {
      setFormError("Fill in description, amount, and next date.");
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
        type,
        category_id: categoryId ? Number(categoryId) : null,
        description,
        amount: parsedAmount,
        frequency,
        next_date: nextDate,
        active,
      });
      if (!editingItem) {
        setDescription("");
        setAmount("");
        setNextDate("");
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg">
          {editingItem
            ? `Edit ${editingItem.description}`
            : "New recurring transaction"}
        </h2>
        <div className="flex rounded-md border border-line overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`px-3 py-1.5 font-medium transition-colors ${
              type === "expense"
                ? "bg-brick text-white"
                : "bg-card text-ink-soft hover:bg-paper"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`px-3 py-1.5 font-medium transition-colors ${
              type === "income"
                ? "bg-teal text-white"
                : "bg-card text-ink-soft hover:bg-paper"
            }`}
          >
            Income
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
        <label className="flex flex-col gap-1 sm:col-span-2 text-sm text-ink-soft">
          Description
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Rent, Netflix, salary…"
            className="border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Category <span className="text-ink-soft/60">(optional)</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-line rounded-md px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          >
            <option value="">None</option>
            {categoriesForType.map((c) => (
              <option key={c.id} value={c.id}>
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

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Frequency
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
            className="border border-line rounded-md px-3 py-2 bg-card capitalize focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          >
            {FREQUENCIES.map((f) => (
              <option key={f} value={f} className="capitalize">
                {f}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Next date
          <input
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            className="border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-soft mt-4">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="rounded border-line"
        />
        Active
      </label>

      {formError && (
        <p className="text-brick text-sm mt-3" role="alert">
          {formError}
        </p>
      )}

      <div className="flex items-center gap-2 mt-4">
        <button
          type="submit"
          disabled={submitting}
          className="bg-teal hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md px-4 py-2 transition-colors"
        >
          {submitting
            ? "Saving…"
            : editingItem
              ? "Save changes"
              : "Add recurring"}
        </button>
        {editingItem && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-ink-soft hover:text-ink text-sm px-3 py-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default RecurringForm;
