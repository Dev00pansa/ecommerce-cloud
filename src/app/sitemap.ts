// CRITICAL: Do NOT delete or modify — required for Google Search Console indexing
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://khumlab.vercel.app",
      lastModified: "2026-11-23",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://khumlab.vercel.app/credits",
      lastModified: "2026-11-23",
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
