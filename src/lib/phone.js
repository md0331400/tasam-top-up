// Normalize a Bangladeshi phone number to a canonical form for indexing.
//   "01712-345678"  → "01712345678"
//   "+8801712345678" → "01712345678"
//   "8801712345678"  → "01712345678"
// Returns "" if the result isn't a plausible 11-digit BD number.
export function normalizePhone(input) {
  if (!input) return "";
  let s = String(input).replace(/[^\d]/g, "");
  if (s.startsWith("880") && s.length === 13) s = "0" + s.slice(3);
  if (s.startsWith("88") && s.length === 12) s = "0" + s.slice(2);
  // Accept 11-digit numbers starting with 0 (BD mobile standard).
  if (/^01[3-9]\d{8}$/.test(s)) return s;
  return s; // return whatever remains (caller decides validity)
}

export function isValidPhone(input) {
  return /^01[3-9]\d{8}$/.test(normalizePhone(input));
}
