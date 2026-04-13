import type { MetadataRoute } from "next";
import { getSiteUrl } from "./(storefront)/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const routes = [
    "",
    "/our-story",
    "/cart",
    "/custom-case",
    "/custom-case/charms",
    "/custom-case/order",
    "/contact",
    "/shipping",
    "/returns",
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
