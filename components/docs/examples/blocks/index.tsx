import type { ComponentType } from "react";
import { FPS, H, type PreviewBackdropFill, W } from "@/lib/customizer-config";

/**
 * Composition "block" flows were removed together with the snap-cn-ui gallery
 * tier. The map is kept (empty) because `gallery-preview` and the demos root
 * still import it; repopulate it when the flows return.
 */
export interface BlockExampleEntry {
  Component: ComponentType;
  code: string | ((values?: Record<string, unknown>) => string);
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  previewBackdrop?: PreviewBackdropFill;
}

export const blockExamples: Record<string, BlockExampleEntry> = {};

// Re-export so callers can reach the shared timing constants without a second
// import path.
export { FPS, H, W };
