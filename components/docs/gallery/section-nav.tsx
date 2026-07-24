"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The single source of truth for the sidebar's product nav — the top-level
 * categories shared by every `/docs/*` route. Both the gallery sidebar (desktop
 * rail) and {@link DocsSectionNav} (the mobile row) read this list so the two
 * never drift. `match` is the path prefix that marks a link active.
 *
 * Only `Components` (`/docs/components`) has a page today; the rest are product
 * categories that are intentionally linked ahead of their pages existing, so
 * they will 404 until built. Add a route (or a placeholder page) at each `href`
 * to light one up.
 */
export const DOCS_SECTIONS = [
  { label: "Components", href: "/docs/components", match: "/docs/components" },
  { label: "Templates", href: "/docs/templates", match: "/docs/templates" },
  {
    label: "Video Editor",
    href: "/docs/video-editor",
    match: "/docs/video-editor",
  },
  { label: "Showcase", href: "/docs/showcase", match: "/docs/showcase" },
  {
    label: "Marketplace",
    href: "/docs/marketplace",
    match: "/docs/marketplace",
  },
] as const;

/**
 * Returns a predicate that reports whether a section (by its `match` prefix) is
 * the active one for the current pathname. Exact match or a child path both
 * count, so `/docs/ui/components/button` lights up the "UI" link.
 */
export function useSectionActive() {
  const pathname = usePathname();
  return (match: string) =>
    pathname === match || pathname.startsWith(`${match}/`);
}

/**
 * The mobile section nav: a horizontal row of the same links the sidebar shows,
 * rendered only below `lg` (where the fixed sidebar is hidden). Used at the top
 * of both the Components gallery and the prose docs so no `/docs/*` route is
 * left without navigation on small screens.
 */
export function DocsSectionNav({ className }: { className?: string }) {
  const isActive = useSectionActive();

  return (
    <nav className={cn("flex flex-wrap gap-x-5 gap-y-1 lg:hidden", className)}>
      {DOCS_SECTIONS.map((item) => {
        const active = isActive(item.match);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 text-sm transition-colors",
              active
                ? "font-medium text-foreground"
                : "text-foreground/70 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
