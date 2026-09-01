import { useEffect, useState } from "react";
import {
  getRecurring,
  createRecurring,
  updateRecurring,
  deleteRecurring,
} from "../api/recurring";
import { getCategories } from "../api/categories";
import { extractErrorMessage } from "../api/client";
import type { Category } from "../types/category";
import type { RecurringInput, RecurringTransaction } from "../types/recurring";
import { formatCurrency } from "../utils/format";
import Header from "../components/Header";
import StubCard from "../components/StubCard";
import RecurringForm from "../components/RecurringForm";
import RecurringList from "../components/RecurringList";

function Recurring() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingItem, setEditingItem] = useState<RecurringTransaction | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecurring();
      setItems(data);
    } catch (err) {
      setError(
        extractErrorMessage(err, "Unable to load your recurring transactions."),
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (input: RecurringInput) => {
    try {
      if (editingItem) {
        await updateRecurring(editingItem.id, input);
        setEditingItem(null);
      } else {
        await createRecurring(input);
      }
      await fetchItems();
    } catch (err) {
      setError(
        extractErrorMessage(err, "Failed to save recurring transaction."),
      );
    }
  };

  const handleToggleActive = async (item: RecurringTransaction) => {
    try {
      await updateRecurring(item.id, {
        category_id: item.category_id,
        amount: item.amount,
        type: item.type,
        description: item.description,
        frequency: item.frequency,
        next_date: item.next_date,
        active: !item.active,
      });
      await fetchItems();
    } catch (err) {
      setError(
        extractErrorMessage(err, "Failed to update recurring transaction."),
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this recurring transaction?")) return;
    setDeletingId(id);
    try {
      await deleteRecurring(id);
      await fetchItems();
    } catch (err) {
      setError(
        extractErrorMessage(err, "Failed to delete recurring transaction."),
      );
    } finally {
      setDeletingId(null);
    }
  };

  // "Monthly Recurring Commitments" (PRD section 26) - active expense
  // items only, summed on their monthly-equivalent basis.
  const monthlyCommitments = items
    .filter((i) => i.active && i.type === "expense")
    .reduce((sum, i) => sum + i.monthly_equivalent, 0);

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="font-display font-semibold text-xl text-ink mb-1">
            Recurring
          </h1>
          <p className="text-sm text-ink-soft">
            Fixed commitments like rent, bills, and subscriptions.
          </p>
        </div>

        <StubCard
          label="Monthly recurring commitments"
          value={formatCurrency(monthlyCommitments)}
          tone="brick"
        />

        <RecurringForm
          categories={categories}
          editingItem={editingItem}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingItem(null)}
        />

        {loading ? (
          <div className="bg-card border border-line rounded-lg p-8 text-center text-ink-soft">
            Loading…
          </div>
        ) : error ? (
          <div className="bg-brick-light border border-brick/30 rounded-lg p-6 text-center">
            <p className="text-brick font-medium mb-3">{error}</p>
            <button
              onClick={fetchItems}
              className="bg-brick hover:bg-brick/90 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <RecurringList
            items={items}
            onToggleActive={handleToggleActive}
            onEdit={setEditingItem}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </main>
    </div>
  );
}

export default Recurring;
