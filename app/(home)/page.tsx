import type { Metadata } from "next";
import { Changelog } from "./components/sections/changelog";
import { ComingSoon } from "./components/sections/coming-soon";
import { Hero } from "./components/sections/hero";
import { ShowcaseCarousel } from "./components/sections/showcase-carousel";
import { WallOfLove } from "./components/sections/wall-of-love";

const SITE_URL = "https://snapcn.dev";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "snap-cn",
      url: SITE_URL,
      description:
        "Production-ready Remotion animations, transitions and backgrounds. Install with the shadcn CLI and own the code.",
    },
    {
      "@type": "SoftwareApplication",
      name: "snap-cn",
      url: SITE_URL,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      description:
        "A shadcn-style registry of video components for Remotion: text reveals, captions, lower thirds, screen mockups, charts, transitions and backgrounds — copied into your project, owned by you.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      license: "https://opensource.org/license/mit",
      author: {
        "@type": "Person",
        name: "Sri Nath",
        url: "https://x.com/SriNath693",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from constants
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <ShowcaseCarousel />
      <Changelog />
      <WallOfLove />
      <ComingSoon />
    </>
  );
}
