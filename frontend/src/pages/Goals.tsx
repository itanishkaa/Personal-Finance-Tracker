import { useEffect, useState } from "react";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  contributeToGoal,
} from "../api/goals";
import { extractErrorMessage } from "../api/client";
import type { Goal, GoalCreateInput, GoalUpdateInput } from "../types/goal";
import Header from "../components/Header";
import GoalForm from "../components/GoalForm";
import GoalCard from "../components/GoalCard";

function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGoals();
      setGoals(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Unable to load your goals."));
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (input: GoalCreateInput | GoalUpdateInput) => {
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, input as GoalUpdateInput);
        setEditingGoal(null);
      } else {
        await createGoal(input as GoalCreateInput);
      }
      await fetchGoals();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to save goal."));
    }
  };

  const handleContribute = async (id: number, amount: number) => {
    try {
      await contributeToGoal(id, amount);
      await fetchGoals();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to add contribution."));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this goal?")) return;
    setDeletingId(id);
    try {
      await deleteGoal(id);
      await fetchGoals();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to delete goal."));
    } finally {
      setDeletingId(null);
    }
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="font-display font-semibold text-xl text-ink mb-1">
            Goals
          </h1>
          <p className="text-sm text-ink-soft">
            Track what you're saving toward.
          </p>
        </div>

        <GoalForm
          editingGoal={editingGoal}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingGoal(null)}
        />

        {loading ? (
          <div className="bg-card border border-line rounded-lg p-8 text-center text-ink-soft">
            Loading goals…
          </div>
        ) : error ? (
          <div className="bg-brick-light border border-brick/30 rounded-lg p-6 text-center">
            <p className="text-brick font-medium mb-3">{error}</p>
            <button
              onClick={fetchGoals}
              className="bg-brick hover:bg-brick/90 text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-card border border-line rounded-lg p-8 text-center text-ink-soft">
            <p className="font-display font-medium text-ink mb-1">
              No goals yet
            </p>
            <p className="text-sm">
              Set one above to start tracking your savings.
            </p>
          </div>
        ) : (
          <>
            {activeGoals.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onContribute={handleContribute}
                    onEdit={setEditingGoal}
                    onDelete={handleDelete}
                    deleting={deletingId === goal.id}
                  />
                ))}
              </div>
            )}

            {completedGoals.length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-lg mb-3 text-ink-soft">
                  Completed
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onContribute={handleContribute}
                      onEdit={setEditingGoal}
                      onDelete={handleDelete}
                      deleting={deletingId === goal.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Goals;
