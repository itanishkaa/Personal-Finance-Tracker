import type { Budget, BudgetStatus } from "../types/budget";
import { formatCurrency } from "../utils/format";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: number) => void;
  deleting: boolean;
}

const STATUS_STYLES: Record<
  BudgetStatus,
  { bar: string; text: string; label: string }
> = {
  healthy: { bar: "bg-teal", text: "text-teal", label: "On track" },
  warning: { bar: "bg-gold", text: "text-gold", label: "Watch spending" },
  near_limit: { bar: "bg-brick", text: "text-brick", label: "Near limit" },
  over_budget: { bar: "bg-brick", text: "text-brick", label: "Over budget" },
};

function BudgetCard({ budget, onEdit, onDelete, deleting }: BudgetCardProps) {
  const style = STATUS_STYLES[budget.status];
  const barWidth = Math.min(budget.percent_used, 100);
  const overBy =
    budget.status === "over_budget" ? budget.spent - budget.amount : 0;

  return (
    <div className="bg-card border border-line rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-semibold text-lg flex items-center gap-1.5">
            {budget.category_icon && <span>{budget.category_icon}</span>}
            {budget.category_name}
          </h3>
          <span className={`text-xs font-medium ${style.text}`}>
            {style.label}
          </span>
        </div>
        <div className="flex gap-3 text-sm">
          <button
            onClick={() => onEdit(budget)}
            className="text-teal hover:text-teal-dark font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            disabled={deleting}
            className="text-brick hover:text-brick/80 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
        <div>
          <p className="text-ink-soft/70 text-xs uppercase tracking-wide">
            Budget
          </p>
          <p className="amount text-ink">{formatCurrency(budget.amount)}</p>
        </div>
        <div>
          <p className="text-ink-soft/70 text-xs uppercase tracking-wide">
            Spent
          </p>
          <p className="amount text-ink">{formatCurrency(budget.spent)}</p>
        </div>
        <div>
          <p className="text-ink-soft/70 text-xs uppercase tracking-wide">
            Remaining
          </p>
          <p
            className={`amount ${budget.remaining < 0 ? "text-brick" : "text-ink"}`}
          >
            {formatCurrency(budget.remaining)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-ink-soft">
          {budget.percent_used.toFixed(0)}% used
        </span>
        {overBy > 0 && (
          <span className="text-xs text-brick font-medium">
            Over by {formatCurrency(overBy)}
          </span>
        )}
      </div>
      <div className="w-full h-2.5 rounded-full bg-paper border border-line overflow-hidden">
        <div
          className={`h-full rounded-full ${style.bar} transition-all`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {budget.alert_message && (
        <p className={`text-sm mt-3 ${style.text}`}>{budget.alert_message}</p>
      )}
    </div>
  );
}

export default BudgetCard;
