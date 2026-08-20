import type { MetadataRoute } from "next";
import { GALLERY_HREFS } from "@/lib/gallery-data";
import { source } from "@/source";

const SITE_URL = "https://video.ricoui.com";

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

  const docPaths = new Set(
    source
      .getPages()
      .map((page) => page.url.replace(/^\/zh(?=\/|$)/, "") || "/"),
  );

  const docRoutes: MetadataRoute.Sitemap = [...docPaths]
    // Component docs are no longer standalone pages — their routes redirect into
    // the `/docs/components` overlay (already listed above), so keep the
    // redirecting URLs out of the sitemap.
    .filter((url) => !GALLERY_HREFS.has(url))
    .map((url) => ({
      url: `${SITE_URL}${url}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const chineseRoutes = [...staticRoutes, ...docRoutes];
  const englishRoutes = chineseRoutes.map((route) => ({
    ...route,
    url: route.url.replace(SITE_URL, `${SITE_URL}/en`),
  }));

  return [...chineseRoutes, ...englishRoutes];
}
