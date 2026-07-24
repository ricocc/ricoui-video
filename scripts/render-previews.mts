import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import {
  ensureBrowser,
  getCompositions,
  renderMedia,
} from "@remotion/renderer";
import { tsconfigWebpackAlias } from "./tsconfig-webpack-alias.mts";

/**
 * Render each component in `lib/rendered-demos.tsx` to `public/demos/<slug>.mp4`.
 *
 * These files are what the site plays instead of a live `<Player>` — see the
 * long note in `lib/rendered-demos.tsx` for why, and CONTRIBUTING.md for the
 * workflow. They are committed, because the site serves them statically and a
 * build must not depend on a headless Chrome round-trip.
 *
 * Run:
 *   pnpm run render:previews                 # every slug in RENDERED_DEMOS
 *   pnpm run render:previews --only text-swell
 *
 * Concurrency (tabs per render) is env-tunable: REMOTION_CONCURRENCY (default 4).
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function getFlag(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i !== -1 && i + 1 < process.argv.length) return process.argv[i + 1];
  const eq = process.argv.find((a) => a.startsWith(`--${name}=`));
  return eq ? eq.slice(name.length + 3) : undefined;
}

function remotionConcurrency(): number {
  const parsed = Number(process.env.REMOTION_CONCURRENCY);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 4;
}

async function main() {
  const only = getFlag("only");
  const outDir = path.join(root, "public", "demos");
  mkdirSync(outDir, { recursive: true });

  await ensureBrowser();

  // Webpack doesn't read tsconfig `paths`, and the registry barrel reaches into
  // several specific mappings, not just the `@/*` catch-all — so translate the
  // whole `paths` map to aliases.
  const tsAliases = tsconfigWebpackAlias(root);

  console.log("Bundling previews entry…");
  const serveUrl = await bundle({
    entryPoint: path.join(root, "src", "remotion", "previews-entry.ts"),
    webpackOverride: (config) => {
      // Remotion's default alias is an object; fold it into the ordered array
      // form (first match wins) so our specific entries keep their precedence.
      const existing = Object.entries(config.resolve?.alias ?? {}).map(
        ([name, alias]) => ({
          name: name.replace(/\$$/, ""),
          alias: alias as string,
          onlyModule: name.endsWith("$"),
        }),
      );
      return {
        ...config,
        resolve: { ...config.resolve, alias: [...existing, ...tsAliases] },
      };
    },
  });

  let comps = await getCompositions(serveUrl);
  if (only) comps = comps.filter((c) => c.id === only);

  if (comps.length === 0) {
    console.error(
      only
        ? `No composition matched --only ${only}. Is "${only}" listed in RENDERED_DEMOS?`
        : "No compositions found — is RENDERED_DEMOS empty?",
    );
    process.exit(1);
  }

  const concurrency = remotionConcurrency();
  console.log(
    `Rendering ${comps.length} preview(s) → public/demos (concurrency=${concurrency})`,
  );

  let i = 0;
  for (const composition of comps) {
    i += 1;
    const tag = `[${i}/${comps.length}] ${composition.id}`;
    const outputLocation = path.join(outDir, `${composition.id}.mp4`);

    await renderMedia({
      serveUrl,
      composition,
      codec: "h264",
      // The whole reason these files exist is that they look better than the
      // live player. Encoding them badly would give that away — CRF 18 is
      // visually lossless on flat type, and these are a few seconds long.
      crf: 18,
      // Safari and every mobile browser refuse to decode 4:2:0 progressive H.264
      // without this, and a demo that silently doesn't play is worse than one
      // that stutters.
      pixelFormat: "yuv420p",
      audioCodec: null,
      outputLocation,
      concurrency,
      onProgress: ({ progress }) => {
        process.stdout.write(`\r${tag} ${(progress * 100).toFixed(0)}%   `);
      },
    });
    process.stdout.write(
      `\r${tag} done → public/demos/${composition.id}.mp4\n`,
    );
  }

  writeManifest(outDir);
}

/**
 * Every demo ships to the SAME path forever (`/demos/<slug>.mp4`), so a browser
 * that has one will happily keep replaying it after the file underneath has been
 * re-rendered — and <video> caches hardest of all. That has now cost three rounds
 * of "you didn't fix it" against builds that no longer existed.
 *
 * So the URL carries a hash of the file's own bytes. Change the demo, change the
 * URL. A stale demo is not something a cache can serve any more, because the thing
 * it cached is at a different address.
 *
 * Hashes ALL demos on disk, not just the one `--only` re-rendered, so the manifest
 * never goes half-stale.
 */
function writeManifest(outDir: string) {
  const manifest: Record<string, string> = {};
  for (const file of readdirSync(outDir).sort()) {
    if (!file.endsWith(".mp4")) continue;
    const slug = file.slice(0, -4);
    manifest[slug] = createHash("sha256")
      .update(readFileSync(path.join(outDir, file)))
      .digest("hex")
      .slice(0, 10);
  }
  const target = path.join(root, "lib", "demo-manifest.json");
  writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(
    `Wrote lib/demo-manifest.json (${Object.keys(manifest).length} demos)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
