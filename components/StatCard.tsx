export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="bg-surface p-6">
      <div className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-3">{label}</div>
      <div className="font-mono text-4xl font-bold tabular-nums text-ink">{value}</div>
      {hint && <div className="text-xs text-muted mt-2">{hint}</div>}
    </div>
  );
}
