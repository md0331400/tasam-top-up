// Status styling (per spec palette)
const STATUS_STYLE = {
  completed: { label: "Completed", bg: "#E6F9F0", text: "#00A86B", icon: "✓" },
  pending: { label: "Pending", bg: "#FFF7E6", text: "#B45309", icon: "⏳" },
  processing: { label: "Processing", bg: "#EFF6FF", text: "#2563EB", icon: "⚙" },
  cancelled: { label: "Cancelled", bg: "#F3F4F6", text: "#6B7280", icon: "✕" },
  failed: { label: "Failed", bg: "#FEE2E2", text: "#DC2626", icon: "✕" },
  refunded: { label: "Refunded", bg: "#F3E8FF", text: "#7C3AED", icon: "↩" },
};

/* ---------- tiny inline SVG icons ---------- */
const Ic = ({ children, size = 16, color = "currentColor", stroke = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

/* Header: pink 3D package icon */
function PackageIcon({ color = "#EC4899" }) {
  return (
    <Ic color={color}>
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5" />
      <path d="M12 13v8" />
    </Ic>
  );
}

/* Date: blue calendar outline icon */
function CalendarIcon() {
  return (
    <Ic color="#0084FF">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Ic>
  );
}

/* Date: blue circular refresh/sync icon */
function SyncIcon() {
  return (
    <Ic color="#0084FF">
      <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9" />
      <path d="M21 3v6h-6" />
    </Ic>
  );
}

/* Data rows: outline box icon */
function BoxIcon() {
  return (
    <Ic size={18} color="#6B7280">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7l8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </Ic>
  );
}

/* Data rows: outline credit card icon */
function CardIcon() {
  return (
    <Ic size={18} color="#6B7280">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </Ic>
  );
}

/* Data rows: outline user icon */
function UserIcon() {
  return (
    <Ic size={18} color="#6B7280">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
    </Ic>
  );
}

/* Timestamp per reference: 13-07-2026 12:24:03 AM */
function formatDateTime(ts) {
  if (!ts) return "—";
  const d = ts && ts.toDate ? ts.toDate() : new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  let h = d.getHours();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const hh = String(h).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${mi}:${ss} ${ap}`;
}

/* Amount per reference: ৳158.00 (2 decimals) */
function formatAmount(n) {
  if (n === null || n === undefined || isNaN(n)) return "৳0.00";
  return (
    "৳" +
    Number(n).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default function OrderCard({ order }) {
  if (!order) return null;
  const st =
    STATUS_STYLE[order.status] || {
      label: order.status || "Unknown",
      bg: "#F3F4F6",
      text: "#6B7280",
      icon: "•",
    };

  return (
    <div className="order-card">
      {/* Header */}
      <div className="oc-head">
        <div className="oc-head-left">
          <span className="oc-pkg-box">
            <PackageIcon />
          </span>
          <span className="oc-number">Order #{order.orderId || order.id}</span>
        </div>
        <span className="oc-status-badge" style={{ background: st.bg, color: st.text }}>
          <span className="oc-status-icon">{st.icon}</span>
          {st.label}
        </span>
      </div>

      {/* Date & time 2-column section */}
      <div className="oc-dates">
        <div className="oc-date-cell">
          <span className="oc-date-icon">
            <CalendarIcon />
          </span>
          <span className="oc-date-text">
            <span className="oc-date-label">Order Date</span>
            <span className="oc-date-value">{formatDateTime(order.createdAt)}</span>
          </span>
        </div>
        <div className="oc-date-divider" />
        <div className="oc-date-cell">
          <span className="oc-date-icon">
            <SyncIcon />
          </span>
          <span className="oc-date-text">
            <span className="oc-date-label">Updated</span>
            <span className="oc-date-value">
              {formatDateTime(order.updatedAt || order.createdAt)}
            </span>
          </span>
        </div>
      </div>

      {/* Itemized rows */}
      <div className="oc-data">
        <div className="oc-data-row">
          <span className="oc-data-label">
            <BoxIcon /> Package
          </span>
          <span className="oc-data-value">{order.productName}</span>
        </div>
        <div className="oc-data-row">
          <span className="oc-data-label">
            <CardIcon /> Total Price
          </span>
          <span className="oc-data-value">{formatAmount(order.amount)}</span>
        </div>
        <div className="oc-data-row">
          <span className="oc-data-label">
            <UserIcon /> Player ID
          </span>
          <span className="oc-data-value oc-mono">{order.gameUid}</span>
        </div>
      </div>
    </div>
  );
}
