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
import type { Transaction } from "../types/transaction";
import { formatCurrency, formatDate } from "../utils/format";

interface TransactionChartProps {
  transactions: Transaction[];
}

interface DailyTotals {
  date: string;
  income: number;
  expense: number;
}

function TransactionChart({ transactions }: TransactionChartProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-card border border-line rounded-lg p-8 text-center text-ink-soft text-sm">
        No entries to chart yet.
      </div>
    );
  }

  const byDate = new Map<string, DailyTotals>();
  for (const txn of transactions) {
    const existing = byDate.get(txn.date) ?? {
      date: txn.date,
      income: 0,
      expense: 0,
    };
    if (txn.type === "income") existing.income += txn.amount;
    else existing.expense += txn.amount;
    byDate.set(txn.date, existing);
  }

  const data = Array.from(byDate.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="bg-card border border-line rounded-lg p-5">
      <h2 className="font-display font-semibold text-lg mb-4">
        Income vs. expenses
      </h2>
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
            dataKey="date"
            tickFormatter={(d: string) => formatDate(d)}
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
            labelFormatter={(label: string) => formatDate(label)}
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
    </div>
  );
}

export default TransactionChart;
