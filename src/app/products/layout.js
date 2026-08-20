import { SEO } from "@/lib/seo";

export const metadata = {
  title: SEO.products.title,
  description: SEO.products.description,
  keywords: SEO.products.keywords,
  robots: { index: true, follow: true },
};

export default function Layout({ children }) {
  return children;
}
