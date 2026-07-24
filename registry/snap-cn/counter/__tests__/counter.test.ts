/**
 * Unit tests for pure helpers in registry/snap-cn/counter/index.tsx.
 *
 * Run with:
 *   pnpm vitest run registry/snap-cn/counter
 *
 * No React DOM or Remotion player needed — only pure JS logic is exercised.
 */

import { describe, expect, it } from "vitest";

import {
  odometerWheel,
  padPair,
  placeOpacity,
  placeReveal,
  placeTravel,
  resolveMode,
  rollFraction,
  wrap10,
} from "../index";

describe("wrap10", () => {
  it("wraps positive values into [0, 10)", () => {
    expect(wrap10(12.5)).toBeCloseTo(2.5);
    expect(wrap10(10)).toBe(0);
    expect(wrap10(7)).toBe(7);
  });

  it("wraps negative wheel positions upward", () => {
    expect(wrap10(-1)).toBe(9);
    expect(wrap10(-12.5)).toBeCloseTo(7.5);
  });
});

describe("placeTravel", () => {
  it("moves the ones place by the full difference when counting up", () => {
    expect(placeTravel(0, 24813, 0)).toBe(24813);
  });

  it("moves higher places roughly a tenth as far per place", () => {
    expect(placeTravel(0, 24813, 1)).toBe(2481);
    expect(placeTravel(0, 24813, 2)).toBe(248);
    expect(placeTravel(0, 24813, 3)).toBe(24);
    expect(placeTravel(0, 24813, 4)).toBe(2);
  });

  it("is negative when counting down and mirrors the count-up travel", () => {
    expect(placeTravel(24813, 0, 0)).toBe(-24813);
    expect(placeTravel(24813, 0, 1)).toBe(-2481);
  });

  it("lands exactly on the target digit", () => {
    // start digit + travel must equal the end digit mod 10
    for (let place = 0; place < 5; place++) {
      const pow = 10 ** place;
      const startDigit = Math.floor(137 / pow) % 10;
      const endDigit = Math.floor(90210 / pow) % 10;
      const landed = wrap10(startDigit + placeTravel(137, 90210, place));
      expect(landed).toBe(endDigit);
    }
  });
});

describe("placeReveal", () => {
  it("keeps the ones place always fully revealed", () => {
    expect(placeReveal(0, 0)).toBe(1);
    expect(placeReveal(99999, 0)).toBe(1);
  });

  it("hides a place well below its power of ten and reveals it at the threshold", () => {
    expect(placeReveal(30, 2)).toBe(0);
    expect(placeReveal(100, 2)).toBe(1);
    const mid = placeReveal(70, 2);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });
});

describe("placeOpacity", () => {
  it("ramps from 0 to 1 across the last 10% before the threshold", () => {
    expect(placeOpacity(89, 2)).toBe(0);
    expect(placeOpacity(95, 2)).toBeCloseTo(0.5);
    expect(placeOpacity(100, 2)).toBe(1);
    expect(placeOpacity(5, 0)).toBe(1);
  });
});

describe("rollFraction", () => {
  it("is zero while the place below is in the first 90% of its turn", () => {
    expect(rollFraction(12, 1)).toBe(0);
    expect(rollFraction(15, 1)).toBe(0);
  });

  it("ramps to 1 across the last 10% of each rollover", () => {
    expect(rollFraction(19.5, 1)).toBeCloseTo(0.5);
    expect(rollFraction(19.95, 1)).toBeCloseTo(0.95);
  });
});

describe("odometerWheel", () => {
  const identity = (t: number) => t;

  it("spins the ones place continuously", () => {
    expect(odometerWheel(7.25, 0, identity)).toBeCloseTo(7.25);
    expect(odometerWheel(13.5, 0, identity)).toBeCloseTo(3.5);
  });

  it("holds higher places until the rollover, then eases through it", () => {
    expect(odometerWheel(12, 1, identity)).toBe(1);
    expect(odometerWheel(19.95, 1, identity)).toBeCloseTo(1.95);
  });

  it("returns 0 for non-positive values", () => {
    expect(odometerWheel(0, 0, identity)).toBe(0);
    expect(odometerWheel(-3, 2, identity)).toBe(0);
  });
});

describe("padPair", () => {
  it("pads the shorter string with leading spaces", () => {
    expect(padPair("$99", "$199")).toEqual({ from: " $99", to: "$199" });
    expect(padPair("1000", "42")).toEqual({ from: "1000", to: "  42" });
  });

  it("leaves equal-length strings untouched", () => {
    expect(padPair("abc", "xyz")).toEqual({ from: "abc", to: "xyz" });
  });
});

describe("resolveMode", () => {
  it("keeps the requested mode for numeric values", () => {
    expect(resolveMode("rolling", 0, 100)).toBe("rolling");
    expect(resolveMode("odometer", 0, 100)).toBe("odometer");
  });

  it("forces slot mode when either value is a string", () => {
    expect(resolveMode("rolling", 0, "$199")).toBe("slot");
    expect(resolveMode("odometer", "$99", 199)).toBe("slot");
  });
});
