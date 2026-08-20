// Small formatting helpers
export function formatMoney(n) {
  if (n === null || n === undefined || isNaN(n)) return "৳0";
  return "৳" + Number(n).toLocaleString("en-BD");
}

export function formatDate(ts) {
  if (!ts) return "—";
  const d = ts && ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Generate a unique, human-friendly order id like TTB-10293
export function generateOrderId() {
  const seq = String(Date.now()).slice(-6); // 6 digits from timestamp
  const rand = String(Math.floor(1000 + Math.random() * 9000)); // 4 random digits
  return `TTB-${seq}${rand}`;
}
