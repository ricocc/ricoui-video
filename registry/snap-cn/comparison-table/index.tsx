"use client";

import type { CSSProperties } from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

export type ComparisonTableTheme = "light" | "dark";

export interface ComparisonColumn {
  name: string;
  /** Highlighted column gets an accent header band and a tinted body. */
  highlight?: boolean;
}

export interface ComparisonRow {
  /** Feature label shown in the first column. */
  label: string;
  /** One value per column: `true` → check, `false` → cross, string → text. */
  values: (boolean | string)[];
}

export interface ComparisonTableProps {
  /**
   * Value columns — array, or a comma-separated string where a leading `*`
   * marks the highlighted column (e.g. `"*Acme, Legacy tools"`).
   */
  columns?: ComparisonColumn[] | string;
  /**
   * Feature rows — array, or a string of `;`-separated rows with
   * `|`-separated cells: `"Setup time | 5 min | 2 weeks; API access | yes | no"`.
   * Cell strings `yes/true/✓` parse to checks, `no/false/✗/x` to crosses.
   */
  rows?: ComparisonRow[] | string;
  /** Frames between consecutive row entrances. */
  rowStagger?: number;
  /** Light (#FFF surface) or dark (#141417 surface) palette. */
  theme?: ComparisonTableTheme;
  /** Accent for the highlighted header band, column tint and check strokes. */
  accentColor?: string;
  /** Cross color. */
  crossColor?: string;
  /** Overall table width in pixels. */
  tableWidth?: number;
  /** Cell text size in pixels; paddings and glyphs scale with it. */
  fontSize?: number;
  /** Global playback multiplier. */
  speed?: number;
  className?: string;
}

const FONT_FAMILY =
  'Inter, var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** Per-theme snap-cn palette for the table shell. */
export const COMPARISON_PALETTES: Record<
  ComparisonTableTheme,
  {
    surface: string;
    headerBand: string;
    border: string;
    text: string;
    muted: string;
    highlightTint: string;
  }
> = {
  light: {
    surface: "#FFFFFF",
    headerBand: "#FAFAFA",
    border: "#E4E7EC",
    text: "#101828",
    muted: "#667085",
    highlightTint: "rgba(38,109,240,0.05)",
  },
  dark: {
    surface: "#141417",
    headerBand: "#0A0A0B",
    border: "#26272B",
    text: "#FAFAFA",
    muted: "#A1A1AA",
    highlightTint: "rgba(38,109,240,0.1)",
  },
};

/** Check polyline in a 20×20 viewBox. */
export const CHECK_POINTS: ReadonlyArray<readonly [number, number]> = [
  [4.6, 10.4],
  [8.4, 14.2],
  [15.4, 6.2],
];

/** Total length of a polyline through the given points. */
export function polylineLength(
  points: ReadonlyArray<readonly [number, number]>,
): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    total += Math.hypot(dx, dy);
  }
  return total;
}

/** SVG path string for the check polyline. */
export const CHECK_PATH = `M${CHECK_POINTS.map((p) => p.join(" ")).join("L")}`;

/** Stroke length used for the dash-draw of the check. */
export const CHECK_PATH_LENGTH = polylineLength(CHECK_POINTS);

/** Frames the check stroke takes to draw once its row is on screen. */
export const CHECK_DRAW_FRAMES = 8;

/** Frames a row is on screen before its glyphs start animating. */
export const GLYPH_DELAY = 3;

/** Frames the header row occupies before the first body row enters. */
export const HEADER_LEAD = 8;

/** Cell strings that parse to a boolean check / cross. */
const TRUE_WORDS = new Set(["yes", "true", "✓", "check"]);
const FALSE_WORDS = new Set(["no", "false", "✗", "x", "cross", "-", "—"]);

/** "yes/true/✓" → true, "no/false/✗/x/—" → false, anything else stays text. */
export function parseCellValue(raw: string): boolean | string {
  const word = raw.trim().toLowerCase();
  if (TRUE_WORDS.has(word)) return true;
  if (FALSE_WORDS.has(word)) return false;
  return raw.trim();
}

/**
 * Accepts an array or a comma-separated string. In string form a leading `*`
 * marks the highlighted column: `"*Acme, Legacy tools"`.
 */
export function normalizeColumns(
  columns: ComparisonColumn[] | string,
): ComparisonColumn[] {
  if (typeof columns === "string") {
    return columns
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) =>
        name.startsWith("*")
          ? { name: name.slice(1).trim(), highlight: true }
          : { name },
      );
  }
  return columns.filter((col) => col.name.trim().length > 0);
}

/**
 * Accepts an array or a string of `;`-separated rows with `|`-separated
 * cells; the first cell is the row label, the rest parse via `parseCellValue`.
 */
export function normalizeRows(rows: ComparisonRow[] | string): ComparisonRow[] {
  if (typeof rows === "string") {
    return rows
      .split(";")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const cells = line.split("|").map((cell) => cell.trim());
        return {
          label: cells[0] ?? "",
          values: cells.slice(1).map(parseCellValue),
        };
      })
      .filter((row) => row.label.length > 0);
  }
  return rows.filter((row) => row.label.trim().length > 0);
}

