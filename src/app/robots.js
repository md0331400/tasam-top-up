import { SITE } from "@/lib/config";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/checkout", "/order", "/notifications"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
