import { DocsTopBar } from "./docs-top-bar";

/**
 * The gallery's title/tagline row plus the "updated" meta, in the shared
 * {@link DocsTopBar} so the theme toggle and the small-screen section links sit
 * exactly where they do on every other `/docs` route. It scrolls away — the
 * filter pills below it stick to the top on scroll.
 *
 * `flex-1` on the title block, not `ml-auto` on the meta: two auto margins in
 * one row would split the free space between them and strand the meta mid-row.
 */
export function GalleryHeaderRow({ meta }: { meta: string }) {
  return (
    <div className="pb-2">
      <DocsTopBar>
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <h1 className="shrink-0 text-[15px] font-semibold text-foreground">
            Components
          </h1>
          <span className="truncate text-[15px] text-muted-foreground">
            Every RICOUI Video component, ready to install.
          </span>
        </div>
        <span className="hidden shrink-0 text-sm text-muted-foreground md:block">
          {meta}
        </span>
      </DocsTopBar>
    </div>
  );
}
