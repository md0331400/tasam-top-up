import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

// ---------------------------------------------------------------------------
// POST /api/admin/device-login
//
// Secure admin authentication via an authorized Device Key.
//
// SIMPLE MODEL (as requested):
//   • An admin authorizes a device by creating a doc in adminDevices with the
//     device key as the doc id (only `deviceName` is needed — no uid/email).
//   • To revoke a device, the admin deletes that doc from Firestore.
//   • A device is "disabled" if it has isActive == false (optional).
//
// The admin identity is resolved automatically (the admin's `users` doc has
// role == "admin"), so the owner never has to type an email or uid anywhere.
//
// Flow:
//   1. deviceKey exists in adminDevices/{deviceKey}?  → else "not_authorized"
//   2. isActive != false                              → else "device_disabled"
//   3. resolve an admin uid (device doc → settings/admin → first role==admin)
//   4. mint a custom token for that uid
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

    // 1. Device must be authorized (doc exists with this key as its id).
    const snap = await db.collection("adminDevices").doc(deviceKey).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "not_authorized" });
    }

    const data = snap.data();

    // 2. Optional explicit disable (only blocks when the field is exactly false).
    if (data.isActive === false) {
      return NextResponse.json({ error: "device_disabled" });
    }

    // 3. Resolve an admin uid.
    const uid = await resolveAdminUid(admin, db, data);
    if (!uid) {
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
 * Resolve the admin uid, in order of precedence:
 *   1. device doc `uid`
 *   2. device doc `adminEmail`
 *   3. settings/admin `uid` or `adminEmail`
 *   4. first user with role == "admin" (automatic — nothing to configure)
 */
async function resolveAdminUid(admin, db, deviceData) {
  if (deviceData.uid) return deviceData.uid;
  if (deviceData.adminEmail) {
    try {
      const u = await admin.auth().getUserByEmail(deviceData.adminEmail);
      return u.uid;
    } catch (_) { /* fall through */ }
  }

  try {
    const s = await db.collection("settings").doc("admin").get();
    if (s.exists) {
      const sd = s.data();
      if (sd.uid) return sd.uid;
      if (sd.adminEmail) {
        try {
          const u = await admin.auth().getUserByEmail(sd.adminEmail);
          return u.uid;
        } catch (_) { /* fall through */ }
      }
    }
  } catch (_) { /* ignore */ }

  // Automatic fallback: the admin is the user whose role is "admin".
  try {
    const snap = await db.collection("users")
      .where("role", "==", "admin")
      .limit(1)
      .get();
    if (!snap.empty) return snap.docs[0].id;
  } catch (_) { /* ignore */ }

  return "";
}
