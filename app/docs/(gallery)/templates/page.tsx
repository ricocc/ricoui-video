import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/docs/gallery/coming-soon-page";

const TITLE = "Templates";
const DESCRIPTION =
  "Whole videos, composed from the registry and ready to render — drop in your copy and export.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/docs/templates" },
  openGraph: {
    type: "website",
    url: "/docs/templates",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "snapcn",
  },
};

export default function TemplatesPage() {
  return <ComingSoonPage title={TITLE} description={DESCRIPTION} />;
}
