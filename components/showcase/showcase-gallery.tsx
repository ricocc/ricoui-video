import type { ShowcaseItem } from "@/lib/server/showcase";
import { ShowcaseCard } from "./showcase-card";

/**
 * Masonry of approved showcase entries, styled to match the components gallery.
 * Falls back to a friendly empty state — different copy depending on whether the
 * backend just isn't connected yet vs. there simply being no submissions.
 */
export function ShowcaseGallery({
  items,
  notConfigured,
}: {
  items: ShowcaseItem[];
  notConfigured?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="text-lg font-medium text-foreground">
          {notConfigured ? "Showcase is being set up." : "No videos yet."}
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          {notConfigured
            ? "Submissions open once the backend is connected."
            : "Be the first to share a video you built with snapcn."}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 columns-1 gap-5 sm:columns-2 xl:columns-3">
      {items.map((item) => (
        <ShowcaseCard key={item.id} item={item} />
      ))}
    </div>
  );
}
