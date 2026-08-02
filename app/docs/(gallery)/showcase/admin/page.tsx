import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth, isAdmin } from "@/auth";
import { DocsTopBar } from "@/components/docs/gallery/docs-top-bar";
import { GalleryFrame } from "@/components/docs/gallery/gallery-frame";
import { AdminList } from "@/components/showcase/admin-list";
import { getPendingSubmissions } from "@/lib/server/showcase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Showcase moderation",
  robots: { index: false, follow: false },
};

export default async function ShowcaseAdminPage() {
  const session = await auth();
  // Non-admins get a 404 (don't reveal the route exists).
  if (!isAdmin(session?.user?.email)) notFound();

  const items = await getPendingSubmissions();

  return (
    <GalleryFrame>
      <DocsTopBar />
      <div className="pt-4">
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-4xl font-semibold tracking-tight text-foreground"
        >
          Showcase moderation
        </h1>
        <p className="mt-2 text-muted-foreground">
          {items.length} pending submission{items.length === 1 ? "" : "s"}.
        </p>
      </div>
      <AdminList items={items} />
    </GalleryFrame>
  );
}
