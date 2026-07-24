"use client";

import type { PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState } from "react";
import { useAutoplay } from "@/app/(home)/components/use-autoplay";

/**
 * Shared lazy-mount wiring for card-grid Remotion previews.
 *
 * A gallery of 100+ cards can't mount a live `<Player>` per card eagerly — that
 * fires every composition's font/asset loads and render loop at once on page
 * load. This hook mounts a card's Player only once it nears the viewport
 * (`IntersectionObserver`, `rootMargin: "200px 0px"`), autoplays it via
 * `useAutoplay`, and pauses playback whenever the card scrolls back out of view,
 * so at most a handful of previews are ever actively rendering.
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

  useEffect(() => {
    if (!mounted) return;
    const player = playerRef.current;
    if (!player) return;
    if (visible) {
      if (!player.isPlaying()) player.play();
    } else {
      player.pause();
    }
  }, [mounted, visible]);

  return { containerRef, playerRef, mounted, visible };
}
