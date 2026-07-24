import { DocsBody } from "fumadocs-ui/page";
import type { ReactNode } from "react";
import { GALLERY_ITEMS, slugFromHref } from "@/lib/gallery-data";
import { getMDXComponents } from "@/mdx-components";
import { source } from "@/source";

// The overlay renders the live preview itself (top of the right column), so the
// in-body hero preview widgets are suppressed — otherwise every doc would mount
// a second, redundant Remotion player. These three are the only preview widgets
// the docs use; there are no inline <ComponentExample> demos to preserve.
const NULL_PREVIEW = () => null;
const OVERLAY_MDX = getMDXComponents({
  ComponentPreview: NULL_PREVIEW,
  UiComponentPreview: NULL_PREVIEW,
  BlockPreview: NULL_PREVIEW,
});

/**
 * Server-rendered documentation bodies for *every* gallery component, keyed by
 * slug. The gallery detail overlay renders these inline so no component needs a
 * standalone docs page: the MDX under `content/docs/**` stays the single source
 * of truth, now surfaced in the overlay instead of on its own route.
 *
 * One mechanism covers all components — no per-component authoring — because
 * each doc is just its MDX body rendered through the shared component map.
 */
export function getDocBodies(): Record<string, ReactNode> {
  const bodies: Record<string, ReactNode> = {};
  for (const item of GALLERY_ITEMS) {
    const slug = slugFromHref(item.href);
    const pageSlugs = item.href.replace(/^\/docs\//, "").split("/");
    const page = source.getPage(pageSlugs);
    if (!page) continue;
    // biome-ignore lint/suspicious/noExplicitAny: fumadocs page.data.body is loosely typed, matching app/docs/(docs)/[[...slug]]/page.tsx
    const MDX = (page.data as any).body;
    bodies[slug] = (
      <DocsBody>
        <MDX components={OVERLAY_MDX} />
      </DocsBody>
    );
  }
  return bodies;
}
