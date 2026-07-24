import type { MetadataRoute } from "next";
import { GALLERY_HREFS } from "@/lib/gallery-data";
import { source } from "@/source";

const SITE_URL = "https://snap-cn.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      // The components gallery is a bespoke route, not an MDX page, so
      // `source.getPages()` below no longer emits it — add it explicitly.
      url: `${SITE_URL}/docs/components`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const docRoutes: MetadataRoute.Sitemap = source
    .getPages()
    // Component docs are no longer standalone pages — their routes redirect into
    // the `/docs/components` overlay (already listed above), so keep the
    // redirecting URLs out of the sitemap.
    .filter((page) => !GALLERY_HREFS.has(page.url))
    .map((page) => ({
      url: `${SITE_URL}${page.url}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...docRoutes];
}
