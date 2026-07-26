import { type CategoryId, GALLERY_ITEMS } from "@/lib/gallery-data";
import { ComponentCardGrid } from "./component-card-grid";

/**
 * Every component in one category, as the same preview cards the gallery uses.
 *
 * The category index pages used to be hand-written bullet lists of links —
 * a page about video components with no video on it, sitting one click from a
 * gallery full of playing previews. `/docs/social` was the only one that had
 * been converted, by pasting a card array into the MDX, which is the other
 * failure mode: a second copy of every name and description to keep in step with
 * `lib/gallery-data`.
 *
 * So the page says which category it is and nothing else. Add a component to
 * `GALLERY_ITEMS` and it appears on its category index, in the gallery, and in
 * the count in the sidebar, from the one edit.
 */
export function CategoryGrid({ category }: { category: CategoryId }) {
  const items = GALLERY_ITEMS.filter((item) => item.category === category).map(
    (item) => ({
      name: item.name,
      description: item.description,
      // Everything in `GALLERY_ITEMS` has shipped — the gallery is the list of
      // what exists. Unbuilt things live in `ComingSoonPage`, not here.
      status: "stable" as const,
      href: item.href,
    }),
  );

  return <ComponentCardGrid items={items} />;
}
