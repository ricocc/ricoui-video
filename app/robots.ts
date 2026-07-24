import type { MetadataRoute } from "next";

const SITE_URL = "https://snap-cn.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Render endpoints are POST-driven API surface, not content.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
