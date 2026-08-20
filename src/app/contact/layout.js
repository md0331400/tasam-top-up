import { SEO } from "@/lib/seo";

export const metadata = {
  title: SEO.contact.title,
  description: SEO.contact.description,
  keywords: SEO.contact.keywords,
  robots: { index: true, follow: true },
};

export default function Layout({ children }) {
  return children;
}
