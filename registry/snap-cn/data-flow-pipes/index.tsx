"use client";

import { Easing, interpolate, useCurrentFrame } from "remotion";

export type DataFlowTheme = "light" | "dark";

export interface DataFlowNode {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface DataFlowEdge {
  from: string;
  to: string;
  /** Frame (within a cycle) when the packet on this edge departs. */
  startFrame?: number;
}

export interface DataFlowPipesProps {
  nodes?: DataFlowNode[];
  edges?: DataFlowEdge[];
  /** Light-first palette; "dark" swaps in the dark surfaces. */
  theme?: DataFlowTheme;
  /** Override the hairline pipe stroke color (defaults from theme). */
  pipeColor?: string;
  /** Color of the travelling packet and its glow. */
  pulseColor?: string;
  /** Length of the bright packet dash in pixels. */
  pulseLength?: number;
  /** Frames a single packet takes to traverse its edge. */
  pulseDuration?: number;
  /** Packet schedule repeats every N frames. Set 0 to fire once. */
  cycleFrames?: number;
  /** Override the node card background (defaults from theme). */
  nodeColor?: string;
  /** Override the node border color (defaults from theme). */
  borderColor?: string;
  /** Override the node label color (defaults from theme). */
  textColor?: string;
  speed?: number;
  className?: string;
}

const FONT_FAMILY =
  "var(--font-geist-sans), Inter, -apple-system, BlinkMacSystemFont, sans-serif";

const THEMES: Record<
  DataFlowTheme,
  {
    pipe: string;
    node: string;
    border: string;
    text: string;
    shadow: string;
  }
> = {
  light: {
    pipe: "#E4E7EC",
    node: "#FFFFFF",
    border: "#E4E7EC",
    text: "#101828",
    shadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
  },
  dark: {
    pipe: "#26272B",
    node: "#141417",
    border: "#26272B",
    text: "#FAFAFA",
    shadow: "0 1px 2px rgba(0, 0, 0, 0.4)",
  },
};

/**
 * Default demo: the "how it works" beat of a B2B explainer — payment events
 * land in Acme Core, then fan out to reporting and alerting.
 */
const DEFAULT_NODES: DataFlowNode[] = [
  { id: "payments", x: 230, y: 360, label: "Payments" },
  { id: "core", x: 640, y: 360, label: "Acme Core" },
  { id: "reports", x: 1050, y: 252, label: "Reports" },
  { id: "alerts", x: 1050, y: 468, label: "Alerts" },
];

const DEFAULT_EDGES: DataFlowEdge[] = [
  { from: "payments", to: "core", startFrame: 0 },
  { from: "core", to: "reports", startFrame: 30 },
  { from: "core", to: "alerts", startFrame: 38 },
];

/**
 * Build a smooth cubic bezier path string between two points. The control
 * points are pulled toward the midpoint and offset horizontally for natural
 * routing — straight lines look like circuit traces, curves look like data.
 */
export function bezierPath(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  const dx = b.x - a.x;
  // Stronger horizontal handles → routes look like integration diagrams.
  const handle = Math.max(60, Math.abs(dx) * 0.5);
  const c1x = a.x + handle;
  const c1y = a.y;
  const c2x = b.x - handle;
  const c2y = b.y;
  return `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`;
}

/**
 * Approximate arc length of a cubic bezier by sampling. Gives a stable number
 * to drive `strokeDashoffset` against — purely numeric, no DOM `getTotalLength`.
 */
export function bezierLength(
  a: { x: number; y: number },
  b: { x: number; y: number },
) {
  const handle = Math.max(60, Math.abs(b.x - a.x) * 0.5);
  const c1 = { x: a.x + handle, y: a.y };
  const c2 = { x: b.x - handle, y: b.y };
  let len = 0;
  let prev = a;
  const steps = 32;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const p = {
      x:
        u * u * u * a.x +
        3 * u * u * t * c1.x +
        3 * u * t * t * c2.x +
        t * t * t * b.x,
      y:
        u * u * u * a.y +
        3 * u * u * t * c1.y +
        3 * u * t * t * c2.y +
        t * t * t * b.y,
    };
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return len;
}

export function DataFlowPipes({
  nodes = DEFAULT_NODES,
  edges = DEFAULT_EDGES,
  theme = "light",
  pipeColor,
  pulseColor = "#266DF0",
  pulseLength = 48,
  pulseDuration = 36,
  cycleFrames = 90,
  nodeColor,
  borderColor,
  textColor,
  speed = 1,
  className,
}: DataFlowPipesProps) {
  const frame = useCurrentFrame() * speed;
  const palette = THEMES[theme];
  const pipe = pipeColor ?? palette.pipe;
  const nodeBg = nodeColor ?? palette.node;
  const nodeBorder = borderColor ?? palette.border;
  const label = textColor ?? palette.text;
  const pulseFrame = cycleFrames > 0 ? frame % cycleFrames : frame;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        fontFamily: FONT_FAMILY,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1280 720"
        style={{ position: "absolute", inset: 0 }}
        role="img"
        aria-label="Data flow diagram"
      >
        {/* Static hairline pipes */}
        {edges.map((edge) => {
          const a = nodeMap.get(edge.from);
          const b = nodeMap.get(edge.to);
          if (!a || !b) return null;
          const path = bezierPath(a, b);
          return (
            <path
              key={`pipe-${edge.from}-${edge.to}`}
              d={path}
              fill="none"
              stroke={pipe}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          );
        })}

        {/* Packets with trailing ghosts */}
        {edges.map((edge) => {
          const a = nodeMap.get(edge.from);
          const b = nodeMap.get(edge.to);
          if (!a || !b) return null;
          const path = bezierPath(a, b);
          const len = bezierLength(a, b);
          const startFrame = edge.startFrame ?? 0;
          const localFrame = pulseFrame - startFrame;

          // Hide packet outside its travel window.
          if (localFrame < 0 || localFrame > pulseDuration + 6) {
            return null;
          }

          // Packet offset: the dash starts before the path (out of view) and
          // travels until it sits past the end. A wide gap (9999) makes the
          // dash pattern show exactly one bright segment.
          const offset = interpolate(
            localFrame,
            [0, pulseDuration],
            [len + pulseLength, -pulseLength],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.quad),
            },
          );

          return (
            <g key={`pulse-${edge.from}-${edge.to}`}>
              {/* Trail copies — fading and offset back along the path. */}
              {[0.12, 0.24, 0.42].map((alpha, idx) => (
                <path
                  key={`trail-${alpha}`}
                  d={path}
                  fill="none"
                  stroke={pulseColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeDasharray={`${pulseLength} 9999`}
                  strokeDashoffset={offset + (idx + 1) * 8}
                  opacity={alpha}
                />
              ))}
              {/* Bright head */}
              <path
                d={path}
                fill="none"
                stroke={pulseColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeDasharray={`${pulseLength} 9999`}
                strokeDashoffset={offset}
                style={{
                  filter: `drop-shadow(0 0 6px ${pulseColor})`,
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <div
          key={node.id}
          style={{
            position: "absolute",
            left: node.x - 66,
            top: node.y - 22,
            width: 132,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: nodeBg,
            color: label,
            border: `1px solid ${nodeBorder}`,
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            boxShadow: palette.shadow,
            opacity: interpolate(frame, [i * 4, i * 4 + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            }),
            translate: interpolate(
              frame,
              [i * 4, i * 4 + 12],
              ["0px 6px", "0px 0px"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              },
            ),
          }}
        >
          {node.label ?? node.id}
        </div>
      ))}
    </div>
  );
}
