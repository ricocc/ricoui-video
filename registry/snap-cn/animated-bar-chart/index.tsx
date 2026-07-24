"use client";

import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface AnimatedBarChartProps {
  /** Bar values. Auto-scaled to the tallest bar. */
  data?: number[];
  /** Axis labels rendered under each bar. */
  labels?: string[];
  /** Heading rendered above the plot. Empty string hides it. */
  title?: string;
  width?: number;
  height?: number;
  barColor?: string;
  /** Baseline + horizontal hairline color. */
  gridColor?: string;
  /** Axis label color. */
  labelColor?: string;
  titleColor?: string;
  gap?: number;
  staggerFrames?: number;
  speed?: number;
  className?: string;
}

/**
 * SVG path for a bar anchored to the baseline with only its top corners
 * rounded. The radius is clamped so short bars never self-intersect.
 */
export function roundedTopRectPath(
  x: number,
  baseY: number,
  width: number,
  height: number,
  radius: number,
): string {
  const h = Math.max(0, height);
  const r = Math.max(0, Math.min(radius, h, width / 2));
  const top = baseY - h;
  return [
    `M ${x} ${baseY}`,
    `L ${x} ${top + r}`,
    `Q ${x} ${top} ${x + r} ${top}`,
    `L ${x + width - r} ${top}`,
    `Q ${x + width} ${top} ${x + width} ${top + r}`,
    `L ${x + width} ${baseY}`,
    "Z",
  ].join(" ");
}

/** Width of each bar for a track of `count` bars separated by `gap`. */
export function barWidthFor(
  innerWidth: number,
  count: number,
  gap: number,
): number {
  if (count <= 0) return 0;
  return Math.max(0, (innerWidth - gap * (count - 1)) / count);
}

export function AnimatedBarChart({
  data = [34, 41, 46, 38, 29, 8, 5],
  labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  title = "Deploys per weekday",
  width = 1000,
  height = 520,
  barColor = "#266DF0",
  gridColor = "#E4E7EC",
  labelColor = "#667085",
  titleColor = "#101828",
  gap = 20,
  staggerFrames = 5,
  speed = 1,
  className,
}: AnimatedBarChartProps) {
  const frame = useCurrentFrame() * speed;
  const { fps } = useVideoConfig();

  const paddingX = 60;
  const paddingTop = title ? 104 : 48;
  const paddingBottom = 48;
  const labelSpace = labels && labels.length > 0 ? 40 : 0;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom - labelSpace;
  const max = Math.max(...data, 1);
  const barWidth = barWidthFor(innerWidth, data.length, gap);
  const baseY = paddingTop + innerHeight;

  const fontFamily =
    "var(--font-geist-sans), Inter, -apple-system, BlinkMacSystemFont, sans-serif";

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily,
      }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {title ? (
          <text
            x={paddingX}
            y={52}
            fill={titleColor}
            fontSize={26}
            fontWeight={600}
            letterSpacing="-0.02em"
            style={{
              fontFamily,
              opacity: interpolate(frame, [0, 14], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {title}
          </text>
        ) : null}

        {/* Horizontal hairlines */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={paddingX}
            x2={paddingX + innerWidth}
            y1={baseY - t * innerHeight}
            y2={baseY - t * innerHeight}
            stroke={gridColor}
            strokeWidth={1}
            style={{
              opacity: interpolate(frame, [0, 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          />
        ))}

        {/* Baseline */}
        <line
          x1={paddingX}
          x2={paddingX + innerWidth}
          y1={baseY}
          y2={baseY}
          stroke={gridColor}
          strokeWidth={1.5}
        />

        {data.map((value, index) => {
          const grow = spring({
            frame: frame - index * staggerFrames,
            fps,
            config: { damping: 200, stiffness: 120, mass: 0.8 },
          });
          const targetHeight = (value / max) * innerHeight;
          const x = paddingX + index * (barWidth + gap);

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: bars are positional and never reorder
            <g key={index}>
              <path
                d={roundedTopRectPath(
                  x,
                  baseY,
                  barWidth,
                  grow * targetHeight,
                  6,
                )}
                fill={barColor}
              />
              {labels?.[index] && (
                <text
                  x={x + barWidth / 2}
                  y={baseY + 28}
                  fill={labelColor}
                  fontSize={16}
                  textAnchor="middle"
                  style={{ opacity: grow, fontFamily }}
                >
                  {labels[index]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
