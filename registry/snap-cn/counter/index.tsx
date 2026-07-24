"use client";

import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import type React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily: MONO_FAMILY } = loadMono("normal", {
  weights: ["400", "700", "800"],
  subsets: ["latin"],
});

export type CounterMode = "rolling" | "odometer" | "slot";
export type CounterSeparator = "comma" | "space" | "none";

export interface CounterProps {
  /** Starting value. Strings force slot mode. */
  from?: number | string;
  /** Target value. Strings (e.g. "$199") force slot mode. */
  to?: number | string;
  /**
   * rolling  — every place travels continuously to its target (Easing.out(poly(4))).
   * odometer — each place holds, then spring-rolls in the last 10% of every rollover.
   * slot     — per-character two-row swap between the padded from/to strings;
   *            the only mode that accepts non-digit characters like "$" or "%".
   */
  mode?: CounterMode;
  /** Portion of the composition spent counting; the rest holds the target. */
  countPortion?: number;
  /** Thousands separator for rolling/odometer modes. */
  separator?: CounterSeparator;
  /** Static span rendered before the number (e.g. "$"). */
  prefix?: string;
  /** Static span rendered after the number (e.g. "%"). */
  suffix?: string;
  /** Frames between neighbouring columns starting their swap (slot mode). */
  columnStagger?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  speed?: number;
  className?: string;
}

const ROLLING_EASING = Easing.out(Easing.poly(4));
const ODOMETER_EASING = Easing.bezier(0.5, 1, 0.5, 1);

/** Fraction of a rollover during which the odometer wheel actually turns. */
const WHEEL_ROLL_START = 0.9;
const ODOMETER_SPRING_FRAMES = 30;
const ODOMETER_SPRING = { damping: 200, stiffness: 100, mass: 1 } as const;

const REVEAL_BAND = 0.4;
const REVEAL_EASING = Easing.inOut(Easing.sin);
const REVEAL_RISE_EM = 0.32;

const SLOT_SPRING = { damping: 14 } as const;

/** Wraps a wheel position into the [0, 10) band. */
export function wrap10(value: number): number {
  return ((value % 10) + 10) % 10;
}

/**
 * Signed number of digit steps the wheel at `place` travels when the value
 * moves from `start` to `end` — full turns plus the final digit delta, so the
 * ones place spins roughly ten times as far as the tens, and so on.
 */
export function placeTravel(start: number, end: number, place: number): number {
  const pow = 10 ** place;
  const up = end >= start;
  const diff = Math.abs(end - start);
  const startDigit = Math.floor(start / pow) % 10;
  const finalDigit = Math.floor(end / pow) % 10;
  const fullTurns = Math.floor(diff / (pow * 10));
  const stepDelta = up
    ? (finalDigit - startDigit + 10) % 10
    : (startDigit - finalDigit + 10) % 10;
  const magnitude = fullTurns * 10 + stepDelta;
  return up ? magnitude : -magnitude;
}

/**
 * 0→1 reveal of a leading place as the value grows through its power of ten.
 * The new place rises gently into view instead of popping in.
 */
export function placeReveal(current: number, place: number): number {
  if (place === 0) return 1;
  const threshold = 10 ** place;
  return interpolate(current, [threshold * REVEAL_BAND, threshold], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: REVEAL_EASING,
  });
}

