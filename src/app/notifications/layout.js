import { SEO } from "@/lib/seo";

export const metadata = {
  title: SEO.notifications.title,
  description: SEO.notifications.description,
  keywords: SEO.notifications.keywords,
  robots: { index: false, follow: true },
};

export default function Layout({ children }) {
  return children;
}
