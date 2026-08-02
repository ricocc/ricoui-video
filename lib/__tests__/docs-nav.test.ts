/**
 * The docs rail is only as good as the list behind it.
 *
 * Run with:  pnpm vitest run lib/__tests__/docs-nav.test.ts
 *
 * `DOCS_NAV` is hand-written (the pages it lists have no other machine-readable
 * order), so it rots the way hand-written link lists always do: an MDX file is
 * renamed and the rail quietly serves a 404.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DOCS_NAV } from "../docs-nav";

const CONTENT = join(process.cwd(), "content/docs");

const links = DOCS_NAV.flatMap((group) => group.links);

describe("DOCS_NAV", () => {
  it("only links to pages that exist", () => {
    for (const link of links) {
      const rel = link.href.replace(/^\/docs\/?/, "");
      const resolved = [
        join(CONTENT, `${rel}.mdx`),
        join(CONTENT, rel, "index.mdx"),
      ].some(existsSync);
      expect(resolved, `${link.href} has no MDX file`).toBe(true);
    }
  });
});
