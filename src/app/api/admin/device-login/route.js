import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

// ---------------------------------------------------------------------------
// POST /api/admin/device-login
//
// Secure admin authentication via an authorized Device Key.
//
// The admin app sends its Device Key. We (server-side, Admin SDK) check:
//   1. The key exists in adminDevices/{deviceKey}.
//   2. isActive == true (not disabled/revoked).
//   3. Resolve the admin uid (see resolveAdminUid below).
//   4. Confirm that uid still has role == "admin".
//
// If all pass, we mint a custom token for that admin uid and return it.
// The client then signs in with signInWithCustomToken().
//
// This is NOT "frontend → Firestore → check role". Device authorization is
// verified server-side, and no master key/secret lives in the frontend.
// ---------------------------------------------------------------------------

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const deviceKey = String(body?.deviceKey || "").trim();
  if (!deviceKey) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "server_unavailable" }, { status: 500 });
  }

  try {
    const db = admin.firestore();

    // 1. Look up the device record.
    const snap = await db.collection("adminDevices").doc(deviceKey).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "not_authorized" });
    }

    const data = snap.data();

    if (data.isActive !== true) {
      return NextResponse.json({ error: "device_disabled" });
    }

    // 2. Resolve the admin uid (device doc → global settings/admin).
    const uid = await resolveAdminUid(admin, db, data);
    if (!uid) {
      return NextResponse.json({ error: "not_authorized" });
    }

    // 3. Confirm the bound account is still an admin.
    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists || userSnap.data().role !== "admin") {
      return NextResponse.json({ error: "not_authorized" });
    }

    // 4. Update lastLoginAt (best-effort, non-fatal).
    try {
      await snap.ref.update({
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (_) { /* non-fatal */ }

    // 5. Mint a custom token for the admin uid.
    const token = await admin.auth().createCustomToken(uid);
    return NextResponse.json({ token });
  } catch (e) {
    console.error("device-login error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

/**
 * Resolve which admin a device maps to, in order of precedence:
 *   1. device doc `uid`           (explicit, per-device)
 *   2. device doc `adminEmail`    (explicit, per-device)
 *   3. settings/admin `uid`       (global fallback)
 *   4. settings/admin `adminEmail` (global fallback)
 *
 * The global `settings/admin` fallback means a device record can be authorized
 * with JUST `isActive: true` — no uid/email on the device itself. The admin
 * identity lives in ONE place (settings/admin), set once.
 */
async function resolveAdminUid(admin, db, deviceData) {
  // Per-device explicit identity.
  if (deviceData.uid) return deviceData.uid;
  if (deviceData.adminEmail) {
    try {
      const u = await admin.auth().getUserByEmail(deviceData.adminEmail);
      return u.uid;
    } catch (_) { /* fall through to global */ }
  }

  // Global fallback.
  try {
    const s = await db.collection("settings").doc("admin").get();
    if (!s.exists) return "";
    const sd = s.data();
    if (sd.uid) return sd.uid;
    if (sd.adminEmail) {
      const u = await admin.auth().getUserByEmail(sd.adminEmail);
      return u.uid;
    }
  } catch (_) { /* ignore */ }

  return "";
}
