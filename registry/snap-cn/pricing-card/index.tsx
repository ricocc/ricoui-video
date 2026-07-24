"use client";

import { Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Counter } from "@/registry/snap-cn/counter";

/** Check polyline in a 20×20 viewBox, and the geometry to dash-draw it. */
const CHECK_POINTS: ReadonlyArray<readonly [number, number]> = [
  [5.4, 10.6],
  [8.8, 14],
  [14.8, 6.8],
];

/** SVG path string for the check polyline. */
const CHECK_PATH = `M${CHECK_POINTS.map((p) => p.join(" ")).join("L")}`;

/** Stroke length of the check, for `strokeDasharray` / `strokeDashoffset`. */
const CHECK_PATH_LENGTH = CHECK_POINTS.reduce(
  (total, point, i) =>
    i === 0
      ? 0
      : total +
        Math.hypot(point[0] - CHECK_POINTS[i - 1][0], point[1] - CHECK_POINTS[i - 1][1]),
  0,
);

/** Frames a row is on screen before its check starts drawing. */
const CHECK_DELAY = 3;

/**
 * 0..1 progress of the check stroke draw for a row that entered at `rowStart`.
 * Starts `CHECK_DELAY` frames in, completes over `drawFrames`.
 */
function checkDrawProgress(
  frame: number,
  rowStart: number,
  drawFrames = 10,
): number {
  if (drawFrames <= 0) return frame >= rowStart + CHECK_DELAY ? 1 : 0;
  return interpolate(
    frame,
    [rowStart + CHECK_DELAY, rowStart + CHECK_DELAY + drawFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

export type PricingCardLayout = "single" | "row";
export type PricingCardTheme = "light" | "dark";

export interface PricingTier {
  /** Plan name, e.g. "Pro". */
  name: string;
  /** Numeric price — counts in when `priceCountIn` is on. */
  price: number;
  /** Billing period rendered after the price, e.g. "/mo". */
  period?: string;
  /** Feature bullets rendered with accent checks. */
  features: string[];
  /** Accent border, badge and tint mark this tier as the offer. */
  popular?: boolean;
  /** Badge text for the popular tier. Defaults to "Most popular". */
  badge?: string;
}

export interface PricingCardProps {
  /**
   * Tiers to show — an array, or a compact string:
   * "name | price | period | features (comma-separated) | popular" per tier,
   * tiers separated by ";". The 5th field marks the popular tier — use the
   * keyword "popular" for the default badge, or any other text as the badge.
   */
  tiers?: PricingTier[] | string;
  /** Count each price up from 0 with the composed Counter reel. */
  priceCountIn?: boolean;
  /** Frames between consecutive feature rows entering. */
  featureStagger?: number;
  /** Frames between neighbouring cards starting their entrance. */
  cardStagger?: number;
  /** single — one hero card (the popular tier); row — all tiers side by side. */
  layout?: PricingCardLayout;
  theme?: PricingCardTheme;
  /** Accent for the popular border, badge, tint and feature checks. */
  accentColor?: string;
  /** Static currency symbol before the price. */
  currency?: string;
  speed?: number;
  className?: string;
}

const FONT_FAMILY =
  'Inter, var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** Per-theme snap-cn palette for the card shells. */
export const PRICING_PALETTES: Record<
  PricingCardTheme,
  {
    card: string;
    border: string;
    text: string;
    muted: string;
    shadow: string;
    tintAlpha: number;
  }
> = {
  light: {
    card: "#FFFFFF",
    border: "#E4E7EC",
    text: "#101828",
    muted: "#667085",
    shadow: "0 1px 2px rgba(16,24,40,0.05)",
    tintAlpha: 0.04,
  },
  dark: {
    card: "#141417",
    border: "#26272B",
    text: "#FAFAFA",
    muted: "#A1A1AA",
    shadow: "0 1px 2px rgba(0,0,0,0.4)",
    tintAlpha: 0.08,
  },
};

/** Frames after a card's entrance before its first feature row enters. */
export const FEATURES_LEAD = 16;

/** Frames after a card's entrance before its price starts counting. */
export const PRICE_LEAD = 4;

/** Portion of the price Sequence spent counting (passed to Counter). */
export const PRICE_COUNT_PORTION = 0.35;

/** Default badge for popular tiers. */
export const DEFAULT_BADGE = "Most popular";

/** #RGB / #RRGGBB → rgba(r,g,b,alpha). Falls back to accent blue on bad input. */
export function accentTint(hex: string, alpha: number): string {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    return `rgba(38,109,240,${alpha})`;
  }
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Parses the compact string form of `tiers`. Each tier is
 * "name | price | period | features | popular" — features comma-separated,
 * tiers separated by ";". A non-empty 5th field marks the tier popular:
 * the keyword "popular" keeps the default badge, any other text becomes it.
 */
export function parseTiers(input: PricingTier[] | string): PricingTier[] {
  if (Array.isArray(input)) return input;
  return input
    .split(";")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const [
        name = "",
        rawPrice = "",
        period = "",
        rawFeatures = "",
        flag = "",
      ] = entry.split("|").map((part) => part.trim());
      const tier: PricingTier = {
        name,
        price: Number.parseFloat(rawPrice.replace(/[$,]/g, "")) || 0,
        period,
        features: rawFeatures
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f.length > 0),
      };
      if (flag) {
        tier.popular = true;
        if (flag.toLowerCase() !== "popular") tier.badge = flag;
      }
      return tier;
    });
}

