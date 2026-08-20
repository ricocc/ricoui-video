import type { MetadataRoute } from "next";

// Web app manifest (Next auto-links it at /manifest.webmanifest). Replaces the
// favicon.io site.webmanifest; the PWA icons live in public/.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RICOUI Video — Remotion components for software demos",
    short_name: "RICOUI Video",
    description: "用于软件演示视频的 Remotion 可复制组件库。",
    lang: "zh-CN",
    start_url: "/",
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
