/**
 * Unit tests for pure helpers in registry/snap-cn/stat-tile/index.tsx.
 *
 * Run with:
 *   pnpm vitest run registry/snap-cn/stat-tile
 *
 * No React DOM or Remotion player needed — only pure JS logic is exercised.
 */

import { describe, expect, it } from "vitest";

import {
  counterStart,
  DELTA_COLORS,
  defaultValueSize,
  parseStats,
  parseStatValue,
  STAT_TILE_PALETTES,
} from "../index";

describe("parseStatValue", () => {
  it("parses plain integers", () => {
    expect(parseStatValue("12480")).toBe(12480);
  });

  it("strips thousands separators", () => {
    expect(parseStatValue("12,480")).toBe(12480);
    expect(parseStatValue("1,299,000")).toBe(1299000);
  });

  it("keeps decimals as strings (slot mode)", () => {
    expect(parseStatValue("99.98")).toBe("99.98");
    expect(parseStatValue("4.9")).toBe("4.9");
  });

  it("keeps symbol-bearing values as strings (slot mode)", () => {
    expect(parseStatValue("99.98%")).toBe("99.98%");
    expect(parseStatValue("$199")).toBe("$199");
  });
});

describe("parseStats", () => {
  it("passes arrays through untouched", () => {
    const stats = [{ value: 42, label: "Answers" }];
    expect(parseStats(stats)).toBe(stats);
  });

  it("parses the compact demo string into three stats", () => {
    const stats = parseStats(
      "12,480 | Active users | +23%; 99.98% | Uptime; 4.9 | Avg rating",
    );
    expect(stats).toEqual([
      {
        value: 12480,
        label: "Active users",
        delta: { value: "+23%", direction: "up" },
      },
      { value: "99.98%", label: "Uptime" },
      { value: "4.9", label: "Avg rating" },
    ]);
  });

  it("infers delta direction from a leading minus", () => {
    const [stat] = parseStats("320 | Churned | -4%");
    expect(stat.delta).toEqual({ value: "-4%", direction: "down" });
  });

  it("skips empty segments and trims whitespace", () => {
    const stats = parseStats("  7 | Teams ;; ");
    expect(stats).toEqual([{ value: 7, label: "Teams" }]);
  });
});

describe("defaultValueSize", () => {
  it("uses the large hero size for single layout", () => {
    expect(defaultValueSize("single")).toBe(110);
  });

  it("uses the compact size for row layout", () => {
    expect(defaultValueSize("row")).toBe(72);
  });
});

describe("counterStart", () => {
  it("counts numbers up from zero", () => {
    expect(counterStart(12480)).toBe(0);
  });

  it("reels strings in from blank (slot mode)", () => {
    expect(counterStart("99.98%")).toBe("");
  });
});

describe("palettes", () => {
  it("follows the snap-cn light surface tokens", () => {
    expect(STAT_TILE_PALETTES.light.card).toBe("#FFFFFF");
    expect(STAT_TILE_PALETTES.light.border).toBe("#E4E7EC");
    expect(STAT_TILE_PALETTES.light.value).toBe("#101828");
    expect(STAT_TILE_PALETTES.light.label).toBe("#667085");
  });

  it("follows the snap-cn dark surface tokens", () => {
    expect(STAT_TILE_PALETTES.dark.card).toBe("#141417");
    expect(STAT_TILE_PALETTES.dark.border).toBe("#26272B");
  });

  it("uses success green up and danger red down for deltas", () => {
    expect(DELTA_COLORS.up.text).toBe("#12B76A");
    expect(DELTA_COLORS.down.text).toBe("#F04438");
  });
});
