import { SITE } from "@/lib/config";

// ---------------------------------------------------------------------------
// Sitemap for https://tasamtopupbd.vercel.app
//
//   • Static public routes (home, top up, login, register, deposit, contact)
//   • Dynamic product pages  (/products/[id])  fetched from Firestore
//
// Dynamic pages are fetched server-side via the Firebase Admin SDK. If the
// credentials aren't configured yet, it gracefully falls back to the static
// routes only (no crash).
// ---------------------------------------------------------------------------

const STATIC_ROUTES = [
  { route: "", changeFrequency: "weekly", priority: 1.0 },
  { route: "/products", changeFrequency: "daily", priority: 0.9 },
  { route: "/login", changeFrequency: "monthly", priority: 0.5 },
  { route: "/register", changeFrequency: "monthly", priority: 0.5 },
  { route: "/deposit", changeFrequency: "monthly", priority: 0.7 },
  { route: "/contact", changeFrequency: "monthly", priority: 0.5 },
];

async function getDynamicEntries() {
  try {
    const { getAdmin } = await import("@/lib/admin");
    const admin = getAdmin();
    if (!admin) return [];
    const db = admin.firestore();

    const productsSnap = await db
      .collection("products")
      .where("isActive", "==", true)
      .get();

    const entries = [];
    productsSnap.forEach((doc) => {
      entries.push({
        url: `${SITE.url}/products/${doc.id}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.7,
      });
    });
    return entries;
  } catch (e) {
    // Firestore unavailable / credentials missing → static routes only.
    return [];
  }
}

export default async function sitemap() {
  const base = SITE.url;
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((r) => ({
    url: `${base}${r.route}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const dynamicEntries = await getDynamicEntries();

  return [...staticEntries, ...dynamicEntries];
}
