interface StubCardProps {
  label: string;
  value: string;
  tone?: "ink" | "teal" | "gold" | "brick";
}

const toneClasses: Record<NonNullable<StubCardProps["tone"]>, string> = {
  ink: "text-ink",
  teal: "text-teal",
  gold: "text-gold",
  brick: "text-brick",
};

function StubCard({ label, value, tone = "ink" }: StubCardProps) {
  return (
    <div className="stub">
      <span className="stub-label">{label}</span>
      <p
        className={`font-mono text-2xl tabular-nums mt-3 ${toneClasses[tone]}`}
      >
        {value}
      </p>
    </div>
  );
}

export default StubCard;
