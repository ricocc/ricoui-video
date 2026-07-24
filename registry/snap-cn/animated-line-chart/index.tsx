"use client";

import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface ChartPoint {
  x: number;
  y: number;
}

export interface NiceScale {
  min: number;
  max: number;
  step: number;
}

/** Heckbert "nice number": snaps a range to 1/2/5 x 10^n. */
export function niceNum(range: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * 10 ** exponent;
}

/** Round axis bounds with round tick steps covering [min, max]. */
export function niceScale(min: number, max: number, maxTicks = 4): NiceScale {
  const safeMax = max === min ? min + 1 : max;
  const range = niceNum(safeMax - min, false);
  const step = niceNum(range / maxTicks, true);
  return {
    min: Math.floor(min / step) * step,
    max: Math.ceil(safeMax / step) * step,
    step,
  };
}

/** Map data values into local chart space (y grows downward). */
export function buildPoints(
  data: number[],
  innerWidth: number,
  innerHeight: number,
  scale: NiceScale,
): ChartPoint[] {
  const range = scale.max - scale.min || 1;
  const denominator = Math.max(1, data.length - 1);
  return data.map((value, index) => ({
    x: (index / denominator) * innerWidth,
    y: innerHeight - ((value - scale.min) / range) * innerHeight,
  }));
}

/** Analytical polyline length: sum of segment distances. */
export function polylineLength(points: ChartPoint[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}

/** Point at a target distance along the polyline (clamped to endpoints). */
export function pointAtLength(
  points: ChartPoint[],
  target: number,
): ChartPoint {
  if (points.length === 0) return { x: 0, y: 0 };
  if (target <= 0) return { ...points[0] };
  let traveled = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const segment = Math.sqrt(dx * dx + dy * dy);
    if (segment > 0 && traveled + segment >= target) {
      const t = (target - traveled) / segment;
      return { x: points[i - 1].x + dx * t, y: points[i - 1].y + dy * t };
    }
    traveled += segment;
  }
  return { ...points[points.length - 1] };
}

/** 3820 -> "3,820" (deterministic, locale-independent grouping). */
export function formatCount(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return (
    sign + Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );
}

/** Compact axis tick: 4000 -> "4k", 1500 -> "1.5k", 320 -> "320". */
export function formatTick(value: number): string {
  if (Math.abs(value) >= 1000) {
    const k = value / 1000;
    const trimmed = Number.isInteger(k) ? `${k}` : k.toFixed(1);
    return `${trimmed}k`;
  }
  return `${Math.round(value)}`;
}

/** Render every nth x-label so at most `maxLabels` are shown. */
export function labelStep(count: number, maxLabels = 7): number {
  return Math.max(1, Math.ceil(count / maxLabels));
}

export interface AnimatedLineChartProps {
  /** Series values, plotted left to right. */
  data?: number[];
  /** X-axis labels, one per data point. Defaults to W1, W2, ... */
  xLabels?: string[];
  /** Metric name shown above the chart. */
  title?: string;
  /** Show the live value that tracks the leading edge of the line. */
  showValue?: boolean;
  /** Chart plot width in px (excluding card padding). */
  width?: number;
  /** Chart plot height in px (excluding card padding). */
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  gridColor?: string;
  /** Axis tick and title color. */
  labelColor?: string;
  /** Live value color. */
  valueColor?: string;
  /** Accent dot at the leading edge of the line as it draws. */
  showDot?: boolean;
  /** Wrap the chart in a white card surface. */
  showCard?: boolean;
  cardColor?: string;
  speed?: number;
  className?: string;
}

export function AnimatedLineChart({
  data = [420, 460, 520, 610, 760, 1040, 1520, 2210, 2900, 3420, 3700, 3820],
  xLabels,
  title = "Weekly active users",
  showValue = true,
  width = 880,
  height = 400,
  strokeColor = "#266DF0",
  strokeWidth = 3,
  gridColor = "#E4E7EC",
  labelColor = "#667085",
  valueColor = "#101828",
  showDot = true,
  showCard = true,
  cardColor = "#FFFFFF",
  speed = 1,
  className,
}: AnimatedLineChartProps) {
  const frame = useCurrentFrame() * speed;
  const { fps, durationInFrames } = useVideoConfig();

  const pad = { top: 16, right: 24, bottom: 40, left: 56 };
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;

  const scale = niceScale(Math.min(...data), Math.max(...data), 4);
  const points = buildPoints(data, innerWidth, innerHeight, scale);
  const pathLength = polylineLength(points);

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  // Spring-driven progress: smooth ease-out, damping 200 = no bounce.
  const progress = spring({
    frame,
    fps,
    durationInFrames: Math.round(durationInFrames * 0.85),
    config: { damping: 200 },
  });

  const dashOffset = pathLength * (1 - progress);

  // Leading-edge position along the analytical path.
  const dot = pointAtLength(points, pathLength * progress);
  const valueRange = scale.max - scale.min;
  const currentValue = scale.min + (1 - dot.y / innerHeight) * valueRange;

  const rows = Math.max(1, Math.round(valueRange / scale.step));
  const ticks = Array.from(
    { length: rows + 1 },
    (_, i) => scale.max - i * scale.step,
  );
  const labels = xLabels ?? data.map((_, i) => `W${i + 1}`);
  const xStep = labelStep(data.length);

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "'Inter', var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: showCard ? cardColor : "transparent",
          border: showCard ? `1px solid ${gridColor}` : "none",
          borderRadius: 10,
          padding: showCard ? "28px 32px 24px" : 0,
          boxShadow: showCard ? "0 1px 2px rgba(16, 24, 40, 0.05)" : "none",
        }}
      >
        {showValue && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: labelColor,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: valueColor,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
                lineHeight: 1.25,
              }}
            >
              {formatCount(currentValue)}
            </div>
          </div>
        )}

        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: "block", overflow: "visible" }}
        >
          <g transform={`translate(${pad.left}, ${pad.top})`}>
            {/* Horizontal grid + y-axis ticks */}
            {ticks.map((tick, i) => {
              const y = (i / rows) * innerHeight;
              return (
                <g key={`tick-${tick}`}>
                  <line
                    x1={0}
                    x2={innerWidth}
                    y1={y}
                    y2={y}
                    stroke={gridColor}
                    strokeWidth={1}
                  />
                  <text
                    x={-12}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill={labelColor}
                    fontSize={13}
                  >
                    {formatTick(tick)}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {points.map((p, i) =>
              i % xStep === 0 ? (
                <text
                  key={`x-${labels[i]}`}
                  x={p.x}
                  y={innerHeight + 26}
                  textAnchor="middle"
                  fill={labelColor}
                  fontSize={13}
                >
                  {labels[i]}
                </text>
              ) : null,
            )}

            {/* Animated line */}
            <path
              d={d}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLength}
              strokeDashoffset={dashOffset}
            />

            {/* Leading dot accent with a surface ring */}
            {showDot && progress > 0.001 && (
              <circle
                cx={dot.x}
                cy={dot.y}
                r={strokeWidth * 2}
                fill={strokeColor}
                stroke={cardColor}
                strokeWidth={2.5}
              />
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
