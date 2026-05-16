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
    <div className="border border-sand bg-surface rounded-md p-6">
      <div className="text-xs uppercase tracking-wider text-muted mb-2">{label}</div>
      <div className="font-serif text-4xl font-tabular tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted mt-2">{hint}</div>}
    </div>
  );
}
