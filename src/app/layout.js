import "./globals.css";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NoticeBar from "@/components/NoticeBar";
import MobileNav from "@/components/MobileNav";
import { SITE } from "@/lib/config";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const OG_IMAGE = `${SITE.url}/og-banner.png`;
const LOGO = `${SITE.url}/logo.png`;

// Social preview title + SEO default title (brand + keywords, human-readable)
const PREVIEW_TITLE =
  "TASAM TOP UP BD — Tasam Top Up | Free Fire Diamond Top Up Bangladesh";
const PREVIEW_DESCRIPTION =
  "TASAM TOP UP BD is Bangladesh's fast, safe and reliable game top-up platform. Buy Free Fire diamonds, PUBG UC and more with bKash, Nagad, Rocket or wallet — instant delivery, 24/7 support.";

export const metadata = {
  title: {
    default: PREVIEW_TITLE,
    template: `%s | TASAM TOP UP BD`,
  },
  description: PREVIEW_DESCRIPTION,
  keywords: SITE.keywords,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "Game Top Up",
  metadataBase: new URL(SITE.url),
  // Open Graph — social media link preview (Facebook, WhatsApp, Messenger)
  openGraph: {
    title: PREVIEW_TITLE,
    description: PREVIEW_DESCRIPTION,
    url: SITE.url,
    siteName: "TASAM TOP UP BD",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: PREVIEW_TITLE,
      },
    ],
  },
  // Twitter / X card
  twitter: {
    card: "summary_large_image",
    title: PREVIEW_TITLE,
    description: PREVIEW_DESCRIPTION,
    images: [OG_IMAGE],
  },
  // Favicon, Apple touch icon and manifest (all point to real files in /public)
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: SITE.url },
};

// JSON-LD structured data (Organization + WebSite) — single, non-duplicated graph.
// Associates: TASAM TOP UP BD / Tasam TopUp / tasamtopupbd.vercel.app / official logo.
export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: "TASAM TOP UP BD",
      alternateName: "Tasam TopUp",
      url: SITE.url,
      logo: {
        "@type": "ImageObject",
        url: LOGO,
        width: 1024,
        height: 1024,
      },
      image: LOGO,
      description: SITE.description,
      telephone: SITE.support.phone,
      email: SITE.support.email,
      sameAs: [
        SITE.support.facebook,
        SITE.support.telegram,
        SITE.support.whatsapp,
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: "TASAM TOP UP BD",
      alternateName: "Tasam TopUp",
      description: SITE.description,
      publisher: { "@id": `${SITE.url}/#organization` },
      inLanguage: "bn-BD",
    },
  ],
};

// FAQPage structured data — matches the home-page FAQ section, targets
// high-intent "how to top up" queries for rich results / featured snippets.
export const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "কীভাবে Free Fire ডায়মন্ড টপ আপ করবো?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "গেম বেছে নিন, Free Fire UID দিন, প্যাকেজ সিলেক্ট করুন, bKash/Nagad/Rocket দিয়ে পেমেন্ট করুন। পেমেন্ট confirm হলেই সাথে সাথে ডায়মন্ড আপনার অ্যাকাউন্টে চলে আসে।",
      },
    },
    {
      "@type": "Question",
      name: "Free Fire ডায়মন্ড কতক্ষণে ডেলিভারি হয়?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "বেশিরভাগ অর্ডার মাত্র কয়েক মিনিটের মধ্যে ডেলিভারি হয়। পেমেন্ট verify হয়ে গেলে ডায়মন্ড সাথে সাথে Free Fire অ্যাকাউন্টে যোগ হয়ে যায়।",
      },
    },
    {
      "@type": "Question",
      name: "কোন কোন পেমেন্ট পদ্ধতি সাপোর্টেড?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "bKash, Nagad, Rocket এবং Wallet ব্যালেন্স — সবকটি পেমেন্ট পদ্ধতিই সাপোর্টেড। কোনো ক্রেডিট কার্ড লাগবে না।",
      },
    },
    {
      "@type": "Question",
      name: "টপ আপ করা কি নিরাপদ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "হ্যাঁ, সম্পূর্ণ নিরাপদ। শুধু Player ID/UID লাগে, কখনো পাসওয়ার্ড চাওয়া হয় না। অ্যাকাউন্ট সম্পূর্ণ সুরক্ষিত থাকে।",
      },
    },
    {
      "@type": "Question",
      name: "Free Fire ছাড়া অন্য কোন গেম সাপোর্টেড?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Free Fire ছাড়াও PUBG Mobile UC, Mobile Legends ডায়মন্ড, eFootball Coins সহ আরও জনপ্রিয় গেমের টপ আপ সাপোর্টেড।",
      },
    },
    {
      "@type": "Question",
      name: "সবচেয়ে কম দামে Free Fire ডায়মন্ড কোথায় পাবো?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "TASAM TOP UP BD-তে Bangladesh-এর সেরা দামে Free Fire ডায়মন্ড পাবেন। নিয়মিত অফার ও ডিসকাউন্টের জন্য পেজ ফলো করুন।",
      },
    },
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e11d48",
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={poppins.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      </head>
      <body>
        <AuthProvider>
          <SettingsProvider>
            <NoticeBar />
            <Navbar />
            <main className="main">{children}</main>
            <Footer />
            <MobileNav />
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
