export function StatusPill({ status }: { status?: string }) {
  const s = status || "Draft";
  const cls = s.toLowerCase().replace(/\s+/g, "-");
  return <span className={`pill ${cls}`}>{s}</span>;
}

export function fmt(n: number | null | undefined, digits = 1): string {
  return n === null || n === undefined ? "—" : n.toFixed(digits);
}

export function daysAgo(iso?: string): string {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "today";
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}
