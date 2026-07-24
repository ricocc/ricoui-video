import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono, Inter, Outfit } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { OpenPanelComponent } from "@openpanel/nextjs";
import { cn } from "@/lib/utils";
import { ThemeShortcut } from "./theme-shortcut";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

// Handwritten face for the gallery sidebar's "new" scribble only.
const caveat = Caveat({
  variable: "--font-scribble",
  weight: "600",
  subsets: ["latin"],
});

const SITE_URL = "https://snap-cn.dev";
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
        inter.variable,
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
