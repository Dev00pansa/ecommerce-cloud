// CRITICAL: Do NOT delete or modify — required for Google Search Console indexing
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/credits", "/login"],
      disallow: ["/dashboard", "/dashboard/", "/api/"],
    },
    sitemap: "https://khumlab.vercel.app/sitemap.xml",
    host: "https://khumlab.vercel.app",
  };
}
