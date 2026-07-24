/**
 * Unit tests for pure helpers in registry/snap-cn/data-flow-pipes/index.tsx.
 *
 * Run with:
 *   pnpm vitest run registry/snap-cn/data-flow-pipes/__tests__/data-flow-pipes.test.ts
 *
 * No React DOM or Remotion player needed — only pure geometry is exercised.
 */

import { describe, expect, it } from "vitest";

import { bezierLength, bezierPath } from "../index";

describe("bezierPath", () => {
  it("starts at the source and ends at the target", () => {
    const d = bezierPath({ x: 230, y: 360 }, { x: 640, y: 360 });
    expect(d.startsWith("M 230 360 C ")).toBe(true);
    expect(d.endsWith(" 640 360")).toBe(true);
  });

  it("pulls control points horizontally from each endpoint", () => {
    // dx = 400 → handle = 200, so c1 = (200, 0) and c2 = (200, 100).
    const d = bezierPath({ x: 0, y: 0 }, { x: 400, y: 100 });
    expect(d).toBe("M 0 0 C 200 0, 200 100, 400 100");
  });

  it("enforces a minimum 60px handle on short edges", () => {
    const d = bezierPath({ x: 0, y: 0 }, { x: 40, y: 0 });
    expect(d).toBe("M 0 0 C 60 0, -20 0, 40 0");
  });
});

describe("bezierLength", () => {
  it("matches the straight-line distance for a horizontal edge", () => {
    // Same y → the curve degenerates to a straight segment.
    const len = bezierLength({ x: 230, y: 360 }, { x: 640, y: 360 });
    expect(len).toBeCloseTo(410, 0);
  });

  it("is never shorter than the straight-line distance", () => {
    const a = { x: 640, y: 360 };
    const b = { x: 1050, y: 252 };
    const chord = Math.hypot(b.x - a.x, b.y - a.y);
    expect(bezierLength(a, b)).toBeGreaterThanOrEqual(chord);
  });

  it("is symmetric for mirrored vertical offsets", () => {
    const up = bezierLength({ x: 640, y: 360 }, { x: 1050, y: 252 });
    const down = bezierLength({ x: 640, y: 360 }, { x: 1050, y: 468 });
    expect(up).toBeCloseTo(down, 6);
  });

  it("is deterministic across calls", () => {
    const a = { x: 230, y: 360 };
    const b = { x: 1050, y: 468 };
    expect(bezierLength(a, b)).toBe(bezierLength(a, b));
  });
});
