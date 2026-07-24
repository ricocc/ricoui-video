"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef } from "react";
import { CANVAS, type Clip, totalDuration } from "@/lib/video-editor/types";
import { VideoTimeline } from "./video-timeline";

/**
 * The editor's live preview: the `VideoTimeline` composition in a Remotion
 * `<Player>`, fed the current clips. Autoplay is driven imperatively on mount
 * (the `autoPlay` prop is unreliable — mirrors `PreviewStage`).
 */
export function EditorPlayer({ clips }: { clips: Clip[] }) {
  const ref = useRef<PlayerRef>(null);

  useEffect(() => {
    let r1 = 0;
    let r2 = 0;
    r1 = requestAnimationFrame(() => {
      ref.current?.play();
      r2 = requestAnimationFrame(() => {
        if (ref.current && !ref.current.isPlaying()) ref.current.play();
      });
    });
    return () => {
      if (r1) cancelAnimationFrame(r1);
      if (r2) cancelAnimationFrame(r2);
    };
  }, []);

  return (
    <div className="surface-card aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <Player
        ref={ref}
        component={VideoTimeline}
        inputProps={{ clips }}
        durationInFrames={totalDuration(clips)}
        fps={CANVAS.fps}
        compositionWidth={CANVAS.width}
        compositionHeight={CANVAS.height}
        style={{ width: "100%", height: "100%" }}
        controls
        loop
        acknowledgeRemotionLicense
      />
    </div>
  );
}
