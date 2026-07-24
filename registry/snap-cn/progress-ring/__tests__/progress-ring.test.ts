/**
 * Unit tests for pure helpers in registry/snap-cn/progress-ring/index.tsx.
 *
 * Run with:
 *   pnpm vitest run registry/snap-cn/progress-ring
 *
 * No React DOM or Remotion player needed — only pure JS logic is exercised.
 */

import { describe, expect, it } from "vitest";

import {
  clampPercent,
  counterBoxWidth,
  dashOffset,
  ringGeometry,
  SWEEP_PORTION,
  sweepProgress,
} from "../index";

describe("clampPercent", () => {
  it("passes in-range values through", () => {
    expect(clampPercent(87)).toBe(87);
    expect(clampPercent(0)).toBe(0);
    expect(clampPercent(100)).toBe(100);
  });

  it("clamps out-of-range values", () => {
    expect(clampPercent(-5)).toBe(0);
    expect(clampPercent(140)).toBe(100);
  });

  it("collapses non-finite input to 0", () => {
    expect(clampPercent(Number.NaN)).toBe(0);
    expect(clampPercent(Number.POSITIVE_INFINITY)).toBe(0);
    expect(clampPercent(Number.NEGATIVE_INFINITY)).toBe(0);
  });
});

describe("sweepProgress", () => {
  const D = 120;

  it("starts at 0 and never goes negative", () => {
    expect(sweepProgress(0, D)).toBe(0);
    expect(sweepProgress(-10, D)).toBe(0);
  });

  it("reaches 1 at the end of the sweep portion and holds", () => {
    expect(sweepProgress(D * SWEEP_PORTION, D)).toBeCloseTo(1);
    expect(sweepProgress(D, D)).toBeCloseTo(1);
    expect(sweepProgress(D * 3, D)).toBeCloseTo(1);
  });

  it("is monotonically non-decreasing", () => {
    let prev = 0;
    for (let f = 0; f <= D; f++) {
      const p = sweepProgress(f, D);
      expect(p).toBeGreaterThanOrEqual(prev);
      prev = p;
    }
  });

  it("eases out — past halfway well before the midpoint of the sweep", () => {
    expect(sweepProgress((D * SWEEP_PORTION) / 2, D)).toBeGreaterThan(0.5);
  });
});

describe("ringGeometry", () => {
  it("insets the radius by half the stroke on each side", () => {
    const { radius, circumference } = ringGeometry(280, 10);
    expect(radius).toBe(135);
    expect(circumference).toBeCloseTo(2 * Math.PI * 135);
  });

  it("never collapses below a 1px radius", () => {
    expect(ringGeometry(10, 20).radius).toBe(1);
  });
});

describe("dashOffset", () => {
  const C = 100;

  it("hides the full circumference at fraction 0", () => {
    expect(dashOffset(C, 0)).toBe(C);
  });

  it("reveals everything at fraction 1", () => {
    expect(dashOffset(C, 1)).toBe(0);
  });

  it("is linear in between and clamps out-of-range fractions", () => {
    expect(dashOffset(C, 0.87)).toBeCloseTo(13);
    expect(dashOffset(C, -1)).toBe(C);
    expect(dashOffset(C, 2)).toBe(0);
  });
});

describe("counterBoxWidth", () => {
  it("grows with the digit count", () => {
    expect(counterBoxWidth(7, 56)).toBeLessThan(counterBoxWidth(87, 56));
    expect(counterBoxWidth(87, 56)).toBeLessThan(counterBoxWidth(100, 56));
  });

  it("scales linearly with font size", () => {
    expect(counterBoxWidth(87, 100)).toBeCloseTo(counterBoxWidth(87, 50) * 2);
  });

  it("reserves one 0.62em reel per digit plus the suffix", () => {
    expect(counterBoxWidth(87, 100)).toBeCloseTo(2 * 62 + 75);
  });
});
