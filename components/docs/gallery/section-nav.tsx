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
 * Every href here resolves. `Templates` and `Marketplace` are not built yet, so
 * they render `ComingSoonPage` inside the same chrome rather than 404'ing — a
 * linked dead end reads as a broken site, not as a roadmap. Replace those routes
 * with the real pages when they ship; nothing here needs to change.
 */
export const DOCS_SECTIONS = [
  // The written documentation — Getting Started, and every component category
  // index (`/docs/text`, `/docs/captions`, …). Those pages had no entry here at
  // all, so a reader who landed on one had no route back to Installation and
  // nothing in the rail was lit.
  //
  // `fallback` rather than a list of eight prefixes: Docs owns any `/docs` route
  // no other section claims, so adding a component category lights it up without
  // anyone remembering to come back here.
  {
    label: "Docs",
    href: "/docs/getting-started/introduction",
    match: "/docs",
    fallback: true,
  },
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

export type DocsSection = (typeof DOCS_SECTIONS)[number];

/**
 * Returns a predicate that reports whether a section is the active one for the
 * current pathname. Exact match or a child path both count, so
 * `/docs/ui/components/button` lights up the "UI" link.
 *
 * A `fallback` section only wins when nothing else does — otherwise Docs, whose
 * prefix is the bare `/docs`, would be active on every route in the group.
 */
export function useSectionActive() {
  const pathname = usePathname();
  const hits = (match: string) =>
    pathname === match || pathname.startsWith(`${match}/`);

  return (section: DocsSection) => {
    if (!("fallback" in section && section.fallback))
      return hits(section.match);
    return (
      hits(section.match) &&
      !DOCS_SECTIONS.some(
        (other) =>
          !("fallback" in other && other.fallback) && hits(other.match),
      )
    );
  };
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
        const active = isActive(item);
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
