import { ImageResponse } from "next/og";
import { source } from "@/source";

export const revalidate = 3600;

const CATEGORY_LABELS: Record<string, string> = {
  "getting-started": "Getting started",
  text: "Text",
  captions: "Captions",
  logos: "Logos",
  screens: "Screens",
  overlays: "Overlays",
  data: "Data",
  social: "Social",
  scenes: "Scenes",
  transitions: "Transitions",
  backgrounds: "Backgrounds",
  ui: "UI",
};

/**
 * Branded 1200x630 OpenGraph card. `/og` renders the site card; `/og/<docs
 * slug>` renders a per-page card with the page title, description and
 * category chip. Unknown slugs fall back to the site card so a stale share
 * link never 404s.
 */
export async function GET(
  _req: Request,
  props: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await props.params;
  const page = slug?.length ? source.getPage(slug) : undefined;
  const data = page?.data as { title?: string; description?: string };

  const title = data?.title ?? "RICOUI Video";
  const description =
    data?.description ??
    "Cinematic video components for React. Production-ready Remotion animations, transitions and backgrounds — installed with the shadcn CLI.";
  const category = slug?.[0] ? CATEGORY_LABELS[slug[0]] : undefined;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        backgroundColor: "#0a0a0a",
        backgroundImage:
          "radial-gradient(circle at 20% 0%, rgba(99,102,241,0.25), transparent 55%), radial-gradient(circle at 90% 100%, rgba(168,85,247,0.18), transparent 50%)",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundImage: "linear-gradient(135deg, #6366f1, #a855f7)",
          }}
        />
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>
          RICOUI Video
        </div>
        {category ? (
          <div
            style={{
              marginLeft: 12,
              padding: "6px 18px",
              borderRadius: 9999,
              border: "1px solid rgba(250,250,250,0.25)",
              fontSize: 24,
              color: "rgba(250,250,250,0.8)",
            }}
          >
            {category}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            fontSize: title.length > 26 ? 64 : 84,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.05,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.4,
            color: "rgba(250,250,250,0.7)",
            maxWidth: 980,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 26,
          color: "rgba(250,250,250,0.6)",
        }}
      >
        <div>Video components for Remotion · shadcn CLI</div>
        <div>video.ricoui.com</div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
