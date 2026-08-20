import { SEO } from "@/lib/seo";

export const metadata = {
  title: "My Orders",
  description: "View your Tasam Top Up order history and status.",
  robots: { index: false, follow: true },
};

export default function Layout({ children }) {
  return children;
}
