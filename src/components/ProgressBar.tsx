export function ProgressBar({
  percent,
  tone = "ink",
  label,
}: {
  percent: number;
  tone?: "ink" | "accent" | "faint";
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="bar"
      data-tone={tone}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span style={{ width: `${clamped}%` }} />
    </div>
  );
}
