"use client";

import { ChevronLeft, ChevronRight, Film, X } from "lucide-react";
import { ITEM_BY_SLUG } from "@/lib/gallery-data";
import { cn } from "@/lib/utils";
import { CANVAS, type Clip } from "@/lib/video-editor/types";

export function TimelineStrip({
  clips,
  selectedId,
  onSelect,
  onRemove,
  onMove,
}: {
  clips: Clip[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}) {
  if (clips.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground">
        Your timeline is empty — add components from the left.
      </div>
    );
  }

  return (
    <div className="flex items-stretch gap-2 overflow-x-auto rounded-2xl border border-border bg-gallery-card/40 p-2">
      {clips.map((clip, i) => {
        const name = ITEM_BY_SLUG.get(clip.slug)?.name ?? clip.slug;
        const secs = (clip.durationInFrames / CANVAS.fps).toFixed(1);
        const active = clip.id === selectedId;
        return (
          <div
            key={clip.id}
            className={cn(
              "flex w-40 shrink-0 flex-col rounded-xl border p-2 transition-colors",
              active
                ? "border-primary bg-primary/5"
                : "border-border bg-gallery-card hover:border-foreground/20",
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(clip.id)}
              className="flex flex-1 flex-col items-start gap-1 text-left outline-none"
            >
              <div className="flex w-full items-center gap-1.5">
                <Film className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm font-medium text-foreground">
                  {name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{secs}s</span>
            </button>
            <div className="mt-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => onMove(clip.id, -1)}
                disabled={i === 0}
                aria-label="Move earlier"
                className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onMove(clip.id, 1)}
                disabled={i === clips.length - 1}
                aria-label="Move later"
                className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(clip.id)}
                aria-label="Remove clip"
                className="ml-auto grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
