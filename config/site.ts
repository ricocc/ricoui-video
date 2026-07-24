import snapCnRegistry from "@/registry/snap-cn/registry.json";
import snapCnUiRegistry from "@/registry/snap-cn-ui/registry.json";

// Pastel palette used only inside demo/sample video content (code snippet
// accents). Site chrome sticks to the snap-cn design system tokens — neutral
// surfaces with a single blue accent (see app/globals.css).
export const PEACH = "#FFB38E";
export const LAVENDER = "#D4B3FF";
export const MINT = "#A1EEBD";

export const GITHUB_URL = "https://github.com/SriNath693/snap-cn";

/** Canonical example install command shown on the landing page. */
export const INSTALL_COMMAND = "npx shadcn@latest add snap-cn/text-reveal";

export const INSTALL_ALL_NAMES: string[] = [
  ...snapCnRegistry.items,
  ...snapCnUiRegistry.items,
].map((item) => item.name);

export const INSTALL_ALL_COMMAND = `npx shadcn@latest add ${INSTALL_ALL_NAMES.map(
  (name) => `@snap-cn/${name}`,
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
export const NAV_LINKS: NavLink[] = [
  { href: "/docs/text", label: "Components" },
  { href: "/docs/getting-started/introduction", label: "Docs" },
];

export const FOOTER_NAV: NavLink[] = [
  { href: "/docs/getting-started/introduction", label: "Docs" },
  { href: GITHUB_URL, label: "GitHub" },
];
