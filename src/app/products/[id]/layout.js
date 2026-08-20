import { SEO } from "@/lib/seo";

export const metadata = {
  title: SEO.productDetail.title,
  description: SEO.productDetail.description,
  keywords: SEO.productDetail.keywords,
  robots: { index: true, follow: true },
};

export default function Layout({ children }) {
  return children;
}
