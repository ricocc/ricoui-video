import type { MetadataRoute } from "next";

const SITE_URL = "https://video.ricoui.com";

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
