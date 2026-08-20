// Central site configuration — these are the DEFAULT / fallback values.
// The live values (payment numbers, support info) are stored in Firestore
// under  settings/site  so the admin app can edit them later. When Firestore
// is unavailable, the site falls back to these defaults.
export const SITE = {
  name: "TASAM TOP UP BD",
  alternateName: "Tasam TopUp",
  shortName: "TASAM TOP UP",
  tagline: "Fast, Safe & Reliable",
  description:
    "TASAM TOP UP BD is Bangladesh's fast, safe and reliable game top-up platform. Buy Free Fire diamonds, PUBG UC and more instantly with bKash, Nagad, Rocket or wallet — 24/7 support.",
  url: "https://tasamtopupbd.vercel.app",
  currency: "৳",
  // SEO keywords (hidden meta keywords + used for structured data)
  keywords: [
    "tasam top up bd",
    "tasam topup",
    "free fire diamond top up bd",
    "free fire diamond top up bangladesh",
    "buy free fire diamonds bangladesh",
    "free fire top up bd",
    "free fire diamond price bangladesh",
    "free fire recharge bd",
    "game top up bd",
    "game top up bangladesh",
    "pubg mobile uc top up bd",
    "pubg uc bangladesh",
    "mobile legends diamond top up bd",
    "mlbb diamond bangladesh",
    "efootball coins top up bd",
    "free fire top up bkash",
    "free fire diamond nagad",
    "game top up rocket",
    "free fire top up bkash nagad rocket",
    "free fire weekly membership",
    "free fire monthly membership",
    "free fire elite pass top up",
    "free fire diamond cheap",
    "cheapest free fire diamond in bangladesh",
    "ফ্রি ফায়ার ডায়মন্ড টপ আপ",
    "ফ্রি ফায়ার ডায়মন্ড কিনুন",
    "ফ্রি ফায়ার টপ আপ বাংলাদেশ",
    "গেম টপ আপ বিডি",
    "পাবজি ইউসি টপ আপ",
    "free fire top up",
    "free fire diamond",
    "Free Fire UID top up",
    "bKash",
    "Nagad",
    "Rocket",
    "mobile game recharge",
    "diamond recharge",
    "top up service Bangladesh",
  ],
  // Logo image URL (defaults to /logo.png; admin can override via settings/site.logoUrl)
  logoUrl: "/logo.png",
  // Top notice bar text (editable from admin app via settings/site.notice)
  notice:
    "এখানে আমাদের সাইটে রাত দিন ২৪ ঘন্টা অর্ডার করতে পারবেন। যে কোন সমস্যায় টেলিগ্রাম সাপোর্টে যোগাযোগ করুন। ধন্যবাদ।",
  // Payment numbers (defaults — editable from admin app via settings/site)
  payment: {
    bkash: { number: "01962610866", type: "Personal" },
    nagad: { number: "01962610866", type: "Personal" },
    rocket: { number: "01962610866", type: "Personal" },
  },
  // Permanent payment-method logos (bundled locally — NOT editable).
  payLogos: {
    bkash: "/pay/bkash.png",
    nagad: "/pay/nagad.png",
    rocket: "/pay/rocket.png",
  },
  // Support info (defaults — editable from admin app via settings/site)
  support: {
    telegram: "https://t.me/amisayembro",
    telegramGroup: "https://t.me/amisayembro",
    whatsapp: "https://wa.me/8801962610866",
    facebook: "https://m.facebook.com/amisayemm",
    phone: "01962610866",
    email: "support@tasamtopupbd.com",
  },
  // Free Fire UID → account name lookup (Games Kinbo API).
  // Needs a free API key (sign in at api.gameskinbo.com). Put it in apiKey.
  ffInfo: {
    baseUrl: "https://api.gameskinbo.com/ff-info/get",
    region: "BD",
    apiKey: "IRukLziT7C3dTuFaa8ZFaRY2x-Rx3WCAwqilFMHDNEo",
  },
};

// Order statuses used across website + admin app (keep in sync!)
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const STATUS_META = {
  pending: { label: "Pending", color: "#f59e0b" },
  processing: { label: "Processing", color: "#3b82f6" },
  completed: { label: "Completed", color: "#16a34a" },
  cancelled: { label: "Cancelled", color: "#9ca3af" },
  failed: { label: "Failed", color: "#ef4444" },
  refunded: { label: "Refunded", color: "#8b5cf6" },
};

// Preferred display order of game categories (others appended after)
export const CATEGORY_ORDER = ["Free Fire"];