/** single → just the popular tier (or the first); row → every tier. */
export function visibleTiers(
  tiers: PricingTier[],
  layout: PricingCardLayout,
): PricingTier[] {
  if (layout !== "single" || tiers.length === 0) return tiers;
  return [tiers.find((t) => t.popular) ?? tiers[0]];
}

/** Frame at which card `index` begins its entrance. */
export function tierStartFrame(index: number, cardStagger: number): number {
  return index * cardStagger;
}

/** Frame at which feature row `index` of a card enters. */
export function featureStartFrame(
  cardStart: number,
  index: number,
  featureStagger: number,
): number {
  return cardStart + FEATURES_LEAD + index * featureStagger;
}

/**
 * Width (px) the Counter's tabular reel occupies for a price, so the billing
 * period can sit right after the absolutely-filled Counter. The composed
 * Counter uses fixed advances: 0.62em per digit column, 0.32em per comma,
 * and the JetBrains Mono prefix at 0.6em per character.
 */
export function priceReelWidth(
  price: number,
  currency: string,
  fontSize: number,
): number {
  const digits = String(Math.max(0, Math.round(price))).length;
  const commas = Math.floor((digits - 1) / 3);
  return Math.ceil(
    fontSize * (0.6 * currency.length + 0.62 * digits + 0.32 * commas),
  );
}

const DEMO_TIERS =
  "Starter | 0 | /mo | 3 projects, Community support, Basic analytics; " +
  "Pro | 29 | /mo | Unlimited projects, Priority support, Advanced analytics, Team seats | popular; " +
  "Scale | 99 | /mo | Everything in Pro, SSO & SCIM, Dedicated success manager, Custom SLA";

const PRICE_FONT_SIZE = 56;

