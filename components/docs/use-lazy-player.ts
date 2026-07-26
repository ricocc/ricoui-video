"use client";

import type { PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState } from "react";
import { useAutoplay } from "@/app/(home)/components/use-autoplay";

/**
 * Shared lazy-mount wiring for card-grid Remotion previews.
 *
 * A gallery of 100+ cards can't mount a live `<Player>` per card eagerly — that
 * fires every composition's font/asset loads and render loop at once on page
 * load. This hook mounts a card's preview only once it nears the viewport
 * (`IntersectionObserver`, `rootMargin: "200px 0px"`), autoplays it via
 * `useAutoplay`, and pauses playback whenever the card scrolls back out of view,
 * so at most a handful of previews are ever actively rendering.
 *
 * "Preview" means either tier: a live `<Player>` *or* the `<video>` of a card
 * with a rendered demo. The play/pause below drives both — see the note on that
 * effect for why leaving the `<video>` to the browser is not good enough.
 *
 * Extracted verbatim from `component-card.tsx` so both the docs `ComponentCard`
 * and the gallery `GalleryCard` share one implementation — no copy-paste drift
 * on this load-bearing perf path.
 */
export function useLazyPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setMounted(true);
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        setVisible(observerEntry.isIntersecting);
        if (observerEntry.isIntersecting) setMounted(true);
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useAutoplay(playerRef, mounted);

  // Drive whichever preview the card actually rendered. A card with a rendered
  // demo has no `<Player>` at all — it is a plain `<video>` — so `playerRef` is
  // null there and this used to `return` before doing anything, leaving every
  // mp4 card's playback entirely to the browser.
  //
  // That is not safe to assume. Cards mount 200px *before* they scroll into view
  // (`rootMargin` below), so a `<video autoPlay>` is created off-screen, where
  // Chrome's muted-autoplay policy declines to start it — measured on this page:
  // `inView=false paused=true t=0 readyState=4`, fully downloaded and never
  // started. Whether it ever starts is then Chrome's call, and under Energy
  // Saver or on battery it may simply not, which leaves the card frozen on a
  // first frame that is usually blank.
  //
  // So say it explicitly. Redundant when the browser would have done it anyway,
  // decisive when it would not.
  useEffect(() => {
    if (!mounted) return;
    const player = playerRef.current;
    const video = containerRef.current?.querySelector("video");
    if (visible) {
      if (player && !player.isPlaying()) player.play();
      // `play()` rejects if the element is torn down mid-call; nothing to do.
      if (video?.paused) video.play().catch(() => {});
    } else {
      player?.pause();
      video?.pause();
    }
  }, [mounted, visible]);

  return { containerRef, playerRef, mounted, visible };
}
