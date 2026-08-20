import { SEO } from "@/lib/seo";

export const metadata = {
  title: SEO.deposit.title,
  description: SEO.deposit.description,
  keywords: SEO.deposit.keywords,
  robots: { index: false, follow: true },
};

export default function Layout({ children }) {
  return children;
}
