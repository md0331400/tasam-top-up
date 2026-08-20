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
//   3. The bound uid still has role == "admin".
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

    const uid = data.uid || "";
    if (!uid) {
      return NextResponse.json({ error: "not_authorized" });
    }

    // 2. Confirm the bound account is still an admin.
    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists || userSnap.data().role !== "admin") {
      return NextResponse.json({ error: "not_authorized" });
    }

    // 3. Update lastLoginAt (best-effort, non-fatal).
    try {
      await snap.ref.update({
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (_) { /* non-fatal */ }

    // 4. Mint a custom token for the admin uid.
    const token = await admin.auth().createCustomToken(uid);
    return NextResponse.json({ token });
  } catch (e) {
    console.error("device-login error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
