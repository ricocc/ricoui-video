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
          className="fixed top-5 left-4 z-40 hidden size-8 items-center justify-center bg-background text-muted-foreground transition-colors hover:text-foreground lg:flex"
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
