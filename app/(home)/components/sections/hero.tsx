"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/lib/analytics";
import { FadeUp } from "../fade-up";
import { InstallAll } from "../install-all";

export function Hero() {
  const trackEvent = useTrackEvent();
  const { href, t } = useI18n();

  return (
    <section className="relative overflow-hidden pt-14 pb-4 sm:pt-20 sm:pb-6">
      {/* Theme-aware backdrop: dotted grid that fades out + a soft top glow. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,var(--color-muted),transparent_70%)] opacity-70" />
      </div>

      <div className="section">
        <div className="flex flex-col items-center text-center">
          {/* simplifyingai.com's page-heading treatment, to the number: Saans at
              regular weight, `clamp(2.75rem, 6.5vw, 5.5rem)`, leading 1.05,
              tracking -0.03em. The size is fluid rather than stepped at a
              breakpoint, which is how that site scales all of its headings. */}
          <FadeUp delay={0.06}>
            {/* This line used to read "Copy-paste Remotion components", chosen
                to compete head-on for the phrase our nearest competitor ranks
                for. That was the wrong fight, for a reason that only shows up
                when you look the competitor up: remocn predates us by ~4 months
                and has >1k stars. You do not out-rank an older, better-linked
                registry on its own phrase with a new domain — and to the part of
                the audience that has already seen it, an identical headline
                reads as a clone rather than an alternative. We lost the ranking
                and the credibility in one line.

                So the keywords move down rather than out. That is the same trade
                this file already made when "installed with the shadcn CLI" came
                off the h1: an h1 is a weak ranking signal next to the title tag
                and the body copy, and the sentence below carries "copy-paste",
                "Remotion" and "shadcn CLI" intact — every term the old headline
                held. What the h1 buys instead is the thing remocn cannot say:
                they are a general motion library, and we are the shots a
                *software* demo is made of.

                Keep this under ~32 characters. Past that it wraps to three rows
                of 5.5rem type, which is a headline you read rather than take in. */}
            <h1 className="mx-auto max-w-[16ch] text-pretty font-sans text-[clamp(2.75rem,6.5vw,5.5rem)] font-normal leading-[1.05] tracking-[-0.03em] text-foreground">
              {t("hero.title")}
            </h1>
          </FadeUp>

          {/* `text-body-lg` at 70% of the foreground rather than a separate
              grey. The face is Saans, inherited from `html` like everything. */}
          <FadeUp delay={0.12}>
            {/* Carries the search terms the h1 gave up — "copy-paste",
                "Remotion", "shadcn CLI" — and spends the rest of the sentence on
                the shot list, which is the part no other Remotion registry can
                claim. Naming the shots also does the demo's job for it: a reader
                who needs a terminal in a video recognises themselves here. */}
            <p className="mx-auto mt-6 max-w-xl text-pretty text-body-lg text-current/70">
              {t("hero.description")}
            </p>
          </FadeUp>

          <FadeUp delay={0.18}>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-11 gap-2 px-6 text-sm"
                nativeButton={false}
                render={
                  <Link
                    href={href("/docs/components")}
                    onClick={() =>
                      trackEvent("cta_clicked", {
                        cta: "hero_browse",
                        destination: "/docs/components",
                      })
                    }
                  />
                }
              >
                {t("hero.browse")}
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
