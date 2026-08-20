import { SEO } from "@/lib/seo";

export const metadata = {
  title: SEO.register.title,
  description: SEO.register.description,
  keywords: SEO.register.keywords,
  robots: { index: false, follow: true },
};

export default function Layout({ children }) {
  return children;
}
