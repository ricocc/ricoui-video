"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/lib/analytics";
import { FadeUp } from "../fade-up";
import { InstallAll } from "../install-all";

export function Hero() {
  const trackEvent = useTrackEvent();

  return (
    <section className="relative overflow-hidden pt-14 pb-4 sm:pt-20 sm:pb-6">
      {/* Theme-aware backdrop: dotted grid that fades out + a soft top glow. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,var(--color-muted),transparent_70%)] opacity-70" />
      </div>

      <div className="section">
        <div className="flex flex-col items-start text-left">
          {/* simplifyingai.com's page-heading treatment, to the number: Saans at
              regular weight, `clamp(2.75rem, 6.5vw, 5.5rem)`, leading 1.05,
              tracking -0.03em. The size is fluid rather than stepped at a
              breakpoint, which is how that site scales all of its headings. */}
          <FadeUp delay={0.06}>
            <h1 className="max-w-[20ch] text-pretty font-sans text-[clamp(2.75rem,6.5vw,5.5rem)] font-normal leading-[1.05] tracking-[-0.03em] text-foreground">
              Cinematic video components, now copy-pasteable
            </h1>
          </FadeUp>

          {/* `text-body-lg` at 70% of the foreground rather than a separate
              grey. The face is Saans, inherited from `html` like everything. */}
          <FadeUp delay={0.12}>
            <p className="mt-6 max-w-xl text-pretty text-body-lg text-current/70">
              Production-ready Remotion animations, transitions and backgrounds.
              Install with the shadcn CLI and own every line of code.
            </p>
          </FadeUp>

          <FadeUp delay={0.18}>
            <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-11 gap-2 px-6 text-sm"
                nativeButton={false}
                render={
                  <Link
                    href="/docs/getting-started/introduction"
                    onClick={() =>
                      trackEvent("cta_clicked", {
                        cta: "hero_browse",
                        destination: "/docs/getting-started/introduction",
                      })
                    }
                  />
                }
              >
                Browse components
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <InstallAll />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
