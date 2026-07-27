import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import {
  ensureBrowser,
  getCompositions,
  renderMedia,
} from "@remotion/renderer";
import { enableTailwind } from "@remotion/tailwind-v4";
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
    webpackOverride: (raw) => {
      // Compile Tailwind into the bundle — without it every class in a
      // component is inert in the render (measured: a red box came out white).
      const config = enableTailwind(raw);
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
    retimeTo60(outputLocation, tag);
  }

  writeManifest(outDir);
}

/**
 * Re-time a finished render to a 60fps container, by duplicating frames.
 *
 * Not cosmetic, and not about the demo: **Chrome paces a whole page's rendering
 * to the frame rate of the video playing on it.** Measured on an otherwise idle
 * page — one video, or none, and rAF runs at the display rate; two or more 30fps
 * videos and the entire page drops to 30fps. The showcase wall plays five or six
 * at once, so 30fps files pin the wall's own motion to 30fps, and a wall sliding
 * at constant velocity is the least forgiving thing there is to run at half rate.
 * Same clips at 60fps: the page holds 60.
 *
 * Frame duplication rather than a 60fps render, because the scenes are authored
 * on frame numbers against their config's fps — rendering them at 60 would play
 * them at half speed. This keeps every rendered frame exactly as authored and
 * only changes the cadence the container declares. Duplicate frames cost almost
 * nothing in H.264 (most of these files come out *smaller*), and it measures at
 * SSIM 0.998–0.9997 against the source.
 *
 * ## …and down to 960 wide, in the same pass
 *
 * Nothing ever paints one of these at 1280. There are three consumers and they
 * are all cards: the showcase wall (`stageWidth * 0.2` — 288 CSS px on a 1440
 * stage) and the two masonry grids in the docs (`columns-2` → `xl:columns-3`, so
 * ~400 CSS px). The widest any of them gets on a 2× display is ~800 device
 * pixels, and 960 clears that with room left over.
 *
 * The 320 pixels above it were costing 4.2MB across the eleven demos and 44% of
 * the decode — which the wall pays at 60fps, five clips at a time, while its
 * canvas resamples every one of them into strips. Scaling here rather than at
 * render time keeps Remotion's output at the composition's real size; this pass
 * was already re-encoding, so it is free.
 *
 * If a demo ever gets shown full-bleed, this is the line that has to move.
 */
function retimeTo60(file: string, tag: string) {
  const tmp = `${file}.60.mp4`;
  const done = spawnSync(
    "ffmpeg",
    [
      "-v",
      "error",
      "-i",
      file,
      "-vf",
      "fps=60,scale=960:-2",
      "-c:v",
      "libx264",
      "-crf",
      "16",
      "-preset",
      "slow",
      "-pix_fmt",
      "yuv420p",
      "-an",
      "-movflags",
      "+faststart",
      "-y",
      tmp,
    ],
    { stdio: "inherit" },
  );

  if (done.status === 0) {
    renameSync(tmp, file);
    process.stdout.write(`\r${tag} done → ${path.relative(root, file)} @60\n`);
    return;
  }

  rmSync(tmp, { force: true });
  process.stdout.write(
    `\r${tag} done → ${path.relative(root, file)} — but STILL 30fps\n` +
      `  ffmpeg is not on PATH, so this file was left as rendered. The site will\n` +
      `  work, and the showcase wall will animate at 30fps instead of 60. Install\n` +
      `  ffmpeg and re-run to fix it; see the note on retimeTo60.\n`,
  );
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
