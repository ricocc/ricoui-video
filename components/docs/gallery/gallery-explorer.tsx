"use client";

import { ChevronDown } from "lucide-react";
import {
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { type ReactNode, useCallback, useEffect, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type CategoryId,
  GALLERY_CATEGORIES,
  GALLERY_ITEMS,
  getFilteredSortedItems,
  ITEM_BY_SLUG,
  type SortMode,
  slugFromHref,
} from "@/lib/gallery-data";
import { cn } from "@/lib/utils";
import { GalleryCard } from "./gallery-card";
import { GalleryDetailOverlay } from "./gallery-detail-overlay";

const CATEGORY_IDS = GALLERY_CATEGORIES.map((c) => c.id);
const SORT_ORDER: SortMode[] = ["curated", "az", "category"];
const SORT_LABELS: Record<SortMode, string> = {
  curated: "Curated",
  az: "A–Z",
  category: "Category",
};

function pillClassName(active: boolean) {
  return cn(
    "shrink-0 cursor-default rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
    active
      ? "bg-foreground text-background"
      : "bg-gallery-card text-foreground/70 hover:text-foreground",
  );
}

/**
 * The gallery's client toolbar + masonry + detail overlay. Category pills
 * genuinely filter the grid and a sort dropdown reorders it (both in the URL via
 * nuqs `?category=`/`?sort=`, `history: "replace"`). Clicking a card opens the
 * in-place detail overlay via `?item=<slug>` (`history: "push"`, so Back closes
 * it); prev/next walk the on-screen list.
 */
export function GalleryExplorer({
  docBodies,
}: {
  /** Server-rendered doc bodies for every component, keyed by slug (see doc-bodies). */
  docBodies?: Record<string, ReactNode>;
}) {
  const [{ category, sort }, setState] = useQueryStates(
    {
      category: parseAsStringLiteral(CATEGORY_IDS),
      sort: parseAsStringLiteral(SORT_ORDER).withDefault("curated"),
    },
    { history: "replace" },
  );

  const [activeSlug, setActiveSlug] = useQueryState(
    "item",
    parseAsString.withOptions({ history: "push", shallow: true }),
  );

  // Legacy deep links used a `#<category>` hash (the old scroll-anchor pills).
  // Convert those into the equivalent filter on mount so shared/bookmarked URLs
  // keep working, then strip the hash.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && (CATEGORY_IDS as string[]).includes(hash)) {
      void setState({ category: hash as CategoryId });
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, [setState]);

  const items = useMemo(
    () => getFilteredSortedItems(category, sort),
    [category, sort],
  );

  const activeItem = activeSlug ? (ITEM_BY_SLUG.get(activeSlug) ?? null) : null;

  // Prev/next wrap around the on-screen list when the open item is in it,
  // else over the full curated list (e.g. a deep link outside the filter).
  const step = useCallback(
    (dir: 1 | -1) => {
      void setActiveSlug((current) => {
        if (!current) return current;
        const inList = items.some((i) => slugFromHref(i.href) === current);
        const list = inList ? items : GALLERY_ITEMS;
        const idx = list.findIndex((i) => slugFromHref(i.href) === current);
        if (idx === -1) return current;
        return slugFromHref(list[(idx + dir + list.length) % list.length].href);
      });
    },
    [items, setActiveSlug],
  );

  return (
    <div className="not-prose">
      {/* No border-b. The bar is sticky and already separates itself when it
          overlaps the grid — the blurred background is the affordance. */}
      <div className="sticky top-0 z-30 -mx-6 bg-background/90 px-6 py-3 backdrop-blur lg:-mx-8 lg:px-8">
        <div className="flex items-center gap-2">
          <div
            className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            <button
              type="button"
              aria-pressed={category === null}
              onClick={() => void setState({ category: null })}
              className={pillClassName(category === null)}
            >
              All
            </button>
            {GALLERY_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={category === c.id}
                onClick={() => void setState({ category: c.id })}
                className={pillClassName(category === c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex shrink-0 cursor-default items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
              {SORT_LABELS[sort]}
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40 rounded-none">
              <DropdownMenuRadioGroup
                value={sort}
                onValueChange={(value) =>
                  void setState({ sort: value as SortMode })
                }
              >
                {SORT_ORDER.map((mode) => (
                  <DropdownMenuRadioItem key={mode} value={mode}>
                    {SORT_LABELS[mode]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Four across from `xl` up. The old ladder only reached four at 100rem,
          so every normal desktop sat at three. `gap-3` is paired with the card's
          own `mb-3` — the margin is what makes the vertical gutter. */}
      <div className="mt-6 columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
        {items.map((item) => (
          <GalleryCard
            key={item.href}
            item={item}
            onOpen={(slug) => void setActiveSlug(slug)}
          />
        ))}
      </div>

      <GalleryDetailOverlay
        item={activeItem}
        docBodies={docBodies}
        onClose={() => void setActiveSlug(null)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
      />
    </div>
  );
}
