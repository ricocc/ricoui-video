/**
 * Unit tests for pure helpers in registry/snap-cn/comparison-table/index.tsx.
 *
 * Run with:
 *   pnpm vitest run registry/snap-cn/comparison-table/__tests__/comparison-table.test.ts
 *
 * No React DOM or Remotion player needed — only pure JS logic is exercised.
 */

import { describe, expect, it } from "vitest";

import {
  CHECK_DRAW_FRAMES,
  CHECK_PATH,
  CHECK_PATH_LENGTH,
  CHECK_POINTS,
  COMPARISON_PALETTES,
  GLYPH_DELAY,
  glyphProgress,
  HEADER_LEAD,
  normalizeColumns,
  normalizeRows,
  parseCellValue,
  polylineLength,
  rowStartFrame,
} from "../index";

describe("parseCellValue", () => {
  it("parses affirmative words to true", () => {
    expect(parseCellValue("yes")).toBe(true);
    expect(parseCellValue(" TRUE ")).toBe(true);
    expect(parseCellValue("✓")).toBe(true);
  });

  it("parses negative words to false", () => {
    expect(parseCellValue("no")).toBe(false);
    expect(parseCellValue("False")).toBe(false);
    expect(parseCellValue("✗")).toBe(false);
    expect(parseCellValue("x")).toBe(false);
    expect(parseCellValue("—")).toBe(false);
  });

  it("keeps everything else as trimmed text", () => {
    expect(parseCellValue(" 5 min ")).toBe("5 min");
    expect(parseCellValue("24/7")).toBe("24/7");
  });
});

describe("normalizeColumns", () => {
  it("splits comma-separated names and honours the * highlight marker", () => {
    expect(normalizeColumns("*Acme, Legacy tools")).toEqual([
      { name: "Acme", highlight: true },
      { name: "Legacy tools" },
    ]);
  });

  it("drops empty entries from strings", () => {
    expect(normalizeColumns("A,, ,B")).toEqual([{ name: "A" }, { name: "B" }]);
  });

  it("passes arrays through, dropping blank columns", () => {
    expect(
      normalizeColumns([
        { name: "Acme", highlight: true },
        { name: "  " },
        { name: "Globex" },
      ]),
    ).toEqual([{ name: "Acme", highlight: true }, { name: "Globex" }]);
  });
});

describe("normalizeRows", () => {
  it("parses ;-separated rows with |-separated cells", () => {
    expect(
      normalizeRows("Setup time | 5 min | 2 weeks; API access | yes | no"),
    ).toEqual([
      { label: "Setup time", values: ["5 min", "2 weeks"] },
      { label: "API access", values: [true, false] },
    ]);
  });

  it("drops empty lines and rows without a label", () => {
    expect(normalizeRows("; ;A | yes;")).toEqual([
      { label: "A", values: [true] },
    ]);
  });

  it("passes arrays through, dropping blank labels", () => {
    expect(
      normalizeRows([
        { label: "Realtime sync", values: [true, false] },
        { label: " ", values: [] },
      ]),
    ).toEqual([{ label: "Realtime sync", values: [true, false] }]);
  });

  it("returns an empty list for an empty string", () => {
    expect(normalizeRows("")).toEqual([]);
  });
});

describe("rowStartFrame", () => {
  it("staggers rows after the header lead", () => {
    expect(rowStartFrame(0, 10)).toBe(HEADER_LEAD);
    expect(rowStartFrame(1, 10)).toBe(HEADER_LEAD + 10);
    expect(rowStartFrame(3, 10)).toBe(HEADER_LEAD + 30);
  });

  it("accepts a custom header lead", () => {
    expect(rowStartFrame(2, 6, 0)).toBe(12);
  });
});

describe("glyphProgress", () => {
  it("is 0 before the glyph delay has elapsed", () => {
    expect(glyphProgress(0, 0)).toBe(0);
    expect(glyphProgress(GLYPH_DELAY, 0)).toBe(0);
  });

  it("completes after the 8-frame draw", () => {
    expect(CHECK_DRAW_FRAMES).toBe(8);
    expect(glyphProgress(GLYPH_DELAY + CHECK_DRAW_FRAMES, 0)).toBe(1);
    expect(glyphProgress(500, 0)).toBe(1);
  });

  it("is halfway through mid-draw", () => {
    expect(glyphProgress(GLYPH_DELAY + 4, 0)).toBeCloseTo(0.5, 6);
  });

  it("offsets by the row start frame", () => {
    expect(glyphProgress(20, 20)).toBe(0);
    expect(glyphProgress(20 + GLYPH_DELAY + CHECK_DRAW_FRAMES, 20)).toBe(1);
  });

  it("snaps instantly when drawFrames is 0", () => {
    expect(glyphProgress(GLYPH_DELAY - 1, 0, 0)).toBe(0);
    expect(glyphProgress(GLYPH_DELAY, 0, 0)).toBe(1);
  });
});

describe("check path geometry", () => {
  it("polylineLength sums straight segments", () => {
    expect(
      polylineLength([
        [0, 0],
        [3, 4],
        [3, 8],
      ]),
    ).toBeCloseTo(9, 6);
  });

  it("CHECK_PATH_LENGTH matches the check points", () => {
    expect(CHECK_PATH_LENGTH).toBeCloseTo(polylineLength(CHECK_POINTS), 9);
    expect(CHECK_PATH_LENGTH).toBeGreaterThan(0);
  });

  it("CHECK_PATH is a move + line-to string over the points", () => {
    expect(CHECK_PATH.startsWith("M4.6 10.4")).toBe(true);
    expect(CHECK_PATH.split("L")).toHaveLength(CHECK_POINTS.length);
  });
});

describe("COMPARISON_PALETTES", () => {
  it("matches the snap-cn design system", () => {
    expect(COMPARISON_PALETTES.light.surface).toBe("#FFFFFF");
    expect(COMPARISON_PALETTES.light.border).toBe("#E4E7EC");
    expect(COMPARISON_PALETTES.light.text).toBe("#101828");
    expect(COMPARISON_PALETTES.light.muted).toBe("#667085");
    expect(COMPARISON_PALETTES.light.highlightTint).toBe(
      "rgba(38,109,240,0.05)",
    );
    expect(COMPARISON_PALETTES.dark.surface).toBe("#141417");
    expect(COMPARISON_PALETTES.dark.border).toBe("#26272B");
    expect(COMPARISON_PALETTES.dark.text).toBe("#FAFAFA");
  });
});
