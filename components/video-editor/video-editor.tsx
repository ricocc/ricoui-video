"use client";

import { Download, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useTrackEvent } from "@/lib/analytics";
import { getDefaults } from "@/lib/customizer-config";
import {
  type Clip,
  MAX_CLIP_FRAMES,
  MAX_CLIPS,
  totalDuration,
} from "@/lib/video-editor/types";
import registry from "@/registry/__index__";
import { EditorPlayer } from "./editor-player";
import { LibraryPanel } from "./library-panel";
import { PropertiesPanel } from "./properties-panel";
import { TimelineStrip } from "./timeline-strip";
import { useEditorExport } from "./use-editor-export";

let clipCounter = 0;
function nextClipId() {
  clipCounter += 1;
  return `clip-${clipCounter}`;
}

export function VideoEditor() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { exporting, progress, download } = useEditorExport();
  const trackEvent = useTrackEvent();

  // Opened vs. exported is the editor's only funnel — how many people reach it
  // and then build nothing tells us whether the empty state is the problem.
  useEffect(() => {
    trackEvent("editor_opened");
  }, [trackEvent]);

  // The guard reads `clips` from the closure rather than the updater's `prev`,
  // because the tracking call has to live OUTSIDE the state updater: React
  // double-invokes updaters under StrictMode, and a side effect in there fires
  // twice. `addClip` is only ever called from a click, so the closure is current.
  const addClip = useCallback(
    (slug: string) => {
      const entry = registry[slug];
      if (!entry || clips.length >= MAX_CLIPS) return;
      const clip: Clip = {
        id: nextClipId(),
        slug,
        props: getDefaults(entry.config.controls),
        durationInFrames: entry.config.durationInFrames,
      };
      setClips((prev) => [...prev, clip]);
      setSelectedId(clip.id);
      // Which components people reach for when composing a real video — a
      // different ranking from which docs pages get read.
      trackEvent("editor_clip_added", {
        component: slug,
        clip_count: clips.length + 1,
      });
    },
    [clips.length, trackEvent],
  );

  const updateProp = useCallback(
    (key: string, value: unknown) => {
      setClips((prev) =>
        prev.map((c) =>
          c.id === selectedId
            ? { ...c, props: { ...c.props, [key]: value } }
            : c,
        ),
      );
    },
    [selectedId],
  );

  const updateDuration = useCallback(
    (frames: number) => {
      const clamped = Math.min(MAX_CLIP_FRAMES, Math.max(1, frames));
      setClips((prev) =>
        prev.map((c) =>
          c.id === selectedId ? { ...c, durationInFrames: clamped } : c,
        ),
      );
    },
    [selectedId],
  );

  const removeClip = useCallback((id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const moveClip = useCallback((id: string, dir: -1 | 1) => {
    setClips((prev) => {
      const i = prev.findIndex((c) => c.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }, []);

  const selected = clips.find((c) => c.id === selectedId) ?? null;
  const totalSeconds = (totalDuration(clips) / 30).toFixed(1);

  return (
    <div className="flex min-h-[560px] flex-col gap-3 pt-4 lg:h-[calc(100dvh-6.5rem)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            style={{ fontFamily: "var(--font-display)" }}
            className="text-3xl font-semibold tracking-tight text-foreground"
          >
            Video Editor
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add components to the timeline, edit them, and export your video.
            {clips.length > 0
              ? ` · ${clips.length} clip(s) · ${totalSeconds}s`
              : null}
          </p>
        </div>
        <Button
          onClick={() => download(clips)}
          disabled={exporting || clips.length === 0}
          className="shrink-0 gap-2"
        >
          {exporting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {Math.round(progress * 100)}%
            </>
          ) : (
            <>
              <Download className="size-4" />
              Download MP4
            </>
          )}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
        <aside className="order-2 flex max-h-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-border lg:order-1 lg:max-h-none lg:w-60">
          <LibraryPanel onAdd={addClip} />
        </aside>

        <div className="order-1 flex min-h-0 flex-1 flex-col gap-3 lg:order-2">
          <EditorPlayer clips={clips} />
          <TimelineStrip
            clips={clips}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onRemove={removeClip}
            onMove={moveClip}
          />
        </div>

        <aside className="order-3 flex max-h-96 shrink-0 flex-col overflow-hidden rounded-2xl border border-border lg:max-h-none lg:w-80">
          <PropertiesPanel
            clip={selected}
            onPropChange={updateProp}
            onDurationChange={updateDuration}
          />
        </aside>
      </div>

      <Toaster />
    </div>
  );
}
