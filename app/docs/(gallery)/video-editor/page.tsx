import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/docs/gallery/coming-soon-page";

const TITLE = "Video Editor";
const DESCRIPTION =
  "Compose a video from snapcn components — add clips, edit text and images, and export an MP4.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/docs/video-editor" },
  openGraph: {
    type: "website",
    url: "/docs/video-editor",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "snapcn",
  },
};

// Not shipped yet, so the route says so in the same chrome as Templates and
// Marketplace rather than serving a half-built editor. `components/video-editor`
// is left in the tree — it is the work in progress, not dead code; render it
// here again when it is ready.
export default function VideoEditorPage() {
  return <ComingSoonPage title={TITLE} description={DESCRIPTION} />;
}
