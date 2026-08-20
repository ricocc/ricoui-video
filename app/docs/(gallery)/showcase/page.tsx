import type { Metadata } from "next";
import { auth, getConfiguredProviders } from "@/auth";
import { DocsTopBar } from "@/components/docs/gallery/docs-top-bar";
import { GalleryFrame } from "@/components/docs/gallery/gallery-frame";
import { ShowcaseGallery } from "@/components/showcase/showcase-gallery";
import { ShowcaseHeader } from "@/components/showcase/showcase-header";
import { isDbConfigured } from "@/lib/server/db";
import { getApprovedSubmissions } from "@/lib/server/showcase";

// Reads the session (cookies) + DB per request — never prerendered.
export const dynamic = "force-dynamic";

const TITLE = "Showcase";
const DESCRIPTION =
  "Videos built with RICOUI Video, submitted by the community.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/docs/showcase" },
  openGraph: {
    type: "website",
    url: "/docs/showcase",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "RICOUI Video",
  },
};

export default async function ShowcasePage() {
  const [items, session] = await Promise.all([
    getApprovedSubmissions(),
    auth(),
  ]);
  const providers = getConfiguredProviders();

  return (
    <GalleryFrame>
      <DocsTopBar />
      <ShowcaseHeader user={session?.user ?? null} providers={providers} />
      <div className="pb-24">
        <ShowcaseGallery items={items} notConfigured={!isDbConfigured} />
      </div>
    </GalleryFrame>
  );
}
