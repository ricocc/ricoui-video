"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { type ReactNode, useRef } from "react";
import { EASE_OUT } from "@/config/site";

export function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 24, filter: "blur(8px)" }
      }
      transition={{ ...EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
