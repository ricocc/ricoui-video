/**
 * Shared, dependency-free types for the video editor — imported by both the
 * client editor UI and the server render validator/pipeline.
 */

/** One clip on the timeline: a registry component + its edited props + length. */
export interface Clip {
  /** Stable id for React keys / reorder. */
  id: string;
  /** Registry slug (key of `registry/__index__.tsx`). */
  slug: string;
  /** Props spread onto the component (seeded from `getDefaults`, then edited). */
  props: Record<string, unknown>;
  /** Frames this clip occupies on the timeline. */
  durationInFrames: number;
}

/** Timeline canvas — every clip renders at this size/rate (shared W/H/FPS). */
export const CANVAS = { width: 1280, height: 720, fps: 30 } as const;

/** Per-clip and whole-timeline frame caps (renders cost real CPU). */
export const MAX_CLIPS = 12;
export const MAX_CLIP_FRAMES = 1800; // 60s @30fps
export const MAX_TOTAL_FRAMES = 5400; // 3min @30fps

/** Sum of clip lengths, floored at 1 (a Player/Composition needs ≥1 frame). */
export function totalDuration(clips: Clip[]): number {
  const sum = clips.reduce(
    (acc, c) => acc + Math.max(1, Math.round(c.durationInFrames || 0)),
    0,
  );
  return Math.max(1, sum);
}
