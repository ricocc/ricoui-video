import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/docs/gallery/coming-soon-page";

const TITLE = "Marketplace";
const DESCRIPTION =
  "Premium blocks and full scenes from the community, installed with the same shadcn CLI as everything else.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/docs/marketplace" },
  openGraph: {
    type: "website",
    url: "/docs/marketplace",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "RICOUI Video",
  },
};

export default function MarketplacePage() {
  return <ComingSoonPage title={TITLE} description={DESCRIPTION} />;
}
