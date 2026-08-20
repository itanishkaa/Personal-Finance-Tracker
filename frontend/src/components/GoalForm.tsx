import { useEffect, useState, type FormEvent } from "react";
import type { Goal, GoalCreateInput, GoalUpdateInput } from "../types/goal";

interface GoalFormProps {
  editingGoal: Goal | null;
  onSubmit: (goal: GoalCreateInput | GoalUpdateInput) => Promise<void>;
  onCancelEdit: () => void;
}

function GoalForm({ editingGoal, onSubmit, onCancelEdit }: GoalFormProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setTargetAmount(String(editingGoal.target_amount));
      setTargetDate(editingGoal.target_date);
      setCurrentAmount(""); // not editable here - see GoalUpdateInput
    } else {
      setName("");
      setTargetAmount("");
      setCurrentAmount("");
      setTargetDate("");
    }
    setFormError(null);
  }, [editingGoal]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !targetDate) {
      setFormError("Fill in a name, target amount, and target date.");
      return;
    }
    const parsedTarget = parseFloat(targetAmount);
    if (Number.isNaN(parsedTarget) || parsedTarget <= 0) {
      setFormError("Target amount must be greater than zero.");
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      if (editingGoal) {
        await onSubmit({
          name,
          target_amount: parsedTarget,
          target_date: targetDate,
        });
      } else {
        const parsedCurrent = currentAmount ? parseFloat(currentAmount) : 0;
        await onSubmit({
          name,
          target_amount: parsedTarget,
          target_date: targetDate,
          current_amount: parsedCurrent,
        });
        setName("");
        setTargetAmount("");
        setCurrentAmount("");
        setTargetDate("");
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
        {editingGoal ? `Edit ${editingGoal.name}` : "New goal"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink-soft sm:col-span-2">
          Goal name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Emergency Fund, New laptop…"
            className="border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Target (₹)
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0.00"
            className="border border-line rounded-md px-3 py-2 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          />
        </label>

        {!editingGoal && (
          <label className="flex flex-col gap-1 text-sm text-ink-soft">
            Already saved (₹)
            <input
              type="number"
              step="0.01"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0.00"
              className="border border-line rounded-md px-3 py-2 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
            />
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Target date
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="border border-line rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
          />
        </label>
      </div>

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
          {submitting ? "Saving…" : editingGoal ? "Save changes" : "Add goal"}
        </button>
        {editingGoal && (
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

export default GoalForm;
