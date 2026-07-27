import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { remotionWebpackAlias } from "./remotion-aliases";

/**
 * Resolves the Remotion `serveUrl` that `selectComposition`/`renderMedia` need.
 *
 * Bundling is expensive, so it happens at most once per process: if the deploy
 * baked a pre-bundle into `.remotion-bundle/` (see scripts/bundle-remotion.mts),
 * that path is returned directly; otherwise we lazily `bundle()` the entry once
 * and cache the in-flight promise so concurrent first renders share it.
 */

const PREBUNDLED_DIR = path.join(process.cwd(), ".remotion-bundle");
const ENTRY_POINT = path.join(process.cwd(), "src", "remotion", "index.ts");

let serveUrlPromise: Promise<string> | null = null;

export function getServeUrl(): Promise<string> {
  if (serveUrlPromise) return serveUrlPromise;

  serveUrlPromise = (async () => {
    if (existsSync(PREBUNDLED_DIR)) {
      return PREBUNDLED_DIR;
    }
    try {
      // Imported here, not at module scope. This file is reachable from the
      // /api/render route, and `@remotion/tailwind-v4` pulls in the native
      // `@tailwindcss/oxide` binary — which Turbopack cannot place in an ESM
      // chunk, so a static import fails the whole site build. It is only ever
      // needed on this Node-side path.
      const { enableTailwind } = await import(
        /* webpackIgnore: true */ /* turbopackIgnore: true */
        "@remotion/tailwind-v4"
      );
      return await bundle({
        entryPoint: ENTRY_POINT,
        // Webpack doesn't read tsconfig `paths`; teach it every alias the
        // registry relies on (must match scripts/bundle-remotion.mts).
        // Tailwind first, then the aliases. Without `enableTailwind` every
        // class in a registry component is inert in the render.
        webpackOverride: (raw) => {
          const config = enableTailwind(raw);
          return {
            ...config,
            resolve: {
              ...config.resolve,
              alias: {
                ...(config.resolve?.alias ?? {}),
                ...remotionWebpackAlias(process.cwd()),
              },
            },
          };
        },
      });
    } catch (err) {
      // Don't poison the cache on failure — let the next render retry the bundle.
      serveUrlPromise = null;
      throw err;
    }
  })();

  return serveUrlPromise;
}
