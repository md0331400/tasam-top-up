// Reusable metric value that auto-scales based on digit count so numbers
// never overflow the stat card.
//
//   • 1–2 digits  → larger, bold
//   • 3+ digits   → smaller, medium weight, auto-shrink
//
// Usage: <StatValue value={stats.total} />   (value can be number or string)

function digitCount(v) {
  const s = String(v ?? "").replace(/[^0-9]/g, "");
  return s.length;
}

export default function StatValue({ value }) {
  const digits = digitCount(value);
  const cls = digits >= 3 ? "stat-value stat-value--compact" : "stat-value";
  return <div className={cls}>{value}</div>;
}
