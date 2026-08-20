import { SEO } from "@/lib/seo";

export const metadata = {
  title: SEO.dashboard.title,
  description: SEO.dashboard.description,
  keywords: SEO.dashboard.keywords,
  robots: { index: false, follow: true },
};

export default function Layout({ children }) {
  return children;
}
