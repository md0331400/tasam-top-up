import { SEO } from "@/lib/seo";

export const metadata = {
  title: SEO.order.title,
  description: SEO.order.description,
  keywords: SEO.order.keywords,
  robots: { index: false, follow: false },
};

export default function Layout({ children }) {
  return children;
}
