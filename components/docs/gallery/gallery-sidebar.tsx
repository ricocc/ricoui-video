"use client";

import { ArrowUpRight, ChevronsLeft } from "lucide-react";
import Link from "next/link";
import { SearchButton } from "@/components/search-button";
import { SnapCnLogo } from "@/components/snapcn-logo";
import { GITHUB_URL } from "@/config/site";
import { GALLERY_COUNT } from "@/lib/gallery-data";
import { cn } from "@/lib/utils";
import { DOCS_SECTIONS, useSectionActive } from "./section-nav";

/**
 * The gallery's fixed left rail (desktop only), shared by every `/docs/*`
 * route. It owns the logo + derived component count at the top (moved out of a
 * separate top bar), the section links, and a promo block pinned to the bottom.
 * Being `fixed` + full-height, it never scrolls with the page and its bottom is
 * never clipped. The « button collapses it (the frame slides it off-screen and
 * reclaims the width); a floating » button in the frame reopens it. The section
 * links (and which one is active) come from {@link DOCS_SECTIONS} so the rail
 * and the mobile nav stay in sync.
 */

export function GallerySidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const year = new Date().getFullYear();
  const isActive = useSectionActive();

  return (
    <aside
      aria-hidden={collapsed}
      className={cn(
        // No border-r: the rail and the grid share one background, and the
        // whitespace between them is the separation. A rule down the full height
        // only chops the page in two.
        "fixed top-0 left-0 z-30 hidden h-screen w-[var(--gallery-sidebar-w-open)] flex-col overflow-y-auto bg-background px-5 py-5 transition-transform duration-300 ease-out lg:flex",
        collapsed && "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <Link href="/" aria-label="snap-cn home" className="shrink-0">
          <SnapCnLogo />
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <span
              className="size-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            {GALLERY_COUNT} components
          </span>
          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="flex size-7 shrink-0 items-center justify-center rounded-4xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronsLeft className="size-4" />
          </button>
        </div>
      </div>

      <SearchButton className="mt-6 text-[13px]" />

      <nav className="mt-8 flex flex-col">
        {DOCS_SECTIONS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              // 13px on a 1.8 leading = a 23.4px pitch, measured off the
              // reference rail (23.5px). The old 15px/leading-loose/py-1 came to
              // 38px, which is why the rail read as oversized.
              className={
                active
                  ? "flex items-center gap-1.5 text-[13px] leading-[1.8] text-foreground"
                  : "flex items-center gap-1.5 text-[13px] leading-[1.8] text-foreground/65 transition-colors hover:text-foreground"
              }
            >
              {item.label}
              {active ? (
                <span
                  className="size-1.5 rounded-full bg-foreground"
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 pt-10">
        <div className="flex size-10 items-center justify-center rounded-full bg-gallery-card">
          <GitHubIcon className="size-5 text-foreground" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-foreground">
            Star snap-cn
          </p>
          <p className="text-[13px] text-muted-foreground">
            Free, open-source components.
          </p>
        </div>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Production-ready Remotion animations, transitions and backgrounds —
          you own the code.
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 self-start rounded-4xl border border-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
        >
          Star on GitHub
          <ArrowUpRight className="size-3.5" />
        </a>
        {/* Full-width hairline with a short near-black head, as on the
            reference rail — the dark segment is what reads as a rule end-stop;
            a bare 1px line at this width just looks like a gap. */}
        <div className="my-1 h-px w-full bg-border">
          <div className="h-px w-[13px] bg-foreground" />
        </div>
        <p className="text-[13px] text-muted-foreground">
          MIT licensed · own your code.
        </p>
        <p className="text-[13px] text-muted-foreground">© {year} snap-cn</p>
      </div>
    </aside>
  );
}

// lucide-react (as pinned in this repo) ships no brand/logo icons, so the
// GitHub glyph is inlined here.
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      role="img"
      aria-label="GitHub"
    >
      <title>GitHub</title>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.96-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.44-2.7 5.41-5.27 5.7.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
