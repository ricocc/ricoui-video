"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { ArrowRight, Pause, Play } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { AbsoluteFill, Img } from "remotion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EASE_OUT } from "@/config/site";
import { useTrackEvent } from "@/lib/analytics";
import registry from "@/registry/__index__";
import { FadeUp } from "../fade-up";
import { InstallAll } from "../install-all";
import { useAutoplay } from "../use-autoplay";

const HERO_COMPONENT = "terminal-simulator";

export function Hero() {
  const entry = registry[HERO_COMPONENT];
  const playerRef = useRef<PlayerRef>(null);
  const [playing, setPlaying] = useState(true);
  const trackEvent = useTrackEvent();

  useAutoplay(playerRef, Boolean(entry));

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (!player.isPlaying()) {
      player.play();
      setPlaying(true);
      trackEvent("preview_played", {
        component: HERO_COMPONENT,
        surface: "hero",
        trigger: "click",
      });
    } else {
      player.pause();
      setPlaying(false);
      trackEvent("preview_paused", {
        component: HERO_COMPONENT,
        surface: "hero",
      });
    }
  }, [trackEvent]);

  // Live registry preview over a full-bleed /bg.jpg backdrop.
  const Composition = useMemo(() => {
    const Inner = entry?.Component;
    if (!Inner) return null;
    return function HeroComposition(props: Record<string, unknown>) {
      return (
        <AbsoluteFill>
          <AbsoluteFill>
            <Img
              src="/bg.jpg"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
          <Inner {...props} />
        </AbsoluteFill>
      );
    };
  }, [entry]);

  const aspectRatio = entry
    ? `${entry.config.compositionWidth} / ${entry.config.compositionHeight}`
    : "16 / 9";

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-24">
      {/* Theme-aware backdrop: dotted grid that fades out + a soft top glow. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,var(--color-muted),transparent_70%)] opacity-70" />
      </div>

      <div className="section">
        <div className="flex flex-col items-center text-center">
          <FadeUp delay={0.06} className="flex flex-col items-center">
            <Badge
              variant="outline"
              className="mb-5 h-7 gap-1.5 rounded-full px-3 text-xs"
              render={
                <Link
                  href="/docs/captions"
                  onClick={() =>
                    trackEvent("cta_clicked", {
                      cta: "hero_ui_badge",
                      destination: "/docs/captions",
                    })
                  }
                />
              }
            >
              <span className="font-semibold text-foreground">New</span>
              <span aria-hidden className="text-muted-foreground/60">
                ·
              </span>
              <span className="text-muted-foreground">
                Introducing <span className="text-foreground">Captions</span>
              </span>
              <ArrowRight className="size-3" aria-hidden="true" />
            </Badge>
            <h1 className="max-w-3xl text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Cinematic video components,
              <br className="hidden sm:block" /> now copy-pasteable
            </h1>
          </FadeUp>

          <FadeUp delay={0.12}>
            <p className="mt-4 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              Production-ready Remotion animations, transitions and backgrounds.
              Install with the shadcn CLI and own every line of code.
            </p>
          </FadeUp>

          <FadeUp delay={0.18}>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-11 gap-2 rounded-lg px-6 text-sm"
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

      <div className="section">
        <FadeUp delay={0.24} className="relative mt-10 w-full sm:mt-12">
          <motion.div
            className="relative"
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ ...EASE_OUT, delay: 0.05 }}
          >
            <div
              className="group surface-card relative w-full overflow-hidden rounded-xl sm:rounded-2xl"
              style={{ aspectRatio }}
            >
              {entry && Composition ? (
                <Player
                  ref={playerRef}
                  component={Composition}
                  inputProps={{}}
                  durationInFrames={entry.config.durationInFrames}
                  fps={entry.config.fps}
                  compositionWidth={entry.config.compositionWidth}
                  compositionHeight={entry.config.compositionHeight}
                  style={{ width: "100%", height: "100%", display: "block" }}
                  loop
                  initiallyMuted
                  acknowledgeRemotionLicense
                />
              ) : null}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause preview" : "Play preview"}
                className="absolute inset-0 flex items-center justify-center bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <span
                  aria-hidden
                  data-show={!playing}
                  className="pointer-events-none flex size-14 items-center justify-center rounded-full bg-background/70 text-foreground opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none data-[show=true]:opacity-100"
                >
                  {playing ? (
                    <Pause className="size-5" />
                  ) : (
                    <Play className="size-5 translate-x-0.5" />
                  )}
                </span>
              </button>
            </div>
          </motion.div>
        </FadeUp>
      </div>
    </section>
  );
}
