import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

/**
 * GET /api/auto-cancel
 *
 * Safety net for deposits that stayed PENDING too long (default 24h) — e.g.
 * the admin app was closed when its 20-second SMS auto-check would have run.
 *
 * NOTE: Orders are intentionally NOT automated — they are always processed
 * manually by the admin. Only deposits get automatic cleanup here.
 *
 * Triggered by a Vercel cron job (see vercel.json). The cron sends an
 * `Authorization: Bearer <CRON_SECRET>` header which we verify so random
 * visitors cannot trigger this.
 */

const DEFAULT_TIMEOUT_HOURS = 24;

export async function GET(request) {
  // Verify cron secret (Vercel injects CRON_SECRET automatically for crons).
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Firebase Admin not configured" }, { status: 500 });
  }

  const hours = Number(process.env.AUTO_CANCEL_HOURS || DEFAULT_TIMEOUT_HOURS);
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const db = admin.firestore();

  const summary = { cancelledDeposits: 0, cutoff };

  try {
    // ---- Stale pending deposits only (orders are manual) ----
    const depositsSnap = await db
      .collection("deposits")
      .where("status", "==", "pending")
      .get();

    for (const doc of depositsSnap.docs) {
      const data = doc.data();
      const created = data.createdAt?.toDate ? data.createdAt.toDate() : null;
      if (!created || created > cutoff) continue; // still fresh

      await doc.ref.update({
        status: "failed",
        reason: `Auto-failed (not verified within ${hours}h)`,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      summary.cancelledDeposits++;
    }

    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