/** Frame at which body row `index` begins its entrance. */
export function rowStartFrame(
  index: number,
  stagger: number,
  headerLead: number = HEADER_LEAD,
): number {
  return headerLead + index * stagger;
}

/**
 * 0..1 progress of a cell glyph for a row that entered at `rowStart`.
 * Starts `GLYPH_DELAY` frames in, completes over `drawFrames`.
 */
export function glyphProgress(
  frame: number,
  rowStart: number,
  drawFrames: number = CHECK_DRAW_FRAMES,
): number {
  if (drawFrames <= 0) return frame >= rowStart + GLYPH_DELAY ? 1 : 0;
  return interpolate(
    frame,
    [rowStart + GLYPH_DELAY, rowStart + GLYPH_DELAY + drawFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

const DEMO_COLUMNS = "*Acme, Legacy tools";
const DEMO_ROWS =
  "Setup time | 5 min | 2 weeks; API access | yes | no; Realtime sync | yes | no; Support | 24/7 | Email only";

export function ComparisonTable({
  columns = DEMO_COLUMNS,
  rows = DEMO_ROWS,
  rowStagger = 10,
  theme = "light",
  accentColor = "#266DF0",
  crossColor = "#667085",
  tableWidth = 720,
  fontSize = 22,
  speed = 1,
  className,
}: ComparisonTableProps) {
  const frame = useCurrentFrame() * speed;

  const palette = COMPARISON_PALETTES[theme] ?? COMPARISON_PALETTES.light;
  const cols = normalizeColumns(columns);
  const body = normalizeRows(rows);

  const cellPadY = Math.round(fontSize * 0.72);
  const cellPadX = Math.round(fontSize * 1.1);
  const glyphSize = Math.round(fontSize * 0.95);
  const gridTemplateColumns = `minmax(0, 1.35fr) repeat(${Math.max(cols.length, 1)}, minmax(0, 1fr))`;

  const cellBase: CSSProperties = {
    padding: `${cellPadY}px ${cellPadX}px`,
    display: "flex",
    alignItems: "center",
    minHeight: Math.round(fontSize * 2.4),
  };

  const glyphCell = (
    value: boolean | string,
    colIndex: number,
    start: number,
  ) => {
    const progress = glyphProgress(frame, start, CHECK_DRAW_FRAMES);
    if (value === true) {
      return (
        <svg
          width={glyphSize}
          height={glyphSize}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
        >
          <path
            d={CHECK_PATH}
            stroke={accentColor}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={CHECK_PATH_LENGTH}
            strokeDashoffset={CHECK_PATH_LENGTH * (1 - progress)}
          />
        </svg>
      );
    }
    if (value === false) {
      return (
        <svg
          width={glyphSize}
          height={glyphSize}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          style={{ opacity: progress }}
        >
          <path
            d="M6 6L14 14M14 6L6 14"
            stroke={crossColor}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        </svg>
      );
    }
    return (
      <span
        style={{
          opacity: progress,
          color: cols[colIndex]?.highlight ? palette.text : palette.muted,
          fontWeight: cols[colIndex]?.highlight ? 600 : 500,
        }}
      >
        {value}
      </span>
    );
  };

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
      {/* Table shell — hairline border and 10px radius, hairlines over shadows. */}
      <div
        style={{
          width: tableWidth,
          backgroundColor: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0, 14], ["0px 10px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns,
            backgroundColor: palette.headerBand,
            borderBottom: `1px solid ${palette.border}`,
            opacity: interpolate(frame, [0, HEADER_LEAD], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div style={cellBase} />
          {cols.map((col) => (
            <div
              key={col.name}
              style={{
                ...cellBase,
                justifyContent: "center",
                backgroundColor: col.highlight ? accentColor : undefined,
                color: col.highlight ? "#FFFFFF" : palette.muted,
                fontSize: Math.round(fontSize * 0.82),
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              {col.name}
            </div>
          ))}
        </div>

        {/* Body rows */}
        {body.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "grid",
              gridTemplateColumns,
              borderTop: i === 0 ? undefined : `1px solid ${palette.border}`,
              opacity: interpolate(
                frame,
                [
                  rowStartFrame(i, rowStagger),
                  rowStartFrame(i, rowStagger) + 8,
                ],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
              translate: interpolate(
                frame,
                [
                  rowStartFrame(i, rowStagger),
                  rowStartFrame(i, rowStagger) + 12,
                ],
                ["0px 8px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.cubic),
                },
              ),
            }}
          >
            <div
              style={{
                ...cellBase,
                fontSize,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: palette.text,
              }}
            >
              {row.label}
            </div>
            {cols.map((col, c) => (
              <div
                key={col.name}
                style={{
                  ...cellBase,
                  justifyContent: "center",
                  fontSize,
                  backgroundColor: col.highlight
                    ? palette.highlightTint
                    : undefined,
                }}
              >
                {row.values[c] === undefined
                  ? null
                  : glyphCell(row.values[c], c, rowStartFrame(i, rowStagger))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
