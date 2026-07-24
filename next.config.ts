import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remotion's server packages are Node-only and ship native binaries (esbuild +
  // the platform-specific @remotion/compositor-*). They must NOT be bundled by
  // Turbopack/webpack — keep them external so they're require()'d at runtime in
  // the /api/render route. Without this the build fails resolving the compositor
  // binaries + reading the esbuild binary as source.
  serverExternalPackages: [
    "@remotion/renderer",
    "@remotion/bundler",
    "esbuild",
  ],
  turbopack: {
    root: __dirname,
  },
  // Rendered demos always ship to the SAME path (`/demos/<slug>.mp4`), so a
  // browser that has one will happily keep replaying it after the file underneath
  // has been re-rendered — <video> caches especially hard. That cost two rounds of
  // "why am I still seeing the old one". In dev, never cache them; in production,
  // always revalidate (a 304 is cheap and these change on every deploy).
  async headers() {
    return [
      {
        source: "/demos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              process.env.NODE_ENV === "development"
                ? "no-store"
                : "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
  typescript: {
    // Gate the production build on app code only; vitest owns test typing and
    // the render scripts run under node with their own import rules.
    tsconfigPath: "tsconfig.build.json",
  },
};

export default withMDX(nextConfig);
