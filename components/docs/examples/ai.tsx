import type { ComponentType } from "react";

/**
 * The AI example scenes (`claude-chat`, `v0`) were removed together with their
 * registry components. The map is kept (empty) because the demos root still
 * spreads it into `ALL_SCENES`; repopulate it when AI surfaces return.
 */
export interface AiExampleEntry {
  Component: ComponentType;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}

export const aiExamples: Record<string, AiExampleEntry> = {};
