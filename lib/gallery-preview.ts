import { blockExamples } from "@/components/docs/examples/blocks";
import { getDefaults, type PreviewBackdropFill } from "@/lib/customizer-config";
import registry from "@/registry/__index__";

/**
 * Normalized live-preview descriptor for one gallery slug — everything a
 * Remotion `<Player>` / `PreviewStage` needs, sourced from either the runtime
 * registry (animation + UI-primitive tiers) or the `blockExamples` scene map
 * (composition "block" slugs that have no registry entry). Shared by the grid
 * card and the detail overlay so both resolve previews identically.
 */
export interface ResolvedPreview {
  Component: React.ComponentType<Record<string, unknown>>;
  inputProps: Record<string, unknown>;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  previewBackdrop?: PreviewBackdropFill;
}

export function resolvePreview(slug: string): ResolvedPreview | null {
  const entry = registry[slug];
  if (entry) {
    return {
      Component: entry.Component,
      inputProps: getDefaults(entry.config.controls),
      durationInFrames: entry.config.durationInFrames,
      fps: entry.config.fps,
      width: entry.config.compositionWidth,
      height: entry.config.compositionHeight,
      // The surface the component is shown against (dark "footage" for captions,
      // a device mat, etc.). Without it a component with a transparent scene —
      // captions, callouts, kbd — floats on the card's flat grey mat instead of
      // filling the frame. The docs preview already paints it; the gallery must too.
      previewBackdrop: entry.config.previewBackdrop,
    };
  }
  const block = blockExamples[slug];
  if (block) {
    return {
      Component: block.Component as React.ComponentType<
        Record<string, unknown>
      >,
      inputProps: {},
      durationInFrames: block.durationInFrames,
      fps: block.fps,
      width: block.width,
      height: block.height,
      previewBackdrop: block.previewBackdrop,
    };
  }
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[gallery] no registry or block preview for slug "${slug}".`);
  }
  return null;
}
