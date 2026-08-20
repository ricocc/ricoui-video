import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards the three ways the registry can drift out of sync with itself.
 *
 * All three had actually happened by the time this was written, and none of them
 * broke a build, a type, or an existing test — which is precisely why they need
 * a test of their own:
 *
 *  1. **Orphans.** `shadcn build` writes `public/r/*.json` but never deletes, so
 *     trimming the registry in ee250e3 left 68 built components whose source was
 *     gone. They still installed — the JSON carries inline file content — which
 *     meant `shadcn add` shipped unmaintained code into a user's project, and
 *     every fetch of one landed in the install count as a real conversion.
 *
 *  2. **Unbuilt components.** `hero-launch` had source and a docs page but no
 *     manifest entry, so `/r/hero-launch.json` 404'd. The docs page rendered an
 *     install command that could not work.
 *
 *  3. **Documented but uninstallable.** The general form of (2): any component
 *     with a docs page that a reader cannot actually install.
 *
 * The registry is generated output committed to the repo, so nothing else in the
 * toolchain compares the three lists. This does.
 */

const ROOT = process.cwd();

const readManifest = (p: string): string[] =>
  (
    JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8")) as {
      items: { name: string }[];
    }
  ).items.map((i) => i.name);

/** The three component tiers. Originals under registry/ricoui get the same
 * built/orphan/documented guarantees as upstream-derived components. */
const TIERS = ["registry/snap-cn", "registry/snap-cn-ui", "registry/ricoui"];

const liveComponents = new Set(
  TIERS.flatMap((dir) => readManifest(path.join(dir, "registry.json"))),
);

const builtComponents = new Set(
  fs
    .readdirSync(path.join(ROOT, "public/r"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -".json".length))
    // The whole-registry manifest the CLI resolves before any component; it has
    // no manifest entry of its own by design.
    .filter((n) => n !== "registry"),
);

describe("registry integrity", () => {
  it("builds every component in the manifests", () => {
    const unbuilt = [...liveComponents].filter((n) => !builtComponents.has(n));
    expect(
      unbuilt,
      "in a manifest but missing from public/r — will 404",
    ).toEqual([]);
  });

  it("has no built component missing from the manifests", () => {
    const orphans = [...builtComponents].filter((n) => !liveComponents.has(n));
    expect(
      orphans,
      "in public/r with no manifest entry — installs unmaintained source and inflates the install count",
    ).toEqual([]);
  });

  it("can install everything it documents", () => {
    const docsDir = path.join(ROOT, "content/docs");
    const documented = fs
      .readdirSync(docsDir, { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
      .map((e) => e.name.slice(0, -".mdx".length))
      // Only pages that name a real component directory — the rest are guides.
      .filter((name) =>
        TIERS.some((dir) => fs.existsSync(path.join(ROOT, dir, name))),
      );

    const uninstallable = documented.filter((n) => !liveComponents.has(n));
    expect(
      uninstallable,
      "has a docs page but no manifest entry — its install command cannot work",
    ).toEqual([]);
  });
});
