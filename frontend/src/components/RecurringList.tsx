import type { RecurringTransaction } from "../types/recurring";
import { formatCurrency, formatDate } from "../utils/format";

interface RecurringListProps {
  items: RecurringTransaction[];
  onToggleActive: (item: RecurringTransaction) => void;
  onEdit: (item: RecurringTransaction) => void;
  onDelete: (id: number) => void;
  deletingId: number | null;
}

function RecurringList({
  items,
  onToggleActive,
  onEdit,
  onDelete,
  deletingId,
}: RecurringListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-card border border-line rounded-lg p-8 text-center text-ink-soft">
        <p className="font-display font-medium text-ink mb-1">
          No recurring transactions yet
        </p>
        <p className="text-sm">
          Add rent, subscriptions, or salary above to track fixed commitments.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-line rounded-lg overflow-hidden overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="border-b border-line text-left text-ink-soft uppercase text-xs tracking-wide">
            <th className="px-4 py-3 font-body font-medium">Description</th>
            <th className="px-4 py-3 font-body font-medium">Category</th>
            <th className="px-4 py-3 font-body font-medium">Frequency</th>
            <th className="px-4 py-3 font-body font-medium">Next date</th>
            <th className="px-4 py-3 font-body font-medium text-right">
              Amount
            </th>
            <th className="px-4 py-3 font-body font-medium text-right">
              Monthly equiv.
            </th>
            <th className="px-4 py-3 font-body font-medium text-center">
              Active
            </th>
            <th className="px-4 py-3 font-body font-medium text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className={`border-b border-line last:border-0 hover:bg-paper/60 transition-colors ${
                !item.active ? "opacity-50" : ""
              }`}
            >
              <td className="px-4 py-3">{item.description}</td>
              <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                {item.category_name ? (
                  <span className="inline-flex items-center gap-1.5">
                    {item.category_icon && <span>{item.category_icon}</span>}
                    {item.category_name}
                  </span>
                ) : (
                  <span className="text-ink-soft/50">—</span>
                )}
              </td>
              <td className="px-4 py-3 capitalize text-ink-soft">
                {item.frequency}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                {formatDate(item.next_date)}
              </td>
              <td
                className={`px-4 py-3 text-right amount whitespace-nowrap ${
                  item.type === "income" ? "text-teal" : "text-ink"
                }`}
              >
                {item.type === "income" ? "+" : "−"}
                {formatCurrency(item.amount)}
              </td>
              <td className="px-4 py-3 text-right amount text-ink-soft whitespace-nowrap">
                {formatCurrency(item.monthly_equivalent)}
              </td>
              <td className="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  checked={item.active}
                  onChange={() => onToggleActive(item)}
                  className="rounded border-line"
                />
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <button
                  onClick={() => onEdit(item)}
                  className="text-teal hover:text-teal-dark font-medium mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="text-brick hover:text-brick/80 disabled:opacity-50"
                >
                  {deletingId === item.id ? "Deleting…" : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecurringList;
