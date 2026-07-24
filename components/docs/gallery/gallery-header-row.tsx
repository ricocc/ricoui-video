import { ThemeToggle } from "@/app/(home)/components/theme-toggle";
import { DocsSectionNav } from "./section-nav";

/**
 * The gallery's title/tagline row plus the "updated" meta and theme toggle.
 * It sits at the top of the content column and scrolls away — the filter pills
 * below it stick to the top on scroll. On small screens (sidebar hidden) the
 * shared section links appear here instead (see {@link DocsSectionNav}).
 */
export function GalleryHeaderRow({ meta }: { meta: string }) {
  return (
    <div className="pt-6 pb-2">
      <DocsSectionNav className="mb-4" />

      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-baseline gap-2">
          <h1 className="shrink-0 text-[15px] font-semibold text-foreground">
            Components
          </h1>
          <span className="truncate text-[15px] text-muted-foreground">
            Every component in snap-cn, ready to install.
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="hidden text-sm text-muted-foreground md:block">
            {meta}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
