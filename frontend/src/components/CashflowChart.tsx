import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { getCashflow, type DateRange } from "../api/analytics";
import type { CashflowPoint, Granularity } from "../types/analytics";
import { formatCurrency, formatPeriodLabel } from "../utils/format";

interface CashflowChartProps {
  range: DateRange;
}

const GRANULARITIES: Granularity[] = ["weekly", "monthly", "yearly"];

function CashflowChart({ range }: CashflowChartProps) {
  const [granularity, setGranularity] = useState<Granularity>("monthly");
  const [data, setData] = useState<CashflowPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCashflow(granularity, range)
      .then((points) => {
        if (!cancelled) setData(points);
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [granularity, range.startDate, range.endDate]);

  return (
    <div className="bg-card border border-line rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg">Cash flow</h2>
        <div className="flex rounded-md border border-line overflow-hidden text-xs">
          {GRANULARITIES.map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1.5 font-medium capitalize transition-colors ${
                granularity === g
                  ? "bg-ink text-white"
                  : "bg-card text-ink-soft hover:bg-paper"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[260px] flex items-center justify-center text-ink-soft text-sm">
          Loading…
        </div>
      ) : data.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center text-ink-soft text-sm">
          No entries to chart yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#D8DBD3"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="period"
              tickFormatter={formatPeriodLabel}
              tick={{ fontSize: 11, fill: "#3A4656" }}
              axisLine={{ stroke: "#D8DBD3" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#3A4656" }}
              axisLine={false}
              tickLine={false}
              width={56}
              tickFormatter={(v: number) => `₹${v}`}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label: string) => formatPeriodLabel(label)}
              contentStyle={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                borderColor: "#D8DBD3",
                borderRadius: 8,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, fontFamily: "Inter, sans-serif" }}
            />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#1F6F5C"
              strokeWidth={2}
              dot={{ r: 3, fill: "#1F6F5C" }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Expenses"
              stroke="#B4442E"
              strokeWidth={2}
              dot={{ r: 3, fill: "#B4442E" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default CashflowChart;
