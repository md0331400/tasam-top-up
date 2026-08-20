import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";

// ---------------------------------------------------------------------------
// POST /api/auth/phone-login
//
// Lets a user sign in with their REGISTERED PHONE NUMBER + password without
// ever exposing the associated email address to the client.
//
// Flow:
//   1. Normalize the phone number.
//   2. Resolve phone → email via the phoneIndex (Firestore, server-side).
//   3. Verify email + password against Firebase Auth using the official REST
//      endpoint (identitytoolkit) — the password is never stored/logged.
//   4. Mint a custom token for that user (Admin SDK) and return it.
//   5. Client signs in with signInWithCustomToken().
//
// The client only ever sees a token — never another user's email or uid.
// ---------------------------------------------------------------------------

function normalizePhone(input) {
  let s = String(input || "").replace(/[^\d]/g, "");
  if (s.startsWith("880") && s.length === 13) s = "0" + s.slice(3);
  return s;
}

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyCQZ98FVlsSyuXI4klOgPKjHzrRJRe7wG4";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const phone = normalizePhone(body?.phone);
  const password = body?.password || "";

  if (!phone || !password) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const admin = getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "server_unavailable" }, { status: 500 });
  }

  try {
    const db = admin.firestore();

    // 1. Resolve phone → email
    const snap = await db.collection("phoneIndex").doc(phone).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "phone_not_found" });
    }
    const email = snap.data().email || "";
    const uid = snap.data().uid || "";
    if (!email || !uid) {
      return NextResponse.json({ error: "phone_not_found" });
    }

    // 2. Verify credentials via Firebase Auth REST API
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: false }),
      }
    );
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const code = data?.error?.message || "";
      if (code.includes("INVALID_LOGIN_CREDENTIALS") || code.includes("INVALID_PASSWORD")) {
        return NextResponse.json({ error: "invalid_credentials" });
      }
      if (code.includes("USER_DISABLED")) {
        return NextResponse.json({ error: "user_disabled" });
      }
      if (code.includes("TOO_MANY_ATTEMPTS_TRY_LATER")) {
        return NextResponse.json({ error: "too_many_requests" });
      }
      return NextResponse.json({ error: "login_failed" });
    }

    // 3. Mint a custom token for the verified user
    const token = await admin.auth().createCustomToken(uid);
    return NextResponse.json({ token });
  } catch (e) {
    console.error("phone-login error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
