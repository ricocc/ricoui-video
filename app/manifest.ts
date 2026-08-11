import type { MetadataRoute } from "next";

// Web app manifest (Next auto-links it at /manifest.webmanifest). Replaces the
// favicon.io site.webmanifest; the PWA icons live in public/.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "snapcn — Cinematic video components for React",
    short_name: "snapcn",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: "#0A0A0A",
    background_color: "#0A0A0A",
    display: "standalone",
  };
}
