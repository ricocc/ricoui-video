import { type NextRequest, NextResponse } from "next/server";
import { ensureCleanupSweep } from "@/lib/server/cleanup";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { enqueueRender, type RenderSpec } from "@/lib/server/render-queue";
import {
  parseVideoTimelineInput,
  RenderInputError,
} from "@/lib/server/validate-input";
import { CANVAS } from "@/lib/video-editor/types";

// Node runtime: native Remotion render (Chromium) needs full Node, not edge.
export const runtime = "nodejs";

/**
 * POST /api/render
 *
 * Payload: `{ type: "video-timeline", clips[] }` — the multi-component editor
 * export.
 *
 * Rate-limits per IP, validates the payload, enqueues a background render, and
 * returns `{ jobId }` (202) immediately. The render never blocks the request;
 * poll `GET /api/render/[jobId]` for progress. Errors: `{ error, code }`.
 */
export async function POST(request: NextRequest) {
  // Install the TTL sweep on first request (idempotent).
  ensureCleanupSweep();

  const ip = clientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        error: "Too many render requests. Please wait and retry.",
        code: "rate_limited",
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON.", code: "invalid_json" },
      { status: 400 },
    );
  }

  let spec: RenderSpec;
  try {
    spec = buildSpec(body);
  } catch (err) {
    if (err instanceof RenderInputError) {
      return NextResponse.json(
        { error: err.message, code: "invalid_input" },
        { status: err.status },
      );
    }
    throw err;
  }

  const jobId = enqueueRender(spec);
  return NextResponse.json({ jobId }, { status: 202 });
}

/** Validate an untrusted body into the video-timeline render request. */
function buildSpec(body: unknown): RenderSpec {
  const { clips } = parseVideoTimelineInput(body);
  return {
    compositionId: "video-timeline",
    inputProps: { clips },
    width: CANVAS.width,
    height: CANVAS.height,
    fileName: "ricoui-video.mp4",
  };
}

/** First hop of x-forwarded-for (the real client behind the proxy), else fallback. */
function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
