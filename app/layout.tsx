import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono, Outfit } from "next/font/google";
import localFont from "next/font/local";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { OpenPanelComponent } from "@openpanel/nextjs";
import { cn } from "@/lib/utils";
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
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "./fonts/Saans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Saans-Medium.woff2", weight: "500", style: "normal" },
  ],
});

/**
 * Chillax (Fontshare, free for commercial use), self-hosted like the others so
 * paragraphs do not wait on a third-party CDN. Identified off a specimen by its
 * signatures: a tiny rounded counter in the A, a shallow rounded vertex on the
 * M, and fillets where strokes meet — Rubik and Poppins both miss all three.
 */
const chillax = localFont({
  variable: "--font-body",
  display: "swap",
  src: [
    { path: "./fonts/Chillax-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Chillax-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Chillax-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Chillax-700.woff2", weight: "700", style: "normal" },
  ],
});

/**
 * `preload: false` on everything below is deliberate and measured.
 *
 * next/font emits a blocking `<link rel="preload">` per weight on *every* page
 * that mounts this layout — 430KB of woff2 on the landing page, more than all of
 * its JS. None of these four faces paint a single glyph there. Without preload
 * they still load, on the pages that actually use them, at the moment a rule
 * asks for one. Saans and Chillax keep theirs: they are the h1 and the body copy
 * of the first screen.
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

const SITE_URL = "https://snapcn.dev";
const SITE_TITLE = "snap-cn — Cinematic video components for React";
const SITE_DESCRIPTION =
  "Production-ready Remotion animations, transitions and backgrounds. Install with the shadcn CLI and own the code.";

export const metadata: Metadata = {
  // Resolves the relative `/bg.jpg` below into an absolute URL for crawlers.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · snap-cn",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "snap-cn",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@SriNath693",
    creator: "@SriNath693",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        outfit.variable,
        caveat.variable,
        "font-sans",
        saans.variable,
        chillax.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <NuqsAdapter>
          <RootProvider
            theme={{
              defaultTheme: "system",
              enableSystem: true,
            }}
          >
            <ThemeShortcut />
            {children}
          </RootProvider>
        </NuqsAdapter>
        <OpenPanelComponent
          clientId={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID as string}
          apiUrl={process.env.NEXT_PUBLIC_OPENPANEL_API_URL}
          trackScreenViews
          trackAttributes
          trackOutgoingLinks
        />
      </body>
    </html>
  );
}
