import {
  Captions,
  ChartColumn,
  Clapperboard,
  Hexagon,
  type LucideIcon,
  Monitor,
  Sparkles,
  Type,
  Users,
} from "lucide-react";

/**
 * Single source of truth for the components gallery (`/docs/components`).
 *
 * This module replaces the hand-authored card literals that used to live in
 * `content/docs/components.mdx`. The gallery route, the top-bar count, the
 * filter pills, and the llms.txt components index all derive from here — so the
 * "104 components" figure is computed (`GALLERY_ITEMS.length`), never a
 * hardcoded number that can silently drift from reality.
 */

export type CategoryId =
  | "text"
  | "captions"
  | "logos"
  | "screens"
  | "data"
  | "social"
  | "scenes"
  | "ai-input";

export interface GalleryCategory {
  id: CategoryId;
  label: string;
}

/** Order == "Curated" order; mirrors the old CategoryPillNav literal. */
export const GALLERY_CATEGORIES: GalleryCategory[] = [
  { id: "text", label: "Text & Titles" },
  { id: "captions", label: "Captions" },
  { id: "logos", label: "Logos" },
  { id: "screens", label: "Screens & Devices" },
  { id: "data", label: "Data & Stats" },
  { id: "social", label: "Social Proof" },
  { id: "scenes", label: "Scenes" },
  { id: "ai-input", label: "AI Chat Input" },
];

/** Icon shown in each card's bottom-left "category coin" overlay. */
export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  text: Type,
  captions: Captions,
  logos: Hexagon,
  screens: Monitor,
  data: ChartColumn,
  social: Users,
  scenes: Clapperboard,
  "ai-input": Sparkles,
};

/**
 * Card tile shapes. Nearly every source composition is 1280×720 (16:9), so the
 * reference gallery's varied-height masonry rhythm is manufactured: each card
 * is assigned a deterministic tile shape, and its 16:9 preview is centered
 * (never cropped) on the card's flat gray mat.
 */
export type TileShape = "video" | "square" | "portrait" | "tall" | "wide";

export const TILE_RATIOS: Record<TileShape, string> = {
  video: "16 / 9",
  square: "1 / 1",
  portrait: "4 / 5",
  tall: "3 / 4",
  wide: "2 / 1",
};

export interface GalleryItem {
  name: string;
  description: string;
  category: CategoryId;
  href: string;
  /** Explicit override; otherwise a stable shape is derived by master index. */
  tile?: TileShape;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    name: "Text Reveal",
    description:
      "A cinematic zoom-out title reveal — the lead word appears large, then scales down and slides into place as the sentence sweeps in and settles",
    category: "text",
    href: "/docs/text/text-reveal",
  },
  {
    name: "Text Swell",
    description:
      "The lead word floats toward you and hangs there while the sentence assembles around it, letters bouncing up off the baseline — then the whole line falls back",
    category: "text",
    href: "/docs/text/text-swell",
  },
  {
    name: "Text Highlight",
    description:
      "Animated emphasis on one span inside a static sentence — marker, color, underline, strikethrough, or shimmer",
    category: "text",
    href: "/docs/text/text-highlight",
  },
  {
    name: "Text Swap",
    description:
      "Replace one line of text with another using exit-then-enter scheduling and five transition presets",
    category: "text",
    href: "/docs/text/text-swap",
  },
  {
    name: "Text Build",
    description:
      "Words enter one at a time while the already-placed words reflow to stay centered — as a line or a stack",
    category: "text",
    href: "/docs/text/text-build",
  },
  {
    name: "Word Flip",
    description:
      "A headline types itself out, then one word cycles on a 3D flip — anticipation dip, motion-blurred throw, zero reflow",
    category: "text",
    href: "/docs/text/word-flip",
  },
  {
    name: "Word Captions",
    description:
      "Burned-in captions in the styles big channels use — the YouTube box by default (white Roboto on a per-line black box), plus outlined and accent presets",
    category: "captions",
    href: "/docs/captions/word-captions",
    tile: "tall",
  },
  {
    name: "Karaoke Captions",
    description:
      "A caption line over any footage — the YouTube per-line black box by default, with karaoke fill, highlight-bar, and pill presets",
    category: "captions",
    href: "/docs/captions/karaoke-captions",
  },
  {
    name: "Logo Assemble",
    description:
      "A ring of image cards revolves and drains to the centre, giving birth to a simple logo that slides left as the brand name reveals to its right",
    category: "logos",
    href: "/docs/logos/logo-assemble",
    tile: "wide",
  },
  {
    name: "Logo Flicker",
    description:
      "Images flip across the screen very fast, the flicker decelerates and fades, and the logo and brand name resolve underneath",
    category: "logos",
    href: "/docs/logos/logo-flicker",
    tile: "wide",
  },
  {
    name: "Phone Frame",
    description:
      "iPhone-style device frame with a dynamic island — sways in 3D showing off a glowing ride-summary map that draws itself",
    category: "screens",
    href: "/docs/screens/phone-frame",
    tile: "tall",
  },
  {
    name: "Laptop Frame",
    description:
      "MacBook that opens, runs a notch notification, then dives into the screen until an image or video fills the frame",
    category: "screens",
    href: "/docs/screens/laptop-frame",
    tile: "wide",
  },
  {
    name: "Terminal Simulator",
    description:
      "Terminal window with chunked command playback, freeze-frame pauses, step scrolling, and an optional cursor-pinned zoom",
    category: "screens",
    href: "/docs/screens/terminal-simulator",
  },
  {
    name: "Claude Chat",
    description:
      "Animated Claude screen that types a prompt, sends it, and streams the reply behind a pulsing border",
    category: "screens",
    href: "/docs/screens/claude-chat",
  },
  {
    name: "v0",
    description:
      "Simulated v0 composer screen that types a prompt — the opening beat of an AI-builder demo",
    category: "screens",
    href: "/docs/screens/v0",
  },
  {
    name: "Counter",
    description:
      "One animated number with three looks — rolling places, a hold-then-spring odometer, and a per-character slot swap",
    category: "data",
    href: "/docs/data/counter",
  },
  {
    name: "Stat Tile",
    description:
      "The big-stat proof beat — cards with count-up numbers, muted labels, and delta chips, staggered across a row",
    category: "data",
    href: "/docs/data/stat-tile",
  },
  {
    name: "Animated Line Chart",
    description:
      "KPI line chart that draws itself with a spring-eased reveal and a live counting value",
    category: "data",
    href: "/docs/data/animated-line-chart",
  },
  {
    name: "Animated Bar Chart",
    description:
      "Ops-style metric chart — staggered spring bars over hairline gridlines",
    category: "data",
    href: "/docs/data/animated-bar-chart",
  },
  {
    name: "Progress Ring",
    description:
      "Animated percentage ring or bar with a rolling count-up readout",
    category: "data",
    href: "/docs/data/progress-ring",
  },
  {
    name: "Comparison Table",
    description:
      "Animated us-vs-them feature table — rows stagger in, checks draw in accent blue, crosses fade to muted",
    category: "data",
    href: "/docs/data/comparison-table",
  },
  {
    name: "Data Flow Pipes",
    description:
      "Animated integration diagram — packets pulse along hairline pipes between product nodes",
    category: "data",
    href: "/docs/data/data-flow-pipes",
  },
  {
    name: "Follower Rush",
    description:
      "An X-style follower notification that piles up — avatars stack in and the count explodes, then the row bends into an undulating wave of faces",
    category: "social",
    href: "/docs/social/follower-rush",
  },
  {
    name: "Product Hero",
    description:
      "Cinematic product-launch hero — two cards slide into formation as the headline reveals above",
    category: "scenes",
    href: "/docs/scenes/hero-launch",
  },
  {
    name: "Pricing Card",
    description:
      "Animated pricing tiers — prices count in on a tabular reel while features check off with a stagger",
    category: "scenes",
    href: "/docs/scenes/pricing-card",
  },
  {
    name: "Orbit Gallery",
    description:
      "A ring of feature cards orbits a central product mark, each rotating upright as it swings to the front",
    category: "scenes",
    href: "/docs/scenes/orbit-gallery",
  },
  {
    name: "Moodboard Reveal",
    description:
      "A kinetic headline with a swapping inline image, then a scattered photo gallery flies in and the camera pushes through it — dark to light — onto a hero image",
    category: "scenes",
    href: "/docs/scenes/moodboard-reveal",
    tile: "wide",
  },
  {
    name: "Search Typing",
    description:
      "A search field wider than the shot — it comes forward, types across its left half, then pages to its right half",
    category: "ai-input",
    href: "/docs/ai-input/search-typing",
  },
];

