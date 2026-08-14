import { useMemo, useState, type FormEvent } from "react";
import type { Category } from "../types/category";
import {
  PAYMENT_METHODS,
  type TransactionInput,
  type TransactionType,
} from "../types/transaction";

interface TransactionFormProps {
  categories: Category[];
  onAddTransaction: (transaction: TransactionInput) => Promise<void>;
}

function TransactionForm({
  categories,
  onAddTransaction,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof PAYMENT_METHODS)[number]>("UPI");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const categoriesForType = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );

  const handleTypeChange = (nextType: TransactionType) => {
    setType(nextType);
    setCategoryId(""); // category list changes with type, so clear the stale selection
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !categoryId) {
      setFormError("Fill in category, description, amount, and date.");
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
      await onAddTransaction({
        type,
        category_id: Number(categoryId),
        description,
        amount: parsedAmount,
        date,
        payment_method: paymentMethod,
        notes: notes || null,
      });
      setDescription("");
      setAmount("");
      setDate("");
      setNotes("");
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
        <h2 className="font-display font-semibold text-lg">Add entry</h2>
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
          Category
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-line rounded-md px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          >
            <option value="">Select…</option>
            {categoriesForType.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2 text-sm text-ink-soft">
          Description
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Swiggy, rent, salary…"
            className="border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          />
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
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2 text-sm text-ink-soft">
          Payment method
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(
                e.target.value as (typeof PAYMENT_METHODS)[number],
              )
            }
            className="border border-line rounded-md px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 sm:col-span-4 text-sm text-ink-soft">
          Notes <span className="text-ink-soft/60">(optional)</span>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dinner with friends…"
            className="border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          />
        </label>
      </div>

      {formError && (
        <p className="text-brick text-sm mt-3" role="alert">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 bg-teal hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md px-4 py-2 transition-colors"
      >
        {submitting ? "Adding…" : "Add entry"}
      </button>
    </form>
  );
}

export default TransactionForm;