export function PricingCard({
  tiers = DEMO_TIERS,
  priceCountIn = true,
  featureStagger = 6,
  cardStagger = 8,
  layout = "row",
  theme = "light",
  accentColor = "#266DF0",
  currency = "$",
  speed = 1,
  className,
}: PricingCardProps) {
  const rate = speed > 0 ? speed : 1;
  const frame = useCurrentFrame() * rate;

  const palette = PRICING_PALETTES[theme] ?? PRICING_PALETTES.light;
  const cards = visibleTiers(parseTiers(tiers), layout);
  const cardWidth = layout === "single" ? 420 : 340;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div style={{ display: "flex", alignItems: "stretch", gap: 24 }}>
        {cards.map((tier, i) => {
          const cardStart = tierStartFrame(i, cardStagger);
          const badgeText = tier.badge ?? DEFAULT_BADGE;

          return (
            <div
              key={`${tier.name}-${i}`}
              style={{
                position: "relative",
                width: cardWidth,
                padding: "36px 32px 32px",
                borderRadius: 10,
                backgroundColor: palette.card,
                // Popular tier: accent tint wash over the surface.
                backgroundImage: tier.popular
                  ? `linear-gradient(${accentTint(accentColor, palette.tintAlpha)}, ${accentTint(accentColor, palette.tintAlpha)})`
                  : "none",
                border: `1px solid ${tier.popular ? accentColor : palette.border}`,
                boxShadow: palette.shadow,
                display: "flex",
                flexDirection: "column",
                // Staggered fade-up entrance; fast ease-out, no bounce.
                opacity: interpolate(frame - cardStart, [0, 12], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
                translate: interpolate(
                  frame - cardStart,
                  [0, 14],
                  ["0px 12px", "0px 0px"],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.out(Easing.cubic),
                  },
                ),
              }}
            >
              {/* Accent badge riding the top border of the popular tier */}
              {tier.popular ? (
                <div
                  style={{
                    position: "absolute",
                    top: -13,
                    left: "50%",
                    padding: "5px 12px",
                    borderRadius: 999,
                    backgroundColor: accentColor,
                    color: "#FFFFFF",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                    translate: "-50% 0",
                  }}
                >
                  {badgeText}
                </div>
              ) : null}

              {/* Tier name */}
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  color: palette.text,
                }}
              >
                {tier.name}
              </div>

              {/* Price reel + billing period */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 6,
                  marginTop: 14,
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: priceReelWidth(
                      tier.price,
                      currency,
                      PRICE_FONT_SIZE,
                    ),
                    height: PRICE_FONT_SIZE * 1.1,
                  }}
                >
                  <Sequence
                    from={Math.max(
                      0,
                      Math.round((cardStart + PRICE_LEAD) / rate),
                    )}
                    layout="none"
                  >
                    <Counter
                      from={priceCountIn ? 0 : tier.price}
                      to={tier.price}
                      mode="rolling"
                      countPortion={PRICE_COUNT_PORTION}
                      prefix={currency}
                      fontSize={PRICE_FONT_SIZE}
                      color={palette.text}
                      fontWeight={700}
                      speed={rate}
                    />
                  </Sequence>
                </div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    color: palette.muted,
                    paddingBottom: 9,
                    opacity: interpolate(
                      frame - cardStart,
                      [PRICE_LEAD, PRICE_LEAD + 10],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                    ),
                  }}
                >
                  {tier.period}
                </span>
              </div>

              {/* Hairline divider */}
              <div
                style={{
                  height: 1,
                  backgroundColor: tier.popular
                    ? accentTint(accentColor, 0.25)
                    : palette.border,
                  marginTop: 22,
                  marginBottom: 22,
                }}
              />

              {/* Feature rows — staggered rise with accent check draw */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 13 }}
              >
                {tier.features.map((feature, j) => {
                  const rowStart = featureStartFrame(
                    cardStart,
                    j,
                    featureStagger,
                  );
                  const draw = checkDrawProgress(frame, rowStart, 10);
                  return (
                    <div
                      key={feature}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        opacity: interpolate(frame - rowStart, [0, 8], [0, 1], {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        }),
                        translate: interpolate(
                          frame - rowStart,
                          [0, 12],
                          ["0px 8px", "0px 0px"],
                          {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                            easing: Easing.out(Easing.cubic),
                          },
                        ),
                      }}
                    >
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden
                        style={{ flexShrink: 0 }}
                      >
                        <path
                          d={CHECK_PATH}
                          stroke={accentColor}
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray={CHECK_PATH_LENGTH}
                          strokeDashoffset={CHECK_PATH_LENGTH * (1 - draw)}
                        />
                      </svg>
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 500,
                          letterSpacing: "-0.01em",
                          lineHeight: 1.35,
                          color: palette.text,
                        }}
                      >
                        {feature}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
