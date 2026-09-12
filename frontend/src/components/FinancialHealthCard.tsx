import type { FinancialHealth } from "../types/health";

interface FinancialHealthCardProps {
  health: FinancialHealth;
}

const LABEL_TONE: Record<string, { text: string; ring: string }> = {
  Excellent: { text: "text-teal", ring: "stroke-teal" },
  Good: { text: "text-teal", ring: "stroke-teal" },
  Fair: { text: "text-gold", ring: "stroke-gold" },
  "Needs attention": { text: "text-brick", ring: "stroke-brick" },
};

function FinancialHealthCard({ health }: FinancialHealthCardProps) {
  const tone = LABEL_TONE[health.label] ?? LABEL_TONE.Fair;

  // PRD section 28: positives listed before warnings.
  const lines = [
    ...health.factors
      .filter((f) => f.status === "positive")
      .map((f) => ({ status: f.status, message: f.message })),
    ...health.insights
      .filter((i) => i.status === "positive")
      .map((i) => ({ status: i.status, message: i.message })),
    ...health.factors
      .filter((f) => f.status === "warning")
      .map((f) => ({ status: f.status, message: f.message })),
    ...health.insights
      .filter((i) => i.status === "warning")
      .map((i) => ({ status: i.status, message: i.message })),
  ];

  // Ring progress: circumference of a r=42 circle.
  const circumference = 2 * Math.PI * 42;
  const offset = circumference * (1 - health.score / 100);

  return (
    <div className="bg-card border border-line rounded-lg p-5">
      <h2 className="font-display font-semibold text-lg mb-4">
        Financial Health
      </h2>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 96 96" className="w-28 h-28 -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              stroke="#D8DBD3"
              strokeWidth="8"
            />
            <circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={tone.ring}
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-semibold tabular-nums text-ink leading-none">
              {health.score}
            </span>
            <span className="text-xs text-ink-soft">/100</span>
            <span className={`text-xs font-medium mt-1 ${tone.text}`}>
              {health.label}
            </span>
          </div>
        </div>

        <ul className="flex-1 w-full flex flex-col gap-1.5">
          {lines.map((line, i) => (
            <li
              key={i}
              className={`text-sm flex items-start gap-2 ${
                line.status === "positive" ? "text-ink-soft" : "text-brick"
              }`}
            >
              <span
                className={
                  line.status === "positive" ? "text-teal" : "text-brick"
                }
              >
                {line.status === "positive" ? "✓" : "⚠"}
              </span>
              {line.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default FinancialHealthCard;
