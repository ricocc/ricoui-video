import Link from "next/link";
import { DOCS_NAV } from "@/lib/docs-nav";
import { GALLERY_CATEGORIES } from "@/lib/gallery-data";

/**
 * The contents of the docs: the written pages the rail lists, plus the category
 * indexes, which the rail deliberately leaves out (see {@link DOCS_NAV}) but a
 * landing page has to name — this is the only place they are all written down.
 *
 * Derived from `GALLERY_CATEGORIES`, so a new category appears in the gallery,
 * on its own index page, and here from the one edit.
 */
const GROUPS = [
  ...DOCS_NAV,
  {
    title: "Categories",
    links: GALLERY_CATEGORIES.map((category) => ({
      href: `/docs/${category.id}`,
      label: category.label,
    })),
  },
];

export function DocsIndex() {
  return (
    <div className="not-prose my-8 grid gap-8 sm:grid-cols-2">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {group.title}
          </p>
          <div className="mt-2 flex flex-col">
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-1 text-[15px] text-foreground/75 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
