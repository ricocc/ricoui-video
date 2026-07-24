import { describe, expect, it } from "vitest";
import { barWidthFor, roundedTopRectPath } from "../index";

describe("roundedTopRectPath", () => {
  it("builds a baseline-anchored path with rounded top corners", () => {
    expect(roundedTopRectPath(10, 100, 40, 60, 6)).toBe(
      "M 10 100 L 10 46 Q 10 40 16 40 L 44 40 Q 50 40 50 46 L 50 100 Z",
    );
  });

  it("clamps the radius to the bar height for short bars", () => {
    // height 2 < radius 6 → radius collapses to 2, no self-intersection
    expect(roundedTopRectPath(0, 100, 40, 2, 6)).toBe(
      "M 0 100 L 0 100 Q 0 98 2 98 L 38 98 Q 40 98 40 100 L 40 100 Z",
    );
  });

  it("clamps the radius to half the bar width for thin bars", () => {
    // width 8 → radius clamps to 4
    expect(roundedTopRectPath(0, 100, 8, 60, 6)).toBe(
      "M 0 100 L 0 44 Q 0 40 4 40 L 4 40 Q 8 40 8 44 L 8 100 Z",
    );
  });

  it("degenerates to the baseline at zero height", () => {
    expect(roundedTopRectPath(0, 100, 40, 0, 6)).toBe(
      "M 0 100 L 0 100 Q 0 100 0 100 L 40 100 Q 40 100 40 100 L 40 100 Z",
    );
  });

  it("treats negative heights as zero", () => {
    expect(roundedTopRectPath(0, 100, 40, -10, 6)).toBe(
      roundedTopRectPath(0, 100, 40, 0, 6),
    );
  });
});

describe("barWidthFor", () => {
  it("divides the track between bars minus gaps", () => {
    // 7 bars, gap 20 → (880 - 120) / 7
    expect(barWidthFor(880, 7, 20)).toBeCloseTo(760 / 7);
  });

  it("uses the full track for a single bar", () => {
    expect(barWidthFor(880, 1, 20)).toBe(880);
  });

  it("returns 0 for an empty dataset", () => {
    expect(barWidthFor(880, 0, 20)).toBe(0);
  });

  it("never goes negative when gaps exceed the track", () => {
    expect(barWidthFor(100, 10, 50)).toBe(0);
  });
});
