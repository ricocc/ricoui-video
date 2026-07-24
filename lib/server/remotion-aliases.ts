import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * The Remotion bundler (webpack) doesn't read tsconfig `paths`, but the registry
 * components rely on them — e.g. `@/lib/snap-cn-ui` → `registry/snap-cn-ui/core`
 * and `@/components/snap-cn/*` → `registry/snap-cn-ui/*​/index.tsx`. The
 * single-composition bundle got away with a single `@ → root` alias; once the
 * `video-timeline` composition pulls the WHOLE registry into the bundle, every
 * one of those aliased imports has to resolve.
 *
 * So we translate each tsconfig `paths` entry into a webpack `resolve.alias`:
 *   • exact keys (no `*`) → `"<key>$": <abs target>` (`$` = exact-match only)
 *   • wildcard keys (`<key>/*`) → `"<key>": <abs dir before the `*`>`, letting
 *     webpack's directory-index resolution turn `<dir>/<name>` into
 *     `<dir>/<name>/index.tsx` (matches `registry/snap-cn-ui/*​/index.tsx`).
 *
 * Insertion order is preserved from the tsconfig (specific entries first, the
 * catch-all `@/*` last), which is also the alias precedence webpack applies.
 * Kept in one place so `lib/server/bundle.ts` (runtime) and
 * `scripts/bundle-remotion.mts` (pre-bundle) can't drift.
 */
export function remotionWebpackAlias(root: string): Record<string, string> {
  const raw = readFileSync(path.join(root, "tsconfig.json"), "utf8");
  const { compilerOptions } = JSON.parse(raw) as {
    compilerOptions?: { paths?: Record<string, string[]> };
  };
  const paths = compilerOptions?.paths ?? {};
  const alias: Record<string, string> = {};

  for (const [key, targets] of Object.entries(paths)) {
    const target = targets[0];
    if (!target) continue;

    if (key.endsWith("/*")) {
      const aliasKey = key.slice(0, -2); // drop the trailing "/*"
      const star = target.indexOf("*");
      const dir = (star === -1 ? target : target.slice(0, star)).replace(
        /\/+$/,
        "",
      );
      alias[aliasKey] = path.resolve(root, dir || ".");
    } else {
      alias[`${key}$`] = path.resolve(root, target);
    }
  }

  return alias;
}
