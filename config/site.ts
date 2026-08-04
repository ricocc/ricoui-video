import snapCnRegistry from "@/registry/snap-cn/registry.json";
import snapCnUiRegistry from "@/registry/snap-cn-ui/registry.json";

// Pastel palette used only inside demo/sample video content (code snippet
// accents). Site chrome sticks to the snap-cn design system tokens — neutral
// surfaces with a single blue accent (see app/globals.css).
export const PEACH = "#FFB38E";
export const LAVENDER = "#D4B3FF";
export const MINT = "#A1EEBD";

export const GITHUB_URL = "https://github.com/snapcndev/snapcn.dev";

/**
 * The one place the install command is spelled, so there is one place to change
 * it back.
 *
 * ## Why a URL and not `@snap-cn/<name>`
 *
 * The short form is a *namespace*, and the CLI resolves a namespace before it
 * ever contacts this site: from the shadcn registry index, or from a
 * `registries` entry the reader has to add to their own `components.json`.
 * snap-cn is not in that index yet (shadcn-ui/ui#11386 is open), so printing the
 * short form means printing a command that fails on a clean project, every time,
 * for everyone. A registry-item URL resolves with no setup at all.
 *
 * **When #11386 merges, change `installCommand` back to the short form.** That
 * is the whole revert; every call site reads it from here.
 */
export const registryUrl = (name: string) =>
  `https://snapcn.dev/r/${name}.json`;

export const installCommand = (name: string) =>
  `npx shadcn@latest add ${registryUrl(name)}`;

/** Canonical example install command shown on the landing page. */
export const INSTALL_COMMAND = installCommand("text-reveal");

export const INSTALL_ALL_NAMES: string[] = [
  ...snapCnRegistry.items,
  ...snapCnUiRegistry.items,
].map((item) => item.name);

export const INSTALL_ALL_COMMAND = `npx shadcn@latest add ${INSTALL_ALL_NAMES.map(
  registryUrl,
).join(" ")}`;

// snap-cn design system motion: fast, subtle ease-out tweens — no bounce or
// overshoot anywhere in the site chrome.
export const EASE_OUT = {
  type: "tween" as const,
  duration: 0.2,
  ease: "easeOut" as const,
};
export const EASE_OUT_SOFT = {
  type: "tween" as const,
  duration: 0.15,
  ease: "easeOut" as const,
};

export type NavLink = {
  href: string;
  label: string;
  /** Hidden on mobile (matches the existing `hidden sm:inline` pattern). */
  smOnly?: boolean;
};

// Single source of truth for the landing page's top navigation.
//
// "Components" points at the gallery, not at `/docs/text`. It used to open the
// Text & Titles category index, so the header's Components link answered with
// one of seven categories and no sign of the rest.
export const NAV_LINKS: NavLink[] = [
  { href: "/docs/components", label: "Components" },
  { href: "/docs", label: "Docs" },
];

/**
 * The footer, by column. Single source of truth, like `NAV_LINKS`.
 *
 * Every href here is a route that exists — the component sections come from the
 * per-section `meta.json` files under `content/docs`, the gallery ones from
 * `app/docs/(gallery)`. A footer is the easiest place in a site to accumulate
 * links to pages nobody ever built, so nothing unshipped goes in this list.
 */
export type FooterColumn = { title: string; links: NavLink[] };

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Components",
    links: [
      { href: "/docs/text", label: "Text & Titles" },
      { href: "/docs/captions", label: "Captions" },
      { href: "/docs/logos", label: "Logos" },
      { href: "/docs/screens", label: "Screens & Devices" },
      { href: "/docs/social", label: "Social Proof" },
      { href: "/docs/scenes", label: "Scenes" },
      { href: "/docs/ai-input", label: "AI Chat Input" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { href: "/docs/getting-started/introduction", label: "Introduction" },
      { href: "/docs/getting-started/installation", label: "Installation" },
      { href: "/docs/getting-started/agent-skill", label: "Agent skill" },
    ],
  },
  {
    title: "Browse",
    links: [
      // No Video editor: it is a coming-soon page now, and this column's rule
      // (above) is that nothing unshipped goes in it. The rail still lists it —
      // a rail is a roadmap, a footer is an index.
      { href: "/docs", label: "Documentation" },
      { href: "/docs/components", label: "All components" },
      { href: "/docs/showcase", label: "Showcase" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: GITHUB_URL, label: "GitHub" },
      { href: `${GITHUB_URL}/blob/main/LICENSE`, label: "MIT license" },
      { href: `${GITHUB_URL}/issues`, label: "Issues" },
      { href: "https://x.com/SriNath693", label: "X" },
    ],
  },
];
