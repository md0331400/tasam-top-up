import admin from "firebase-admin";

// ---------------------------------------------------------------------------
// Shared, lazy Firebase Admin SDK initializer (server-side only).
//
// Credentials come from Vercel environment variables:
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
//
// Returns null when credentials aren't configured yet, so callers can
// gracefully fall back (e.g. sitemap serves static routes only).
// ---------------------------------------------------------------------------

let initialized = false;
let initFailed = false;

export function getAdmin() {
  if (admin.apps.length) return admin;
  if (initFailed) return null;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";

  if (!projectId || !clientEmail || !rawKey) {
    initFailed = true;
    return null;
  }

  try {
    const privateKey = rawKey.replace(/\\n/g, "\n");
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    initialized = true;
    return admin;
  } catch (e) {
    initFailed = true;
    return null;
  }
}
