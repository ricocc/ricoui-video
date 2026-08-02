/**
 * The written docs, as the rail lists them.
 *
 * The rail used to show only the six product sections (Docs, Components,
 * Templates, …), so a reader on `/docs/text` had no route back to Installation.
 * This is that page tree.
 *
 * The seven category indexes are deliberately *not* in here: `Components` above
 * them is the gallery, filterable by the same seven categories, and a second
 * copy of the list down the rail was seven more lines of nav saying what the
 * link above it already said. They are listed on the docs home instead, where a
 * contents list is the point of the page.
 *
 * `lib/__tests__/docs-nav.test.ts` checks every href against the MDX on disk, so
 * this and `content/docs/getting-started/meta.json` cannot drift apart silently.
 */
export type DocsNavLink = { href: string; label: string };
export type DocsNavGroup = { title: string; links: DocsNavLink[] };

export const DOCS_NAV: DocsNavGroup[] = [
  {
    title: "Getting started",
    links: [
      { href: "/docs/getting-started/introduction", label: "Introduction" },
      { href: "/docs/getting-started/installation", label: "Installation" },
      { href: "/docs/getting-started/agent-skill", label: "Agent skill" },
    ],
  },
];
