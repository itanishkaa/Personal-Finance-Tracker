import { useState } from "react";
import type { Category } from "../types/category";
import type { Transaction, TransactionInput } from "../types/transaction";
import { PAYMENT_METHODS } from "../types/transaction";
import { formatCurrency, formatDate } from "../utils/format";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onTransactionUpdated: (
    id: number,
    transaction: TransactionInput,
  ) => Promise<void>;
  onTransactionDeleted: (id: number) => Promise<void>;
}

function TransactionList({
  transactions,
  categories,
  onTransactionUpdated,
  onTransactionDeleted,
}: TransactionListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<TransactionInput | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const startEdit = (txn: Transaction) => {
    setEditingId(txn.id);
    setDraft({
      type: txn.type,
      category_id: txn.category_id,
      description: txn.description,
      amount: txn.amount,
      date: txn.date,
      payment_method: txn.payment_method,
      notes: txn.notes,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = async (id: number) => {
    if (!draft) return;
    await onTransactionUpdated(id, draft);
    cancelEdit();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this entry?")) return;
    setDeletingId(id);
    try {
      await onTransactionDeleted(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-card border border-line rounded-lg p-8 text-center text-ink-soft">
        <p className="font-display font-medium text-ink mb-1">No entries yet</p>
        <p className="text-sm">
          Add your first entry above to start your ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-line rounded-lg overflow-hidden overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="border-b border-line text-left text-ink-soft uppercase text-xs tracking-wide">
            <th className="px-4 py-3 font-body font-medium">Date</th>
            <th className="px-4 py-3 font-body font-medium">Category</th>
            <th className="px-4 py-3 font-body font-medium">Description</th>
            <th className="px-4 py-3 font-body font-medium">Payment</th>
            <th className="px-4 py-3 font-body font-medium text-right">
              Amount
            </th>
            <th className="px-4 py-3 font-body font-medium text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => {
            const isEditing = editingId === txn.id;
            const category = txn.category_id
              ? categoryById.get(txn.category_id)
              : undefined;
            const categoriesForDraftType = draft
              ? categories.filter((c) => c.type === draft.type)
              : [];

            if (isEditing && draft) {
              return (
                <tr
                  key={txn.id}
                  className="border-b border-line last:border-0 bg-teal-light/40"
                >
                  <td className="px-4 py-2">
                    <input
                      type="date"
                      value={draft.date}
                      onChange={(e) =>
                        setDraft({ ...draft, date: e.target.value })
                      }
                      className="border border-line rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={draft.category_id ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          category_id: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                      className="border border-line rounded px-2 py-1 w-full bg-card"
                    >
                      <option value="">None</option>
                      {categoriesForDraftType.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={draft.description}
                      onChange={(e) =>
                        setDraft({ ...draft, description: e.target.value })
                      }
                      className="border border-line rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={draft.payment_method ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          payment_method: (e.target.value ||
                            null) as TransactionInput["payment_method"],
                        })
                      }
                      className="border border-line rounded px-2 py-1 w-full bg-card"
                    >
                      <option value="">—</option>
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={draft.amount}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="border border-line rounded px-2 py-1 w-full text-right font-mono"
                    />
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <button
                      onClick={() => saveEdit(txn.id)}
                      className="text-teal hover:text-teal-dark font-medium mr-3"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-ink-soft hover:text-ink"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              );
            }

            return (
              <tr
                key={txn.id}
                className="border-b border-line last:border-0 hover:bg-paper/60 transition-colors"
              >
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                  {formatDate(txn.date)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {category ? (
                    <span className="inline-flex items-center gap-1.5 text-ink-soft">
                      {category.icon && <span>{category.icon}</span>}
                      {category.name}
                    </span>
                  ) : (
                    <span className="text-ink-soft/50">Uncategorized</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="ledger-row">
                    <span>{txn.description}</span>
                    <span className="ledger-leader" />
                  </div>
                  {txn.notes && (
                    <p className="text-xs text-ink-soft/70 mt-0.5">
                      {txn.notes}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                  {txn.payment_method ?? "—"}
                </td>
                <td
                  className={`px-4 py-3 text-right amount whitespace-nowrap ${
                    txn.type === "income" ? "text-teal" : "text-ink"
                  }`}
                >
                  {txn.type === "income" ? "+" : "−"}
                  {formatCurrency(txn.amount)}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => startEdit(txn)}
                    className="text-teal hover:text-teal-dark font-medium mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(txn.id)}
                    disabled={deletingId === txn.id}
                    className="text-brick hover:text-brick/80 disabled:opacity-50"
                  >
                    {deletingId === txn.id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;
