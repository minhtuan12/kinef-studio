import type { MetadataRoute } from "next";
import { getSiteUrl } from "./(storefront)/site-url";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/admin", "/api/admin", "/api/sepay/webhook"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
