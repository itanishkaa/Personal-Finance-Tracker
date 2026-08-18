import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getCategoryBreakdown, type DateRange } from "../api/analytics";
import type { CategoryBreakdownItem } from "../types/analytics";
import type { TransactionType } from "../types/transaction";
import { formatCurrency } from "../utils/format";

interface CategoryBreakdownProps {
  range: DateRange;
}

// Ledger palette cycled across slices - teal/gold/brick first (semantic
// colors), then a handful of muted supporting tones for the rest.
const SLICE_COLORS = [
  "#1F6F5C",
  "#C9A227",
  "#B4442E",
  "#3A4656",
  "#7C9A92",
  "#D8B34A",
  "#8C5A4D",
  "#5B7065",
  "#A98600",
  "#94433A",
];

function CategoryBreakdown({ range }: CategoryBreakdownProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [items, setItems] = useState<CategoryBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCategoryBreakdown(type, range)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, range.startDate, range.endDate]);

  return (
    <div className="bg-card border border-line rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg">
          Category breakdown
        </h2>
        <div className="flex rounded-md border border-line overflow-hidden text-xs">
          <button
            onClick={() => setType("expense")}
            className={`px-3 py-1.5 font-medium transition-colors ${
              type === "expense"
                ? "bg-brick text-white"
                : "bg-card text-ink-soft hover:bg-paper"
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => setType("income")}
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

      {loading ? (
        <div className="h-[220px] flex items-center justify-center text-ink-soft text-sm">
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-ink-soft text-sm">
          No {type} entries for this period.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ResponsiveContainer
            width="100%"
            height={220}
            className="sm:max-w-[220px]"
          >
            <PieChart>
              <Pie
                data={items}
                dataKey="amount"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {items.map((entry, index) => (
                  <Cell
                    key={entry.category_id ?? index}
                    fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  borderColor: "#D8DBD3",
                  borderRadius: 8,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <ul className="flex-1 w-full flex flex-col gap-2">
            {items.map((item, index) => (
              <li
                key={item.category_id ?? index}
                className="ledger-row text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        SLICE_COLORS[index % SLICE_COLORS.length],
                    }}
                  />
                  {item.icon && <span>{item.icon}</span>}
                  {item.name}
                </span>
                <span className="ledger-leader" />
                <span className="amount text-ink-soft whitespace-nowrap">
                  {formatCurrency(item.amount)}{" "}
                  <span className="text-ink-soft/60">
                    ({item.percentage.toFixed(0)}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CategoryBreakdown;
