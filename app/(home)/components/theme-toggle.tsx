"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Sun ⇄ moon as one disc with a bite taken out of it.
 *
 * A second circle rides inside a mask: parked off the canvas the disc is whole
 * (a sun), slid over the top-right corner it carves the disc into a crescent.
 * Nothing cross-fades, so there is never a frame with two icons half-visible in
 * it — the same mark just changes shape.
 *
 * Written here rather than pulled from a library: the mask is four numbers, and
 * the packaged versions of this effect ship attribution strings that would then
 * have to live in this file forever.
 */
const EASE = [0.4, 0, 0.2, 1] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();
  // Two toggles can be mounted at once (header and mobile sheet). A shared mask
  // id would have the second one clipping against the first one's mask.
  const mask = useId();

  // Avoid hydration mismatch — theme is only known on the client.
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const transition = reduced ? { duration: 0 } : { duration: 0.35, ease: EASE };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        !mounted
          ? "Toggle theme"
          : isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        // No plate on hover. The mark is the affordance — it swaps shape on
        // click — and a filled square appearing behind an 18px disc was heavier
        // than the thing it was highlighting. Feedback is the mark itself
        // lifting to full contrast.
        "size-11 text-foreground/70 hover:bg-transparent hover:text-foreground dark:hover:bg-transparent",
        className,
      )}
    >
      <svg
        viewBox="0 0 32 32"
        className="size-[2.25rem]"
        fill="currentColor"
        aria-hidden="true"
      >
        <mask id={mask}>
          <rect width="32" height="32" fill="#fff" />
          <motion.circle
            r="11"
            fill="#000"
            initial={false}
            animate={isDark ? { cx: 23, cy: 9 } : { cx: 44, cy: -10 }}
            transition={transition}
          />
        </mask>
        <motion.circle
          cx="16"
          cy="16"
          mask={`url(#${mask})`}
          initial={false}
          animate={{ r: isDark ? 11 : 9 }}
          transition={transition}
        />
      </svg>
    </Button>
  );
}
