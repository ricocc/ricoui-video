"use client";

import { ChevronDown } from "lucide-react";
import {
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
  useQueryStates,
} from "nuqs";
import { type ReactNode, useCallback, useEffect, useMemo } from "react";
import { useI18n } from "@/components/locale-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTrackEvent } from "@/lib/analytics";
import {
  type CategoryId,
  GALLERY_CATEGORIES,
  GALLERY_ITEMS,
  getFilteredSortedItems,
  ITEM_BY_SLUG,
  type SortMode,
  slugFromHref,
} from "@/lib/gallery-data";
import { localizeGalleryItem, zhCategoryLabels } from "@/lib/i18n/gallery";
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
  const { locale } = useI18n();
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

  const trackEvent = useTrackEvent();
  // Which shelf people shop. A category nobody ever filters to is either badly
  // named or badly stocked, and this is the only way to tell which.
  const setFilter = useCallback(
    (next: { category?: CategoryId | null; sort?: SortMode }) => {
      void setState(next);
      trackEvent("gallery_filtered", {
        category: next.category !== undefined ? next.category : category,
        sort: next.sort ?? sort,
      });
    },
    [setState, trackEvent, category, sort],
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
  const localizedItems = useMemo(
    () => items.map((item) => localizeGalleryItem(item, locale)),
    [items, locale],
  );
  const localizedActiveItem = activeItem
    ? localizeGalleryItem(activeItem, locale)
    : null;

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
              onClick={() => setFilter({ category: null })}
              className={pillClassName(category === null)}
            >
              {locale === "zh-CN" ? "全部" : "All"}
            </button>
            {GALLERY_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={category === c.id}
                onClick={() => setFilter({ category: c.id })}
                className={pillClassName(category === c.id)}
              >
                {locale === "zh-CN" ? zhCategoryLabels[c.id] : c.label}
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex shrink-0 cursor-default items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted">
              {locale === "zh-CN" && sort === "curated"
                ? "精选排序"
                : locale === "zh-CN" && sort === "category"
                  ? "按分类"
                  : SORT_LABELS[sort]}
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40 rounded-none">
              <DropdownMenuRadioGroup
                value={sort}
                onValueChange={(value) =>
                  setFilter({ sort: value as SortMode })
                }
              >
                {SORT_ORDER.map((mode) => (
                  <DropdownMenuRadioItem key={mode} value={mode}>
                    {locale === "zh-CN" && mode === "curated"
                      ? "精选排序"
                      : locale === "zh-CN" && mode === "category"
                        ? "按分类"
                        : SORT_LABELS[mode]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* A grid, not `columns-*`. Every card is 16:9 (every config is 1280x720),
          so there was never anything for a masonry to stagger — and CSS multicol
          fills greedily: it picks the shortest height that holds the set, then
          packs each column to it. 21 cards across four columns is 6/6/6/3, which
          left the fourth column empty for half the page and the right quarter of
          the screen dead. A grid lays the same cards out row-major, so the only
          hole is the tail of the last row. `items-start` keeps a card at its own
          aspect ratio instead of being stretched to its row. */}
      <div className="mt-6 grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {localizedItems.map((item) => (
          <GalleryCard
            key={item.href}
            item={item}
            onOpen={(slug) => void setActiveSlug(slug)}
          />
        ))}
      </div>

      <GalleryDetailOverlay
        item={localizedActiveItem}
        docBodies={docBodies}
        onClose={() => void setActiveSlug(null)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
      />
    </div>
  );
}
