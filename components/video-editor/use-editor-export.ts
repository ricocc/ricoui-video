"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Clip } from "@/lib/video-editor/types";

/**
 * Server-side MP4 export for the timeline: POST the clips to `/api/render`, poll
 * the job to completion, and trigger a browser download. Mirrors the `/stars`
 * `use-mp4-export` flow (same job API), just with a `clips` payload.
 */

type JobState = {
  status: "queued" | "rendering" | "done" | "error";
  progress: number;
  downloadUrl?: string;
  error?: string;
};

const POLL_MS = 800;

export function useEditorExport() {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const stop = useCallback(() => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const download = useCallback(
    async (clips: Clip[]) => {
      if (clips.length === 0) {
        toast.error("Add at least one clip before exporting.");
        return;
      }
      cancelledRef.current = false;
      setExporting(true);
      setProgress(0);

      try {
        const res = await fetch("/api/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "video-timeline", clips }),
        });
        if (!res.ok) throw new Error(await readError(res));
        const { jobId } = (await res.json()) as { jobId: string };

        await new Promise<void>((resolve, reject) => {
          const tick = async () => {
            if (cancelledRef.current) return resolve();
            try {
              const r = await fetch(`/api/render/${jobId}`);
              if (!r.ok) throw new Error("Lost track of the render job");
              const job = (await r.json()) as JobState;
              if (cancelledRef.current) return resolve();
              setProgress(job.progress ?? 0);
              if (job.status === "done" && job.downloadUrl) {
                triggerDownload(job.downloadUrl);
                return resolve();
              }
              if (job.status === "error") {
                return reject(new Error(job.error || "Render failed"));
              }
              pollRef.current = setTimeout(tick, POLL_MS);
            } catch (err) {
              reject(err);
            }
          };
          void tick();
        });
      } catch (err) {
        if (!cancelledRef.current) {
          console.error("[video-editor] export failed:", err);
          toast.error("Export failed", {
            description: err instanceof Error ? err.message : String(err),
          });
        }
      } finally {
        stop();
        setExporting(false);
      }
    },
    [stop],
  );

  return { exporting, progress, download };
}

function triggerDownload(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    if (body?.error) return body.error;
  } catch {
    // non-JSON
  }
  if (res.status === 429) return "Too many requests. Please wait and retry.";
  return `Render request failed (${res.status})`;
}
