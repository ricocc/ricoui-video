import type { Metadata } from "next";
import { headers } from "next/headers";
import { GALLERY_CATEGORIES, GALLERY_COUNT } from "@/lib/gallery-data";
import { Changelog } from "./components/sections/changelog";
import { FAQ_ITEMS, FAQ_ITEMS_ZH, Faq } from "./components/sections/faq";
import { Hero } from "./components/sections/hero";
import { ShowcaseCarousel } from "./components/sections/showcase-carousel";
import { WallOfLove } from "./components/sections/wall-of-love";
import { WhatYouGet } from "./components/sections/what-you-get";

const SITE_URL = "https://video.ricoui.com";

export async function generateMetadata(): Promise<Metadata> {
  const zh = (await headers()).get("x-ricoui-locale") !== "en";
  return {
    alternates: {
      canonical: zh ? "/" : "/en",
      languages: { en: "/en", "zh-CN": "/" },
    },
  };
}

/**
 * The FAQ answers are serialised from `FAQ_ITEMS` — the same array the section
 * renders — so the structured data cannot drift from the visible text. Google
 * drops a FAQPage where the two disagree, and an assistant quoting the markup
 * would be quoting a page that no longer says it.
 */
function getJsonLd(locale: "en" | "zh-CN") {
  const faqItems = locale === "zh-CN" ? FAQ_ITEMS_ZH : FAQ_ITEMS;
  const prefix = locale === "en" ? "/en" : "";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        name: "RICOUI Video",
        url: `${SITE_URL}${prefix}`,
        description:
          "Remotion components for product demo videos: streaming AI answers, terminal sessions, device frames, captions, logo stings and full scenes.",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}#software`,
        name: "RICOUI Video",
        url: `${SITE_URL}${prefix}`,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        // The category list must match `GALLERY_CATEGORIES`. It previously named
        // lower thirds and transitions, both of which were removed from the
        // registry — structured data claiming components that cannot be installed.
        description: `A shadcn-style registry of ${GALLERY_COUNT} Remotion components for product demo videos — text reveals, captions, AI chat input, device frames, terminal sessions, logo stings and full scenes — installed with the shadcn CLI and copied into your project as code you own.`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        license: "https://opensource.org/license/mit",
        isAccessibleForFree: true,
        softwareRequirements: "Remotion, React, Node.js",
        author: { "@type": "Organization", name: "RICOUI Video" },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}#faq`,
        mainEntity: faqItems.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}#categories`,
        name: "RICOUI Video component categories",
        itemListElement: GALLERY_CATEGORIES.map(({ id, label }, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: label,
          url: `${SITE_URL}${prefix}/docs/${id}`,
        })),
      },
    ],
  };
}

export default async function Page() {
  const locale =
    (await headers()).get("x-ricoui-locale") === "en" ? "en" : "zh-CN";
  const jsonLd = getJsonLd(locale);
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
