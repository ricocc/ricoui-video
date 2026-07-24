import {
  type CalculateMetadataFunction,
  Composition,
  registerRoot,
} from "remotion";
import { VideoTimeline } from "@/components/video-editor/video-timeline";
import { CANVAS, type Clip, totalDuration } from "@/lib/video-editor/types";

/**
 * Duration of the timeline = Σ per-clip durations, resolved from `inputProps`
 * at render time. Typed standalone so the `Composition` generic pins its props
 * to `{ clips }` instead of widening to `Record<string, unknown>`.
 */
const timelineMetadata: CalculateMetadataFunction<{ clips: Clip[] }> = ({
  props,
}) => ({
  durationInFrames: totalDuration(props.clips ?? []),
});

/**
 * Bundle root for the `/docs/video-editor` export. `video-timeline`'s duration
 * is derived from the `clips` prop via `calculateMetadata` (Σ per-clip
 * durations), so one composition renders any user-assembled timeline.
 */
export function RemotionRoot() {
  return (
    <Composition
      id="video-timeline"
      component={VideoTimeline}
      durationInFrames={300}
      fps={CANVAS.fps}
      width={CANVAS.width}
      height={CANVAS.height}
      defaultProps={{ clips: [] as Clip[] }}
      calculateMetadata={timelineMetadata}
    />
  );
}

registerRoot(RemotionRoot);
