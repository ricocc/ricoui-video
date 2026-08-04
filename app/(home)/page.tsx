import type { Metadata } from "next";
import { GALLERY_CATEGORIES, GALLERY_COUNT } from "@/lib/gallery-data";
import { Changelog } from "./components/sections/changelog";
import { FAQ_ITEMS, Faq } from "./components/sections/faq";
import { Hero } from "./components/sections/hero";
import { ShowcaseCarousel } from "./components/sections/showcase-carousel";
import { WallOfLove } from "./components/sections/wall-of-love";
import { WhatYouGet } from "./components/sections/what-you-get";

const SITE_URL = "https://snapcn.dev";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * The FAQ answers are serialised from `FAQ_ITEMS` — the same array the section
 * renders — so the structured data cannot drift from the visible text. Google
 * drops a FAQPage where the two disagree, and an assistant quoting the markup
 * would be quoting a page that no longer says it.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      name: "snap-cn",
      url: SITE_URL,
      description:
        "A shadcn registry of Remotion components for React video: text animations, captions, device mockups, logo stings and full scenes.",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}#software`,
      name: "snap-cn",
      url: SITE_URL,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      description: `A shadcn-style registry of ${GALLERY_COUNT} Remotion components — text reveals, captions, lower thirds, screen mockups, logo stings, transitions and full scenes — installed with the shadcn CLI and copied into your project as code you own.`,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      license: "https://opensource.org/license/mit",
      isAccessibleForFree: true,
      softwareRequirements: "Remotion, React, Node.js",
      author: {
        "@type": "Person",
        name: "Sri Nath",
        url: "https://x.com/SriNath693",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}#faq`,
      mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}#categories`,
      name: "snap-cn component categories",
      itemListElement: GALLERY_CATEGORIES.map(({ id, label }, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: label,
        url: `${SITE_URL}/docs/${id}`,
      })),
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
      <WhatYouGet />
      <Changelog />
      <Faq />
      <WallOfLove />
    </>
  );
}
