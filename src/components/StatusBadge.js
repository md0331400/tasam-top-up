import { STATUS_META } from "@/lib/config";

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: "#6b7280" };
  return (
    <span className="status-badge" style={{ background: meta.color + "22", color: meta.color }}>
      {meta.label}
    </span>
  );
}