/** Hard opacity ramp for leading places in odometer mode. */
export function placeOpacity(current: number, place: number): number {
  if (place === 0) return 1;
  const threshold = 10 ** place;
  return interpolate(current, [threshold * 0.9, threshold], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * How far (0→1) the wheel at `place` is through its current rollover.
 * Zero until the place below has covered 90% of its turn, then ramps to 1.
 */
export function rollFraction(current: number, place: number): number {
  const v = current / 10 ** place;
  const frac = v - Math.floor(v);
  if (frac <= WHEEL_ROLL_START) return 0;
  return (frac - WHEEL_ROLL_START) / (1 - WHEEL_ROLL_START);
}

/** Wheel position for one odometer place: hold the digit, then spring-roll. */
export function odometerWheel(
  current: number,
  place: number,
  springEased: (t: number) => number,
): number {
  if (current <= 0) return 0;
  if (place === 0) return current % 10;
  const digit = Math.floor(current / 10 ** place) % 10;
  const t = rollFraction(current, place);
  if (t <= 0) return digit;
  return digit + springEased(t);
}

/** Pads the shorter of two slot strings with leading spaces to equal length. */
export function padPair(
  from: string,
  to: string,
): { from: string; to: string } {
  const len = Math.max(from.length, to.length);
  return { from: from.padStart(len, " "), to: to.padStart(len, " ") };
}

/** String from/to values always animate as a slot, whatever `mode` says. */
export function resolveMode(
  mode: CounterMode,
  from: number | string,
  to: number | string,
): CounterMode {
  if (typeof from === "string" || typeof to === "string") return "slot";
  return mode;
}

/** Shared rolling digit column: a 0–9–0 reel shifted to `value`. */
function DigitColumn({
  value,
  fontSize,
  reveal,
  riseEm,
}: {
  value: number;
  fontSize: number;
  reveal: number;
  riseEm: number;
}) {
  const cellHeight = fontSize * 1.1;
  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        height: cellHeight,
        width: "0.62em",
        verticalAlign: "top",
        textAlign: "center",
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * fontSize * riseEm}px)`,
      }}
    >
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          transform: `translateY(${-value * cellHeight}px)`,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
          <span
            key={i}
            style={{ height: cellHeight, lineHeight: `${cellHeight}px` }}
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

function NumericColumns({
  start,
  end,
  progress,
  mode,
  separator,
  fontSize,
  fps,
  currentOverride,
}: {
  start: number;
  end: number;
  progress: number;
  mode: "rolling" | "odometer";
  separator: CounterSeparator;
  fontSize: number;
  fps: number;
  /** Renders the wheels at this exact continuous value (used by Odometer). */
  currentOverride?: number;
}) {
  const current =
    currentOverride ?? Math.max(0, start + progress * (end - start));
  const places = String(Math.max(start, end)).length;
  const cellHeight = fontSize * 1.1;

  const springAtEnd = spring({
    frame: ODOMETER_SPRING_FRAMES,
    fps,
    config: ODOMETER_SPRING,
  });
  const springEased = (t: number) =>
    spring({
      frame: t * ODOMETER_SPRING_FRAMES,
      fps,
      config: ODOMETER_SPRING,
    }) / springAtEnd;

  const cells: React.ReactNode[] = [];
  for (let place = 0; place < places; place++) {
    if (place > 0 && place % 3 === 0 && separator !== "none") {
      const groupReveal =
        mode === "rolling"
          ? placeReveal(current, place)
          : placeOpacity(current, place);
      cells.unshift(
        separator === "comma" ? (
          <span
            key={`s${place}`}
            style={{
              display: "inline-block",
              width: "0.32em",
              fontSize: "0.85em",
              height: cellHeight,
              lineHeight: `${cellHeight}px`,
              textAlign: "center",
              opacity: groupReveal,
            }}
          >
            ,
          </span>
        ) : (
          <span
            key={`s${place}`}
            style={{
              display: "inline-block",
              width: "0.34em",
              height: cellHeight,
            }}
          />
        ),
      );
    }

    let value: number;
    let reveal: number;
    let riseEm: number;
    if (mode === "rolling") {
      const pow = 10 ** place;
      const startDigit = Math.floor(start / pow) % 10;
      value = wrap10(startDigit + progress * placeTravel(start, end, place));
      reveal = placeReveal(current, place);
      riseEm = REVEAL_RISE_EM;
    } else {
      value = odometerWheel(current, place, springEased);
      reveal = placeOpacity(current, place);
      riseEm = 0;
    }
    cells.unshift(
      <DigitColumn
        key={`d${place}`}
        value={value}
        fontSize={fontSize}
        reveal={reveal}
        riseEm={riseEm}
      />,
    );
  }

  return <>{cells}</>;
}

function SlotColumns({
  from,
  to,
  frame,
  fps,
  columnStagger,
  fontSize,
}: {
  from: string;
  to: string;
  frame: number;
  fps: number;
  columnStagger: number;
  fontSize: number;
}) {
  const pair = padPair(from, to);
  const cellHeight = fontSize * 1.1;

  const columns: React.ReactNode[] = [];
  for (let i = 0; i < pair.from.length; i++) {
    const raw = spring({
      frame: frame - i * columnStagger,
      fps,
      config: SLOT_SPRING,
    });
    const t = Math.max(0, Math.min(1, raw));
    columns.push(
      <span
        key={i}
        style={{
          display: "inline-block",
          overflow: "hidden",
          height: cellHeight,
          verticalAlign: "top",
          width: "0.62em",
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            transform: `translateY(${-t * cellHeight}px)`,
          }}
        >
          <span style={{ height: cellHeight, lineHeight: `${cellHeight}px` }}>
            {pair.from[i]}
          </span>
          <span style={{ height: cellHeight, lineHeight: `${cellHeight}px` }}>
            {pair.to[i]}
          </span>
        </span>
      </span>,
    );
  }

  return <>{columns}</>;
}

export interface OdometerProps {
  current: number;
  fontSize: number;
  color: string;
}

/**
 * Live odometer readout at a continuous value — the primitive behind
 * mode="odometer", exported so scenes can drive the value themselves
 * (e.g. a count synced to an external animation).
 */
export function Odometer({ current, fontSize, color }: OdometerProps) {
  const { fps } = useVideoConfig();
  const value = Math.max(0, Math.round(current));
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        fontSize,
        fontWeight: 800,
        color,
        fontFamily: MONO_FAMILY,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}
    >
      <NumericColumns
        start={value}
        end={value}
        progress={1}
        mode="odometer"
        separator="comma"
        fontSize={fontSize}
        fps={fps}
        currentOverride={Math.max(0, current)}
      />
    </div>
  );
}

export function Counter({
  from = 0,
  to = 24813,
  mode = "rolling",
  countPortion = 0.8,
  separator = "comma",
  prefix = "",
  suffix = "",
  columnStagger = 4,
  fontSize = 120,
  color = "#101828",
  fontWeight = 800,
  speed = 1,
  className,
}: CounterProps) {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const resolved = resolveMode(mode, from, to);
  const portion = Math.min(1, Math.max(0.05, countPortion));
  const cellHeight = fontSize * 1.1;

  let content: React.ReactNode;
  if (resolved === "slot") {
    content = (
      <SlotColumns
        from={String(from)}
        to={String(to)}
        frame={frame * speed}
        fps={fps}
        columnStagger={columnStagger}
        fontSize={fontSize}
      />
    );
  } else {
    const start = Math.max(0, Math.round(Number(from)));
    const end = Math.max(0, Math.round(Number(to)));
    const progress = interpolate(
      frame * speed,
      [0, durationInFrames * portion],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: resolved === "rolling" ? ROLLING_EASING : ODOMETER_EASING,
      },
    );
    content = (
      <NumericColumns
        start={start}
        end={end}
        progress={progress}
        mode={resolved}
        separator={separator}
        fontSize={fontSize}
        fps={fps}
      />
    );
  }

  const staticSpanStyle: React.CSSProperties = {
    display: "inline-block",
    height: cellHeight,
    lineHeight: `${cellHeight}px`,
    verticalAlign: "top",
  };

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "flex-start",
          fontSize,
          fontWeight,
          color,
          fontFamily: MONO_FAMILY,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {prefix ? <span style={staticSpanStyle}>{prefix}</span> : null}
        {content}
        {suffix ? <span style={staticSpanStyle}>{suffix}</span> : null}
      </div>
    </AbsoluteFill>
  );
}
