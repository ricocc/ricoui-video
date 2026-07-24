"use client";

import type { ReactNode } from "react";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";

export function StickyHeaderShell({ children }: { children: ReactNode }) {
  const scrolled = useScroll();

  return (
    <header
      className={cn(
        "sticky inset-x-0 top-0 z-40 transition-[background-color,border-color,padding] duration-200 ease-out",
        scrolled
          ? "border-transparent bg-transparent py-3"
          : "border-border bg-background/70 backdrop-blur-xl",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between border px-4 transition-all duration-200 ease-out sm:px-6",
          scrolled
            ? "h-14 rounded-xl border-border bg-background/85 shadow-[0_1px_2px_rgb(16_24_40_/_0.05)] backdrop-blur-xl"
            : "h-16 border-transparent",
        )}
      >
        {children}
      </div>
    </header>
  );
}
