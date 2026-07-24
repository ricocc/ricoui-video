import type { ComponentType } from "react";
import type { PreviewBackdropFill } from "@/lib/customizer-config";

/**
 * UI-primitive example scenes were removed together with the snap-cn-ui gallery
 * tier. The map is kept (empty) because `component-example` and the demos root
 * still import it; repopulate it when UI components return.
 */
export interface ExampleEntry {
  Component: ComponentType;
  code: string | ((values: Record<string, unknown>) => string);
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  previewBackdrop?: PreviewBackdropFill;
}

export const examples: Record<string, ExampleEntry> = {};
