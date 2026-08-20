import { NextResponse } from "next/server";
import admin from "firebase-admin";

// Lazy-initialize the Firebase Admin SDK (server-side only).
// Credentials come from Vercel environment variables — never bundled in the client.
function getAdmin() {
  if (!admin.apps.length) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
  return admin;
}

/**
 * POST /api/notify-admin
 *
 * Sends an FCM push notification to all admin devices (topic "admins")
 * whenever a customer places an order or requests a deposit.
 *
 * Body: { type: "order" | "deposit", id: "<firestore doc id>" }
 *
 * The function reads the actual document from Firestore (so the notification
 * always reflects real, server-verified data) and pushes to the admins topic.
 *
 * This runs on Vercel (free) — no Firebase Blaze plan required.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" });
  }

  const type = body?.type;
  const id = body?.id;

  if ((type !== "order" && type !== "deposit") || !id) {
    return NextResponse.json({ ok: false, error: "type + id required" });
  }

  try {
    const app = getAdmin();
    const db = app.firestore();

    if (type === "order") {
      const snap = await db.collection("orders").doc(id).get();
      if (!snap.exists) return NextResponse.json({ ok: false, error: "order not found" });
      const o = snap.data();
      const title = "🔔 New Order";
      const bodyText =
        `Customer: ${o.customerName || "Customer"}\n` +
        `Order ID: ${o.orderId || id}\n` +
        `Product: ${o.productName || "Top Up"}\n` +
        `Amount: ৳${o.amount || 0}`;

      // Data-only message: always delivered via onMessageReceived, where the
      // app skips it when RealtimeAlert is already showing the local alert
      // (prevents double notifications).
      await app.messaging().send({
        topic: "admins",
        data: {
          type: "order",
          title,
          body: bodyText,
          orderId: id,
          orderNumber: String(o.orderId || id),
        },
        android: { priority: "high" },
      });
      return NextResponse.json({ ok: true });
    } else {
      // deposit
      const snap = await db.collection("deposits").doc(id).get();
      if (!snap.exists) return NextResponse.json({ ok: false, error: "deposit not found" });
      const d = snap.data();
      const title = "💰 New Deposit Request";
      const bodyText =
        `Amount: ৳${d.amount || 0}\n` +
        `Method: ${(d.method || "").toUpperCase()}`;

      await app.messaging().send({
        topic: "admins",
        data: {
          type: "deposit",
          title,
          body: bodyText,
          depositId: id,
          amount: String(d.amount || 0),
          method: String(d.method || ""),
        },
        android: { priority: "high" },
      });
      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    console.error("notify-admin error:", e);
    return NextResponse.json({ ok: false, error: "push failed" });
  }
}