export const GALLERY_COUNT = GALLERY_ITEMS.length;

/**
 * Deterministic tile shape per card, stable regardless of the active filter or
 * sort. Explicit `item.tile` wins; otherwise a card's shape is derived from its
 * position in the master list. Cycle length 13 (coprime with the 1–4 column
 * counts) so no column ever fills with one repeated shape.
 */
const TILE_CYCLE: TileShape[] = [
  "portrait",
  "video",
  "tall",
  "square",
  "video",
  "wide",
  "portrait",
  "tall",
  "video",
  "square",
  "portrait",
  "video",
  "tall",
];

const TILE_BY_HREF = new Map<string, TileShape>(
  GALLERY_ITEMS.map((item, index) => [
    item.href,
    item.tile ?? TILE_CYCLE[index % TILE_CYCLE.length],
  ]),
);

export function resolveTile(item: GalleryItem): TileShape {
  return TILE_BY_HREF.get(item.href) ?? "video";
}

/** The last non-empty path segment of an item href, e.g. "text-reveal". */
export function slugFromHref(href: string): string {
  return href.split("/").filter(Boolean).pop() ?? "";
}

export type SortMode = "curated" | "az" | "category";

const CATEGORY_RANK = new Map(GALLERY_CATEGORIES.map((c, i) => [c.id, i]));

/**
 * The single source of truth for the on-screen ordered list — shared by the
 * grid (which cards to render) and the detail overlay (what prev/next walks),
 * so the two never disagree. A stable JS sort keeps curated order within groups.
 */
export function getFilteredSortedItems(
  category: CategoryId | null,
  sort: SortMode,
): GalleryItem[] {
  const filtered = category
    ? GALLERY_ITEMS.filter((item) => item.category === category)
    : GALLERY_ITEMS;

  if (sort === "az") {
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sort === "category") {
    return [...filtered].sort(
      (a, b) =>
        (CATEGORY_RANK.get(a.category) ?? 0) -
        (CATEGORY_RANK.get(b.category) ?? 0),
    );
  }
  return filtered;
}

/** slug → item, so a deep-linked ?item= opens even when filtered out. */
export const ITEM_BY_SLUG = new Map<string, GalleryItem>(
  GALLERY_ITEMS.map((item) => [slugFromHref(item.href), item]),
);

/**
 * Every component's canonical docs path. Components no longer have standalone
 * pages — their docs render inline in the `/docs/components` overlay — so these
 * paths redirect there (see the docs catch-all route) and are kept out of the
 * sitemap.
 */
export const GALLERY_HREFS = new Set<string>(
  GALLERY_ITEMS.map((item) => item.href),
);
