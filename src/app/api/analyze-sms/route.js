import { NextResponse } from "next/server";

/**
 * POST /api/analyze-sms
 *
 * Serverless function that asks Gemini AI to parse a payment SMS
 * (bKash / Nagad / Rocket send-money confirmation).
 *
 * The Gemini API key is read from the Vercel environment variable
 * GEMINI_API_KEY — it is NEVER present in the client bundle or public code.
 *
 * Request body: { sms: "raw SMS text" }
 * Response: { service, trxId, amount, sender, success, confident }
 * On any failure → { confident: false } so the caller keeps the deposit PENDING.
 */
export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ confident: false, reason: "AI not configured" });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ confident: false, reason: "invalid request" });
  }

  const sms = (body && body.sms) || "";
  if (!sms.trim()) {
    return NextResponse.json({ confident: false, reason: "sms text required" });
  }

  const prompt =
    "You are a payment SMS parser. Extract from this message (if present):\n" +
    "- payment service (bkash / nagad / rocket)\n" +
    "- transaction id (TrxID)\n" +
    "- amount (BDT taka)\n" +
    "- sender number\n" +
    "- whether it is a successful send-money confirmation\n\n" +
    'Reply as strict JSON only: {"service":"...","trxId":"...","amount":0,"sender":"...","success":true,"confident":true}\n\n' +
    "Message:\n" +
    sms;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ confident: false, reason: `AI HTTP ${res.status}` });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) {
      return NextResponse.json({ confident: false, reason: "AI could not parse" });
    }

    const parsed = JSON.parse(m[0]);
    parsed.confident = parsed.confident !== false;
    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Gemini error:", e);
    return NextResponse.json({ confident: false, reason: "AI error" });
  }
}
