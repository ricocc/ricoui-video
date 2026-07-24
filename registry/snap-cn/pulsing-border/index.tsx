"use client";

import {
  PulsingBorder as PaperPulsingBorder,
  type PulsingBorderProps as PaperPulsingBorderProps,
} from "@paper-design/shaders-react";
import { useCallback, useState } from "react";
import {
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const GLOW_COLOR_A = "#266DF0";
const GLOW_COLOR_B = "#6D9BF5";

export interface PulsingBorderProps
  extends Omit<PaperPulsingBorderProps, "frame" | "ref"> {
  /** First glow color. Ignored when `colors` is set explicitly. */
  glowColorA?: string;
  /** Second glow color. Ignored when `colors` is set explicitly. */
  glowColorB?: string;
}

/**
 * "AI is working" frame — a soft glowing border that pulses around the
 * edges of the scene while a response streams. Transparent by default so
 * it layers over any content (e.g. a chat UI mid-response).
 *
 * Deterministic: the shader's clock is driven from `useCurrentFrame()`
 * via the `frame` prop, so renders are frame-exact.
 */
export function PulsingBorder({
  speed = 0.6,
  colorBack = "#00000000",
  colors,
  glowColorA = GLOW_COLOR_A,
  glowColorB = GLOW_COLOR_B,
  roundness = 0.08,
  thickness = 0.06,
  intensity = 0.15,
  bloom = 0.2,
  className,
  ...rest
}: PulsingBorderProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const [handle] = useState(() => delayRender("pulsing-border"));
  const gate = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) return;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => continueRender(handle)),
      );
    },
    [handle],
  );

  return (
    <div
      ref={gate}
      className={className}
      style={{ position: "absolute", inset: 0 }}
    >
      <PaperPulsingBorder
        speed={0}
        frame={(frame / fps) * speed * 1000}
        colorBack={colorBack}
        colors={colors ?? [glowColorA, glowColorB]}
        roundness={roundness}
        thickness={thickness}
        intensity={intensity}
        bloom={bloom}
        fit="cover"
        width={width}
        height={height}
        {...rest}
      />
    </div>
  );
}
