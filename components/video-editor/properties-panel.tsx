"use client";

import { ComponentCustomizer } from "@/components/docs/component-customizer";
import { ITEM_BY_SLUG } from "@/lib/gallery-data";
import { CANVAS, type Clip, MAX_CLIP_FRAMES } from "@/lib/video-editor/types";
import registry from "@/registry/__index__";

export function PropertiesPanel({
  clip,
  onPropChange,
  onDurationChange,
}: {
  clip: Clip | null;
  onPropChange: (key: string, value: unknown) => void;
  onDurationChange: (frames: number) => void;
}) {
  if (!clip) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Select a clip on the timeline to edit its text, images, and length.
      </div>
    );
  }

  const entry = registry[clip.slug];
  if (!entry) return null;
  const name = ITEM_BY_SLUG.get(clip.slug)?.name ?? clip.slug;
  const secs = clip.durationInFrames / CANVAS.fps;

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <h3 className="text-sm font-semibold text-foreground">{name}</h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Edits preview live. Upload your own images with the Upload button.
      </p>

      <div className="mb-4">
        <label
          htmlFor="clip-duration"
          className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground"
        >
          <span>Duration</span>
          <span className="font-mono text-foreground">{secs.toFixed(1)}s</span>
        </label>
        <input
          id="clip-duration"
          type="range"
          min={0.5}
          max={MAX_CLIP_FRAMES / CANVAS.fps}
          step={0.5}
          value={secs}
          onChange={(e) =>
            onDurationChange(Math.round(Number(e.target.value) * CANVAS.fps))
          }
          style={{ accentColor: "var(--primary)" }}
          className="w-full"
        />
      </div>

      <ComponentCustomizer
        controls={entry.config.controls}
        values={clip.props}
        onChange={onPropChange}
        columns={1}
      />
    </div>
  );
}
