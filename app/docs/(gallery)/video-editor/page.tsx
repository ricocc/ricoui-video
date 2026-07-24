import type { Metadata } from "next";
import { ThemeToggle } from "@/app/(home)/components/theme-toggle";
import { GalleryFrame } from "@/components/docs/gallery/gallery-frame";
import { DocsSectionNav } from "@/components/docs/gallery/section-nav";
import { VideoEditor } from "@/components/video-editor/video-editor";

const TITLE = "Video Editor";
const DESCRIPTION =
  "Compose a video from snap-cn components — add clips, edit text and images, and export an MP4.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/docs/video-editor" },
  openGraph: {
    type: "website",
    url: "/docs/video-editor",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "snap-cn",
  },
};

export default function VideoEditorPage() {
  return (
    <GalleryFrame>
      <div className="flex items-center justify-between gap-4 pt-6">
        <DocsSectionNav />
        <ThemeToggle />
      </div>
      <VideoEditor />
    </GalleryFrame>
  );
}
