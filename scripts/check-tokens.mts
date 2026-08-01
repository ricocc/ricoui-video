import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Fail if `registry/snap-cn-ui/core/theme.ts` and `app/globals.css` disagree.
 *
 * These two files describe the same design system to two different renderers:
 * `globals.css` is what the site's `components/ui/*` paint from, `theme.ts` is
 * what every component we *ship* paints from (a Remotion bundle has none of the
 * app's CSS, so the values have to be concrete — see the note in `theme.ts`).
 *
 * Nothing enforced that, so they drifted: `theme.ts` landed with a cool
 * blue-grey palette, `globals.css` was later re-skinned warm, and the videos on
 * the site stopped matching the site. This script is the thing that would have
 * caught it.
 *
 * Run: `pnpm run check:tokens`
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

/**
 * `radius` is deliberately excluded. It flows the other way: `globals.css` sets
 * `--radius: 0.28rem` so that its `--radius-3xl` step lands on `theme.ts`'s 10.
 * Comparing them as if they were the same unit would be nonsense.
 */
const SKIP = new Set(["radius"]);

/** `mutedForeground` → `--muted-foreground` */
const cssName = (key: string) =>
  `--${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

/** Pull `--token: value;` pairs out of one CSS block. */
function cssBlock(css: string, selector: string): Map<string, string> {
  // Blocks here are flat (no nested rules), so the first `}` ends them.
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`globals.css: no "${selector}" block`);
  const body = css.slice(start, css.indexOf("}", start));
  const out = new Map<string, string>();
  for (const m of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out.set(m[1] as string, (m[2] as string).trim().toLowerCase());
  }
  return out;
}

/** Pull `key: "value",` pairs out of one exported theme object literal. */
function themeObject(ts: string, name: string): Map<string, string> {
  const start = ts.indexOf(`export const ${name}: SnapCnTheme = {`);
  if (start === -1) throw new Error(`theme.ts: no "${name}"`);
  const body = ts.slice(start, ts.indexOf("\n};", start));
  const out = new Map<string, string>();
  for (const m of body.matchAll(/^\s{2}([a-zA-Z]+):\s*"([^"]+)"/gm)) {
    out.set(m[1] as string, (m[2] as string).toLowerCase());
  }
  return out;
}

function compare(
  label: string,
  theme: Map<string, string>,
  css: Map<string, string>,
): string[] {
  const problems: string[] = [];
  for (const [key, value] of theme) {
    if (SKIP.has(key)) continue;
    const token = cssName(key);
    const want = css.get(token);
    // A token theme.ts carries that globals.css never defines is fine — the
    // component tier needs a value for it either way (--destructive-foreground).
    if (want === undefined) continue;
    if (want !== value) {
      problems.push(
        `  ${label}  ${key.padEnd(21)} theme.ts ${value.padEnd(9)} ≠ ${want.padEnd(9)} ${token}`,
      );
    }
  }
  return problems;
}

const css = readFileSync(path.join(root, "app", "globals.css"), "utf8");
const ts = readFileSync(
  path.join(root, "registry", "snap-cn-ui", "core", "theme.ts"),
  "utf8",
);

const problems = [
  ...compare(
    "light",
    themeObject(ts, "defaultLightTheme"),
    cssBlock(css, ":root"),
  ),
  ...compare(
    "dark ",
    themeObject(ts, "defaultDarkTheme"),
    cssBlock(css, ".dark"),
  ),
];

if (problems.length > 0) {
  console.error(
    `\nDesign tokens have drifted — ${problems.length} mismatch(es).\n` +
      "theme.ts must mirror globals.css; the site and the components it ships\n" +
      "have to be the same design system.\n",
  );
  console.error(problems.join("\n"));
  console.error("");
  process.exit(1);
}

console.log("Design tokens match: theme.ts ≡ app/globals.css");
