import { AbsoluteFill, Series } from "remotion";
import type { Clip } from "@/lib/video-editor/types";
import registry from "@/registry/__index__";

// A `type` (not `interface`) so it satisfies Remotion's `Record<string, unknown>`
// composition-props constraint — interfaces don't get an implicit index signature.
export type VideoTimelineProps = { clips: Clip[] };

/**
 * The video the editor builds: each clip's registry component played back-to-
 * back via `<Series>`, with a baked-in snap-cn watermark. Used by BOTH the
 * in-browser `<Player>` preview and the server MP4 render, so it takes only
 * serializable props (`clips`) and resolves the live `Component` from the slug
 * internally. 1280×720 @30fps — clips that share the canvas render cleanly.
 */
export function VideoTimeline({ clips }: VideoTimelineProps) {
  const valid = clips.filter(
    (c) => registry[c.slug] && (c.durationInFrames ?? 0) > 0,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {valid.length > 0 ? (
        <Series>
          {valid.map((clip) => {
            const Component = registry[clip.slug]
              .Component as React.ComponentType<Record<string, unknown>>;
            return (
              <Series.Sequence
                key={clip.id}
                durationInFrames={Math.max(
                  1,
                  Math.round(clip.durationInFrames),
                )}
              >
                <Component {...clip.props} />
              </Series.Sequence>
            );
          })}
        </Series>
      ) : (
        <EmptyState />
      )}
      <Watermark />
    </AbsoluteFill>
  );
}

function EmptyState() {
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.5)",
        fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
        fontSize: 30,
        fontWeight: 500,
      }}
    >
      Add components to build your video
    </AbsoluteFill>
  );
}

/** Baked-in brand watermark (renders in preview AND export). */
function Watermark() {
  return (
    <div
      style={{
        position: "absolute",
        right: 26,
        bottom: 22,
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "9px 16px",
        borderRadius: 999,
        background: "rgba(10,10,12,0.42)",
        color: "rgba(255,255,255,0.92)",
        fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
        fontSize: 21,
        fontWeight: 600,
        letterSpacing: "-0.01em",
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 22,
          height: 22,
          borderRadius: 6,
          background: "#fff",
        }}
      >
        <svg width={11} height={11} viewBox="0 0 24 24" fill="#0a0a0c">
          <title>snap-cn</title>
          <path d="M7 4.5v15l12-7.5z" />
        </svg>
      </span>
      snap-cn
    </div>
  );
}
