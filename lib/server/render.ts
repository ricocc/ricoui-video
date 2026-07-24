import "server-only";
import {
  makeCancelSignal,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import { getServeUrl } from "./bundle";

/**
 * Server-side MP4 render of any registered Remotion composition (
 * video-timeline, …). Full native quality on the box — width/height are passed
 * per request so one bundle serves every composition/orientation.
 */

/** Concurrency (Chromium tabs) for a single render; env-tunable, default 4. */
function remotionConcurrency(): number {
  const parsed = Number(process.env.REMOTION_CONCURRENCY);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 4;
}

export interface RenderCompositionOptions {
  /** Composition id registered in `src/remotion/Root.tsx`. */
  compositionId: string;
  /** Serializable props; drive duration (video-timeline) + content. */
  inputProps: Record<string, unknown>;
  /** Output dimensions (override the composition defaults). */
  width: number;
  height: number;
  /** Absolute path the encoded MP4 is written to. */
  outputPath: string;
  /** Render progress in [0, 1]. */
  onProgress?: (progress: number) => void;
  /** Abort the render (client disconnect / timeout) → cancels Chromium. */
  signal?: AbortSignal;
}

/**
 * Render `compositionId` with `inputProps` to `outputPath`. Bridges a standard
 * AbortSignal onto Remotion's CancelSignal so a stuck/abandoned render can be
 * killed. Duration comes from the composition (video-timeline computes it from
 * `clips` via `calculateMetadata`).
 */
export async function renderComposition({
  compositionId,
  inputProps,
  width,
  height,
  outputPath,
  onProgress,
  signal,
}: RenderCompositionOptions): Promise<string> {
  if (signal?.aborted) {
    throw new Error("Render aborted before it started");
  }

  const serveUrl = await getServeUrl();

  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  const { cancelSignal, cancel } = makeCancelSignal();
  const onAbort = () => cancel();
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    await renderMedia({
      composition: { ...composition, width, height },
      serveUrl,
      codec: "h264",
      inputProps,
      outputLocation: outputPath,
      concurrency: remotionConcurrency(),
      cancelSignal,
      onProgress: onProgress
        ? ({ progress }) => onProgress(progress)
        : undefined,
    });
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }

  return outputPath;
}
