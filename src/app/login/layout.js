import { SEO } from "@/lib/seo";

export const metadata = {
  title: SEO.login.title,
  description: SEO.login.description,
  keywords: SEO.login.keywords,
  robots: { index: false, follow: true },
};

export default function Layout({ children }) {
  return children;
}
