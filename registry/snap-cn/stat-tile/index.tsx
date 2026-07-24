"use client";

import { Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Counter, type CounterMode } from "@/registry/snap-cn/counter";

export type StatTileLayout = "single" | "row";
export type StatTileTheme = "light" | "dark";
export type DeltaDirection = "up" | "down";

export interface StatDelta {
  /** Chip text, e.g. "+23%". Rendered next to the direction arrow. */
  value: string;
  direction: DeltaDirection;
}

export interface StatItem {
  /**
   * Number values count up with the chosen counter mode; strings
   * (e.g. "99.98%", "$199") reel in with the slot animation.
   */
  value: number | string;
  /** Small muted caption under the number. */
  label: string;
  /** Static span before the number, e.g. "$". */
  prefix?: string;
  /** Static span after the number, e.g. "%". */
  suffix?: string;
  /** Optional up/down change chip next to the label. */
  delta?: StatDelta;
}

export interface StatTileProps {
  /**
   * Stats to show — an array, or a compact string:
   * "value | label | delta" per stat, stats separated by ";".
   * Example: "12,480 | Active users | +23%; 99.98% | Uptime".
   */
  stats?: StatItem[] | string;
  /** single — one large hero tile; row — compact tiles side by side. */
  layout?: StatTileLayout;
  /** Passed through to the composed Counter for numeric values. */
  counterMode?: CounterMode;
  /** Frames between neighbouring tiles starting their entrance. */
  stagger?: number;
  theme?: StatTileTheme;
  /** Big-number size. Defaults per layout: single 110, row 72. */
  valueFontSize?: number;
  speed?: number;
  className?: string;
}

const FONT_FAMILY =
  'Inter, var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** Per-theme snap-cn palette for the tile shell. */
export const STAT_TILE_PALETTES: Record<
  StatTileTheme,
  {
    card: string;
    border: string;
    value: string;
    label: string;
    shadow: string;
  }
> = {
  light: {
    card: "#FFFFFF",
    border: "#E4E7EC",
    value: "#101828",
    label: "#667085",
    shadow: "0 1px 2px rgba(16,24,40,0.05)",
  },
  dark: {
    card: "#141417",
    border: "#26272B",
    value: "#FAFAFA",
    label: "#A1A1AA",
    shadow: "0 1px 2px rgba(0,0,0,0.4)",
  },
};

/** Delta chip colors: success green up, danger red down. */
export const DELTA_COLORS: Record<
  DeltaDirection,
  { text: string; background: string }
> = {
  up: { text: "#12B76A", background: "rgba(18,183,106,0.12)" },
  down: { text: "#F04438", background: "rgba(240,68,56,0.12)" },
};

/**
 * "12,480" → 12480 (counts up); anything with a decimal point or symbol
 * (e.g. "99.98%", "$199") stays a string so the Counter uses slot mode.
 */
export function parseStatValue(raw: string): number | string {
  if (/^\d[\d,]*$/.test(raw)) {
    return Number.parseInt(raw.replace(/,/g, ""), 10);
  }
  return raw;
}

/**
 * Parses the compact string form of `stats`. Each stat is
 * "value | label | delta" (delta optional); stats are separated by ";".
 * A delta starting with "-" points down, everything else points up.
 */
export function parseStats(input: StatItem[] | string): StatItem[] {
  if (Array.isArray(input)) return input;
  return input
    .split(";")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const [rawValue = "", label = "", rawDelta = ""] = entry
        .split("|")
        .map((part) => part.trim());
      const stat: StatItem = { value: parseStatValue(rawValue), label };
      if (rawDelta) {
        stat.delta = {
          value: rawDelta,
          direction: rawDelta.startsWith("-") ? "down" : "up",
        };
      }
      return stat;
    });
}

/** Layout-dependent default number size (spec band: 72–110). */
export function defaultValueSize(layout: StatTileLayout): number {
  return layout === "single" ? 110 : 72;
}

/** Counter start value: numbers count from 0, strings reel in from blank. */
export function counterStart(value: number | string): number | string {
  return typeof value === "string" ? "" : 0;
}

export function StatTile({
  stats = "12,480 | Active users | +23%; 99.98% | Uptime; 4.9 | Avg rating",
  layout = "single",
  counterMode = "rolling",
  stagger = 10,
  theme = "light",
  valueFontSize,
  speed = 1,
  className,
}: StatTileProps) {
  const frame = useCurrentFrame();

  const items = parseStats(stats);
  const palette = STAT_TILE_PALETTES[theme] ?? STAT_TILE_PALETTES.light;
  const valueSize = valueFontSize ?? defaultValueSize(layout);
  const rate = speed > 0 ? speed : 1;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        fontFamily: FONT_FAMILY,
      }}
    >
      {items.map((stat, i) => (
        <div
          key={`${stat.label}-${i}`}
          style={{
            width: layout === "single" ? 560 : 340,
            padding: layout === "single" ? "56px 40px" : "36px 24px",
            borderRadius: 10,
            backgroundColor: palette.card,
            border: `1px solid ${palette.border}`,
            boxShadow: palette.shadow,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // Staggered fade-up entrance; fast ease-out, no bounce.
            opacity: interpolate(frame * rate - i * stagger, [0, 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame * rate - i * stagger,
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
          {/* Big number — the composed Counter fills this box. */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: valueSize * 1.1,
            }}
          >
            <Sequence
              from={Math.max(0, Math.round((i * stagger) / rate))}
              layout="none"
            >
              <Counter
                from={counterStart(stat.value)}
                to={stat.value}
                mode={counterMode}
                prefix={stat.prefix ?? ""}
                suffix={stat.suffix ?? ""}
                fontSize={valueSize}
                color={palette.value}
                speed={rate}
              />
            </Sequence>
          </div>

          {/* Label + optional delta chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 14,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: palette.label,
              }}
            >
              {stat.label}
            </span>
            {stat.delta ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "3px 8px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  color: DELTA_COLORS[stat.delta.direction].text,
                  backgroundColor:
                    DELTA_COLORS[stat.delta.direction].background,
                  opacity: interpolate(
                    frame * rate - i * stagger,
                    [26, 36],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  ),
                  translate: interpolate(
                    frame * rate - i * stagger,
                    [26, 38],
                    ["0px 6px", "0px 0px"],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.out(Easing.cubic),
                    },
                  ),
                }}
              >
                <svg
                  width={10}
                  height={10}
                  viewBox="0 0 10 10"
                  aria-hidden
                  style={{
                    rotate: stat.delta.direction === "down" ? "180deg" : "0deg",
                  }}
                >
                  <path d="M5 1.5L9 7.5H1Z" fill="currentColor" />
                </svg>
                {stat.delta.value}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
