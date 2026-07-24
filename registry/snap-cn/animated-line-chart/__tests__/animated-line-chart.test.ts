import { describe, expect, it } from "vitest";
import {
  buildPoints,
  formatCount,
  formatTick,
  labelStep,
  niceNum,
  niceScale,
  pointAtLength,
  polylineLength,
} from "../index";

describe("niceNum", () => {
  it("snaps ranges to 1/2/5 x 10^n when rounding", () => {
    expect(niceNum(850, true)).toBe(1000);
    expect(niceNum(2400, true)).toBe(2000);
    expect(niceNum(60, true)).toBe(50);
    expect(niceNum(0.8, true)).toBe(1);
  });

  it("takes the ceiling nice number when not rounding", () => {
    expect(niceNum(3400, false)).toBe(5000);
    expect(niceNum(1800, false)).toBe(2000);
    expect(niceNum(100, false)).toBe(100);
  });
});

describe("niceScale", () => {
  it("produces round bounds covering the WAU demo data", () => {
    const scale = niceScale(420, 3820, 4);
    expect(scale).toEqual({ min: 0, max: 4000, step: 1000 });
  });

  it("covers the raw extremes", () => {
    const scale = niceScale(12, 87, 4);
    expect(scale.min).toBeLessThanOrEqual(12);
    expect(scale.max).toBeGreaterThanOrEqual(87);
    expect((scale.max - scale.min) % scale.step).toBe(0);
  });

  it("handles a flat series without a zero range", () => {
    const scale = niceScale(5, 5, 4);
    expect(scale.max).toBeGreaterThan(scale.min);
  });
});

describe("buildPoints", () => {
  const scale = { min: 0, max: 100, step: 25 };

  it("spans the inner width from left to right", () => {
    const points = buildPoints([0, 50, 100], 800, 400, scale);
    expect(points[0].x).toBe(0);
    expect(points[1].x).toBe(400);
    expect(points[2].x).toBe(800);
  });

  it("inverts y so larger values sit higher", () => {
    const points = buildPoints([0, 100], 800, 400, scale);
    expect(points[0].y).toBe(400);
    expect(points[1].y).toBe(0);
  });
});

describe("polylineLength", () => {
  it("sums segment distances analytically", () => {
    const length = polylineLength([
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 3, y: 10 },
    ]);
    expect(length).toBe(11);
  });

  it("is zero for fewer than two points", () => {
    expect(polylineLength([{ x: 4, y: 2 }])).toBe(0);
  });
});

describe("pointAtLength", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ];

  it("clamps to the endpoints", () => {
    expect(pointAtLength(points, -5)).toEqual({ x: 0, y: 0 });
    expect(pointAtLength(points, 999)).toEqual({ x: 10, y: 10 });
  });

  it("interpolates within a segment", () => {
    expect(pointAtLength(points, 5)).toEqual({ x: 5, y: 0 });
    expect(pointAtLength(points, 15)).toEqual({ x: 10, y: 5 });
  });
});

describe("formatCount", () => {
  it("groups thousands with commas", () => {
    expect(formatCount(3820)).toBe("3,820");
    expect(formatCount(1234567)).toBe("1,234,567");
    expect(formatCount(420)).toBe("420");
  });

  it("rounds fractional values", () => {
    expect(formatCount(1049.6)).toBe("1,050");
  });
});

describe("formatTick", () => {
  it("compacts thousands", () => {
    expect(formatTick(4000)).toBe("4k");
    expect(formatTick(1500)).toBe("1.5k");
    expect(formatTick(0)).toBe("0");
    expect(formatTick(320)).toBe("320");
  });
});

describe("labelStep", () => {
  it("keeps every label for short series", () => {
    expect(labelStep(6)).toBe(1);
  });

  it("skips labels so at most maxLabels render", () => {
    expect(labelStep(12)).toBe(2);
    expect(labelStep(30, 6)).toBe(5);
  });
});
