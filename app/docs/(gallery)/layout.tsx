import type { ReactNode } from "react";

/**
 * Pass-through layout for the components gallery. The Components page renders
 * its own `GalleryFrame` (rail + content column) directly under the root
 * layout, which already provides fonts, theming, and the nuqs adapter. The
 * sibling `(docs)` group wraps its prose pages in the same `GalleryFrame`, so
 * both route groups share one chrome — this group just needs a layout that adds
 * nothing extra.
 */
export default function GalleryLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
