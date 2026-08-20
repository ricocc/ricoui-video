import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono, Outfit } from "next/font/google";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { LocaleProvider } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";
import { PostHogProvider } from "./posthog-provider";
import { SnapCnThemeBridge } from "./snap-cn-theme-bridge";
import { ThemeShortcut } from "./theme-shortcut";

/**
 * Saans, the face simplifyingai.com is set in — copied from that project rather
 * than re-derived, so the two sites stay one voice. (Serrif came over with it and
 * was never set on anything; it is gone.)
 *
 * These are the *site's* faces only. `--font-geist-sans` below is a separate
 * thing and must stay: the registry's scenes render through it, and a Remotion
 * bundle has none of this CSS, so a locally-hosted face would silently fall
 * back to Times in the mp4 (see the design-system skill, rule 4).
 */
const saans = localFont({
  variable: "--font-saans",
  display: "swap",
  src: [
    { path: "./fonts/Saans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Saans-Medium.woff2", weight: "500", style: "normal" },
  ],
});

/**
 * `preload: false` on everything below is deliberate and measured.
 *
 * next/font emits a blocking `<link rel="preload">` per weight on *every* page
 * that mounts this layout — 430KB of woff2 on the landing page, more than all of
 * its JS. None of these four faces paint a single glyph there. Without preload
 * they still load, on the pages that actually use them, at the moment a rule
 * asks for one. Saans keeps its preload: it is the whole first screen.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  // Scenes render through this; no site chrome is set in it.
  preload: false,
});

// Preloaded, unlike its siblings: the hero's install button is set in it.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// `--font-display`: docs headings, showcase and the video editor.
const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  preload: false,
});

// Handwritten face for the gallery sidebar's "new" scribble only.
const caveat = Caveat({
  variable: "--font-scribble",
  weight: "600",
  subsets: ["latin"],
  preload: false,
});

const SITE_URL = "https://video.ricoui.com";
/**
 * The title is the one line that has to carry the query. "Cinematic video
 * components for React" was accurate and unsearchable — it omitted both terms
 * anyone actually types, *Remotion* and *shadcn*. This is 61 characters, so it
 * survives a SERP intact.
 */
const SITE_TITLE = "RICOUI Video — Remotion components for software demos";
const SITE_DESCRIPTION =
  "Copy-paste Remotion components for building software demo videos. Streaming AI answers, terminals, device frames, captions, text animations and reusable scenes.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (
    (await headers()).get("x-ricoui-locale") === "en" ? "en" : "zh-CN"
  ) as Locale;
  const title =
    locale === "zh-CN"
      ? "RICOUI Video — 软件演示视频 Remotion 组件库"
      : SITE_TITLE;
  const description =
    locale === "zh-CN"
      ? "用于软件演示视频的 Remotion 可复制组件库。包含 AI 流式回复、终端、设备框架、字幕、文字动画和可复用视频场景。"
      : SITE_DESCRIPTION;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s · RICOUI Video" },
    description,
    alternates: { languages: { en: "/en", "zh-CN": "/" } },
    openGraph: {
      type: "website",
      url: locale === "zh-CN" ? SITE_URL : `${SITE_URL}/en`,
      siteName: "RICOUI Video",
      title,
      description,
      locale: locale === "zh-CN" ? "zh_CN" : "en_US",
      alternateLocale: locale === "zh-CN" ? ["en_US"] : ["zh_CN"],
      images: [{ url: "/og", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (
    (await headers()).get("x-ricoui-locale") === "en" ? "en" : "zh-CN"
  ) as Locale;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      // Tells Next to suspend `scroll-behavior: smooth` during route
      // transitions, so a navigation jumps to the top instead of animating.
      data-scroll-behavior="smooth"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        outfit.variable,
        caveat.variable,
        "font-sans",
        saans.variable,
      )}
    >
      <head>
        {locale === "zh-CN" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            <link
              href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100..900&display=swap"
              rel="stylesheet"
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <LocaleProvider locale={locale} messages={getMessages(locale)}>
          <PostHogProvider>
            <NuqsAdapter>
              <RootProvider
                theme={{ defaultTheme: "system", enableSystem: true }}
              >
                <ThemeShortcut />
                <SnapCnThemeBridge>{children}</SnapCnThemeBridge>
              </RootProvider>
            </NuqsAdapter>
          </PostHogProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
