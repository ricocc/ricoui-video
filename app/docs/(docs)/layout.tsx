import type { ReactNode } from "react";
import { ThemeToggle } from "@/app/(home)/components/theme-toggle";
import { GalleryFrame } from "@/components/docs/gallery/gallery-frame";
import { DocsSectionNav } from "@/components/docs/gallery/section-nav";

/**
 * Every prose docs route (Getting Started, UI, …) renders inside the exact same
 * bespoke chrome as the Components page: the fixed, collapsible gallery rail
 * (logo + section nav + GitHub promo) on the left with the content in the right
 * column — no fumadocs top header, no per-page TOC. The sibling `(gallery)`
 * group renders the masonry Components page inside this same `GalleryFrame`, so
 * navigating between Getting Started, Components, and UI keeps one unchanging
 * layout.
 *
 * The top row mirrors the Components page's header: the theme toggle sits at the
 * right edge of the content column on every route (so it never appears and
 * disappears between pages), and `DocsSectionNav` — the small-screen
 * counterpart to the desktop-only rail — puts the section links on its left on
 * mobile so these pages are never left without navigation.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <GalleryFrame>
      <div className="flex items-center justify-between gap-4 pt-6">
        <DocsSectionNav />
        <ThemeToggle />
      </div>
      {children}
    </GalleryFrame>
  );
}
