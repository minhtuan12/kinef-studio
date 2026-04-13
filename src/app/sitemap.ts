import type { MetadataRoute } from "next";
import { getSiteUrl } from "./(storefront)/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const routes: Array<{
    path: string;
    changeFrequency: "weekly" | "monthly";
    priority: number;
  }> = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/custom-case", changeFrequency: "weekly", priority: 0.9 },
    { path: "/our-story", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
