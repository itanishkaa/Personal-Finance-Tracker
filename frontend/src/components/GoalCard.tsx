import { useState, type FormEvent } from "react";
import type { Goal } from "../types/goal";
import { formatCurrency, formatDate } from "../utils/format";

interface GoalCardProps {
  goal: Goal;
  onContribute: (id: number, amount: number) => Promise<void>;
  onEdit: (goal: Goal) => void;
  onDelete: (id: number) => void;
  deleting: boolean;
}

function GoalCard({
  goal,
  onContribute,
  onEdit,
  onDelete,
  deleting,
}: GoalCardProps) {
  const [contribution, setContribution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isCompleted = goal.status === "completed";
  const barWidth = Math.min(goal.progress_percent, 100);
  const overshoot =
    goal.remaining_amount < 0 ? Math.abs(goal.remaining_amount) : 0;

  const handleContribute = async (e: FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(contribution);
    if (Number.isNaN(amount) || amount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await onContribute(goal.id, amount);
      setContribution("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-line rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-semibold text-lg">{goal.name}</h3>
          <p className="text-xs text-ink-soft">
            Target: {formatDate(goal.target_date)}
          </p>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <button
            onClick={() => onEdit(goal)}
            className="text-teal hover:text-teal-dark font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            disabled={deleting}
            className="text-brick hover:text-brick/80 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      <p className="font-mono text-xl tabular-nums mb-1">
        {formatCurrency(goal.current_amount)}{" "}
        <span className="text-ink-soft text-sm font-body">
          / {formatCurrency(goal.target_amount)}
        </span>
      </p>

      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-ink-soft">
          {goal.progress_percent.toFixed(0)}%
        </span>
        {isCompleted ? (
          <span className="text-xs text-gold font-medium">
            ✓ Goal reached
            {overshoot > 0 ? ` (+${formatCurrency(overshoot)})` : ""}
          </span>
        ) : (
          <span className="text-xs text-ink-soft">
            {formatCurrency(goal.remaining_amount)} to go
          </span>
        )}
      </div>
      <div className="w-full h-2.5 rounded-full bg-paper border border-line overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isCompleted ? "bg-gold" : "bg-teal"}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <form
        onSubmit={handleContribute}
        className="flex items-center gap-2 mt-4"
      >
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
          placeholder="Add contribution (₹)"
          className="flex-1 border border-line rounded-md px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-teal hover:bg-teal-dark disabled:opacity-50 text-white text-sm font-medium rounded-md px-3 py-1.5 transition-colors"
        >
          {submitting ? "Adding…" : "Add"}
        </button>
      </form>
      {formError && (
        <p className="text-brick text-xs mt-1.5" role="alert">
          {formError}
        </p>
      )}
    </div>
  );
}

export default GoalCard;
