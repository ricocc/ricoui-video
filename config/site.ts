import snapCnRegistry from "@/registry/snap-cn/registry.json";
import snapCnUiRegistry from "@/registry/snap-cn-ui/registry.json";

// Pastel palette used only inside demo/sample video content (code snippet
// accents). Site chrome sticks to the snapcn design system tokens — neutral
// surfaces with a single blue accent (see app/globals.css).
export const PEACH = "#FFB38E";
export const LAVENDER = "#D4B3FF";
export const MINT = "#A1EEBD";

export const SITE_NAME = "RICOUI Video";
export const SITE_URL = "https://video.ricoui.com";
export const GITHUB_URL = "https://github.com/ricocc/ricoui-video";
export const UPSTREAM_URL = "https://github.com/snapcndev/snapcn";
export const X_URL = "https://x.com/ricocc";

/**
 * The one place the install command is spelled.
 *
 * `@ricoui-video` is not claimed to be in shadcn's official Registry Directory.
 * Consumers add the namespace URL to components.json; both internal registry
 * tiers continue to publish to the same flat `/r/<name>.json` endpoint.
 */
export const installCommand = (name: string) =>
  `npx shadcn@latest add @ricoui-video/${name}`;

/** Canonical example install command shown on the landing page. */
export const INSTALL_COMMAND = installCommand("text-reveal");

export const INSTALL_ALL_NAMES: string[] = [
  ...snapCnRegistry.items,
  ...snapCnUiRegistry.items,
].map((item) => item.name);

export const INSTALL_ALL_COMMAND = `npx shadcn@latest add ${INSTALL_ALL_NAMES.map(
  (name) => `@ricoui-video/${name}`,
).join(" ")}`;

// snapcn design system motion: fast, subtle ease-out tweens — no bounce or
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
      { href: UPSTREAM_URL, label: "SnapCN upstream" },
    ],
  },
];
