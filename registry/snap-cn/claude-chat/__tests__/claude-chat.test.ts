import { describe, expect, it } from "vitest";

import {
  morphProgressAt,
  RESPONSE_CPS,
  RESPONSE_START_FRAME,
  SEND_FRAME,
  sendMorphAt,
  TYPING_CPS,
  TYPING_START_FRAME,
} from "../index";

const FPS = 30;

describe("timeline constants", () => {
  it("starts typing on a positive frame offset", () => {
    expect(TYPING_START_FRAME).toBeGreaterThan(0);
  });

  it("types at a positive characters-per-second rate", () => {
    expect(TYPING_CPS).toBeGreaterThan(0);
  });

  it("sends after typing starts and streams after sending", () => {
    expect(SEND_FRAME).toBeGreaterThan(TYPING_START_FRAME);
    expect(RESPONSE_START_FRAME).toBeGreaterThan(SEND_FRAME);
  });

  it("streams the response faster than the prompt types", () => {
    expect(RESPONSE_CPS).toBeGreaterThan(TYPING_CPS);
  });
});

describe("morphProgressAt", () => {
  it("is at or near 0 before the start frame", () => {
    for (let f = 0; f < TYPING_START_FRAME; f++) {
      const val = morphProgressAt(f, { fps: FPS, speed: 1 });
      expect(val).toBeLessThanOrEqual(0.001);
    }
  });

  it("increases after the start frame", () => {
    const early = morphProgressAt(TYPING_START_FRAME + 3, {
      fps: FPS,
      speed: 1,
    });
    const later = morphProgressAt(TYPING_START_FRAME + 12, {
      fps: FPS,
      speed: 1,
    });
    expect(later).toBeGreaterThan(early);
  });

  it("stays within [0, 1] for every frame", () => {
    for (let f = 0; f <= 300; f++) {
      const val = morphProgressAt(f, { fps: FPS, speed: 1 });
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  it("approaches 1 for large frames", () => {
    expect(morphProgressAt(300, { fps: FPS, speed: 1 })).toBeCloseTo(1, 2);
  });
});

describe("sendMorphAt", () => {
  it("is at or near 0 before typing starts", () => {
    for (let f = 0; f < TYPING_START_FRAME; f++) {
      expect(sendMorphAt(f, { fps: FPS, speed: 1 })).toBeLessThanOrEqual(0.001);
    }
  });

  it("is fully morphed to the send button just before sending", () => {
    expect(sendMorphAt(SEND_FRAME - 1, { fps: FPS, speed: 1 })).toBeCloseTo(
      1,
      2,
    );
  });

  it("springs back to the waveform after the prompt is sent", () => {
    expect(sendMorphAt(SEND_FRAME + 60, { fps: FPS, speed: 1 })).toBeCloseTo(
      0,
      2,
    );
  });

  it("stays within [0, 1] for every frame", () => {
    for (let f = 0; f <= 300; f++) {
      const val = sendMorphAt(f, { fps: FPS, speed: 1 });
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });
});
