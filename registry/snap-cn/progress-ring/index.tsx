"use client";

import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Counter } from "@/registry/snap-cn/counter";

export type ProgressRingVariant = "ring" | "bar";

export interface ProgressRingProps {
  /** Target percentage, clamped to 0–100. */
  value?: number;
  /** Circular ring or horizontal bar. */
  variant?: ProgressRingVariant;
  /** Ring stroke width / bar height, in px. */
  thickness?: number;
  /** Fill color. */
  color?: string;
  /** Unfilled track color. */
  trackColor?: string;
  /** Animate the readout with the counter's rolling count-up. */
  countUp?: boolean;
  /** Static text that replaces the automatic "<value>%" readout. */
  label?: string;
  /** Supporting copy — under the readout (ring) or left of it (bar). */
  sublabel?: string;
  sublabelColor?: string;
  /** Ring diameter / bar width, in px. */
  size?: number;
  /** Readout font size. Defaults to size * 0.2 for the ring, 28 for the bar. */
  fontSize?: number;
  /** Readout color. */
  textColor?: string;
  /** Wrap the element in a white stat card with a hairline border. */
  card?: boolean;
  speed?: number;
  className?: string;
}

const FONT_FAMILY =
  'Inter, var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** Portion of the composition the sweep occupies; the rest holds the target. */
export const SWEEP_PORTION = 0.7;

/** Same ease-out the counter's rolling mode uses, so ring and readout stay in sync. */
const SWEEP_EASING = Easing.out(Easing.poly(4));

/** Clamps a percentage into [0, 100]; non-finite input collapses to 0. */
export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * Eased 0→1 sweep over the first `SWEEP_PORTION` of the composition,
 * holding at 1 afterwards.
 */
export function sweepProgress(frame: number, durationInFrames: number): number {
  return interpolate(frame, [0, durationInFrames * SWEEP_PORTION], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SWEEP_EASING,
  });
}

/** Radius and circumference of a ring stroked with `thickness` inside `size`. */
export function ringGeometry(
  size: number,
  thickness: number,
): { radius: number; circumference: number } {
  const radius = Math.max(1, (size - thickness) / 2);
  return { radius, circumference: 2 * Math.PI * radius };
}

/** Dash offset that leaves `fraction` (0→1) of the circumference visible. */
export function dashOffset(circumference: number, fraction: number): number {
  return circumference * (1 - Math.min(1, Math.max(0, fraction)));
}

/**
 * Width (px) of the box that holds the counter readout: one 0.62em reel per
 * digit plus room for the "%" suffix, mirroring the counter's column metrics.
 */
export function counterBoxWidth(value: number, fontSize: number): number {
  const digits = String(Math.round(clampPercent(value))).length;
  return (digits * 0.62 + 0.75) * fontSize;
}

export function ProgressRing({
  value = 87,
  variant = "ring",
  thickness = 10,
  color = "#266DF0",
  trackColor = "#E4E7EC",
  countUp = true,
  label,
  sublabel = "",
  sublabelColor = "#667085",
  size = 280,
  fontSize,
  textColor = "#101828",
  card = false,
  speed = 1,
  className,
}: ProgressRingProps) {
  const frame = useCurrentFrame() * speed;
  const { durationInFrames } = useVideoConfig();

  const pct = clampPercent(value);
  const progress = sweepProgress(frame, durationInFrames);
  const fillFraction = (pct / 100) * progress;

  const readoutSize =
    fontSize ?? (variant === "ring" ? Math.round(size * 0.2) : 28);
  const sublabelSize = Math.max(13, Math.round(readoutSize * 0.3));

  const readout =
    label || !countUp ? (
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: readoutSize,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: textColor,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {label || `${Math.round(pct)}%`}
      </div>
    ) : (
      // Counter renders into an AbsoluteFill, so give it a sized, positioned box.
      <div
        style={{
          position: "relative",
          width: counterBoxWidth(pct, readoutSize),
          height: readoutSize * 1.1,
        }}
      >
        <Counter
          from={0}
          to={Math.round(pct)}
          mode="rolling"
          suffix="%"
          separator="none"
          countPortion={SWEEP_PORTION}
          fontSize={readoutSize}
          color={textColor}
          fontWeight={700}
          speed={speed}
        />
      </div>
    );

  const sublabelNode = sublabel ? (
    <div
      style={{
        fontFamily: FONT_FAMILY,
        fontSize: sublabelSize,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        lineHeight: 1.35,
        color: sublabelColor,
        textAlign: variant === "ring" ? "center" : "left",
        maxWidth: variant === "ring" ? size - thickness * 4 : size * 0.6,
      }}
    >
      {sublabel}
    </div>
  ) : null;

  const { radius, circumference } = ringGeometry(size, thickness);

  const content =
    variant === "ring" ? (
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ rotate: "-90deg" }}
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={thickness}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset(circumference, fillFraction)}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: thickness,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: Math.round(readoutSize * 0.16),
          }}
        >
          {readout}
          {sublabelNode}
        </div>
      </div>
    ) : (
      <div
        style={{
          width: size,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {sublabelNode ?? <div />}
          {readout}
        </div>
        <div
          style={{
            width: "100%",
            height: thickness,
            borderRadius: thickness / 2,
            backgroundColor: trackColor,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${fillFraction * 100}%`,
              height: "100%",
              borderRadius: thickness / 2,
              backgroundColor: color,
            }}
          />
        </div>
      </div>
    );

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
      <div
        style={{
          // Quick fade-up entrance; no bounce.
          opacity: interpolate(frame, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [0, 12], ["0px 8px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
          ...(card
            ? {
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E7EC",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(16,24,40,0.06)",
                padding: variant === "ring" ? 40 : "32px 36px",
              }
            : {}),
        }}
      >
        {content}
      </div>
    </div>
  );
}
