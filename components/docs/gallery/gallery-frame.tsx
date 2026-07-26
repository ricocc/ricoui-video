"use client";

import { ChevronsRight } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { GallerySidebar } from "./gallery-sidebar";

/**
 * Client layout frame for the gallery: a fixed, full-height sidebar beside a
 * scrollable content column. The « button collapses the sidebar (slides it
 * off-screen and reclaims its width so the grid reflows); a floating » button
 * reopens it. The sidebar width lives in the `--gallery-sidebar-w` CSS variable
 * so the content padding AND the detail overlay's left offset both follow one
 * value — the overlay always sits beside the sidebar, never over it.
 */
export function GalleryFrame({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--gallery-sidebar-w",
      // Zero, so a closed sidebar leaves the content column with the same 32px
      // (`lg:px-8`) down both edges. Reserving a rail here instead put 80px on
      // the left against 32px on the right, which reads as the page having
      // slipped sideways.
      collapsed ? "0px" : "300px",
    );
  }, [collapsed]);

  return (
    <>
      <GallerySidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Open sidebar"
          // Sized and placed to sit *inside* the content column's own 32px
          // gutter — 4px inset, 24px wide, 4px to spare — so it never reaches
          // the text. It used to be `left-4 size-8`, which spans 16–48px and put
          // it 16px over content that starts at 32px: the first glyph of every
          // heading rendered behind it ("Components" read as "omponents").
          //
          // Keep `4 + width + 4 = 32` if either number changes, or it either
          // collides again or stops looking centred in the gutter.
          className="fixed top-5 left-1 z-40 hidden size-6 items-center justify-center bg-background text-muted-foreground transition-colors hover:text-foreground lg:flex"
        >
          <ChevronsRight className="size-4" />
        </button>
      ) : null}

      <div className="min-h-screen transition-[padding] duration-300 ease-out lg:pl-[var(--gallery-sidebar-w)]">
        <div className="px-6 lg:px-8">{children}</div>
      </div>
    </>
  );
}
