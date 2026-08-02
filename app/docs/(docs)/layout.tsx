import type { ReactNode } from "react";
import { DocsTopBar } from "@/components/docs/gallery/docs-top-bar";
import { GalleryFrame } from "@/components/docs/gallery/gallery-frame";

/**
 * Every prose docs route (Getting Started, UI, …) renders inside the exact same
 * bespoke chrome as the Components page: the fixed, collapsible gallery rail
 * (logo + section nav + GitHub promo) on the left with the content in the right
 * column — no fumadocs top header, no per-page TOC. The sibling `(gallery)`
 * group renders the masonry Components page inside this same `GalleryFrame`, so
 * navigating between Getting Started, Components, and UI keeps one unchanging
 * layout.
 *
 * The top row is the shared `DocsTopBar` — the same component the Components
 * page uses, so the theme toggle is at one point of the content column on every
 * route and the small-screen section links sit above it everywhere.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <GalleryFrame>
      <DocsTopBar />
      {children}
    </GalleryFrame>
  );
}
