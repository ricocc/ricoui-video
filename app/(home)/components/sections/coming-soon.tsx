import {
  ArrowRight,
  Blocks,
  Clapperboard,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeUp } from "../fade-up";

/**
 * What is next, as three fanned cards with the middle one raised.
 *
 * Nothing here is clickable: none of it exists yet, and a link that goes nowhere
 * is worse than a label that admits it. When one of these ships, give that card
 * an `href` and it becomes the obvious place to put it.
 *
 * Each card is one hue at three values — a flat ground, a darker mark, and a
 * pale ink — so the icon reads as a watermark pressed into the card rather than
 * a graphic sitting on it. The middle one is the brand blue, which is what keeps
 * the row attached to the rest of the site; the other two are a terracotta and a
 * plum, both chosen to sit on the cream page without fighting the accent.
 *
 * These three hues live here rather than in `globals.css` on purpose: they are
 * section decoration, not design-system tokens, and nothing else should reach
 * for them.
 */
const PLANNED = [
  {
    label: "Video templates",
    blurb: "Whole scenes, composed and ready to render.",
    Icon: Clapperboard,
    ground: "#D2542F",
    mark: "#B44224",
    ink: "#FBE3D9",
  },
  {
    label: "Video editor",
    blurb: "Arrange, retime and export in the browser.",
    Icon: SlidersHorizontal,
    ground: "#3577E0",
    mark: "#2A61BC",
    ink: "#DEE9FB",
  },
  {
    label: "Components",
    blurb: "More primitives, more screens, more motion.",
    Icon: Blocks,
    ground: "#6B4A9C",
    mark: "#573C80",
    ink: "#EADFF7",
  },
] as const;

export function ComingSoon() {
  return (
    <section id="next" className="relative pb-24 sm:pb-32">
      <div className="section">
        <FadeUp>
          {/* Left-aligned at the changelog's size — see the note there. The fan
              below stays a centred composition internally, but the group is
              anchored to the same left edge as every heading on the page. */}
          <h2 className="max-w-[14ch] text-pretty font-sans text-[clamp(2.25rem,4.6vw,3.5rem)] font-normal leading-[1.06] tracking-[-0.03em] text-foreground">
            Templates, an editor, and more components
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-body-lg text-current/70">
            The registry is the first piece. Video templates, a browser editor
            and a wider component set are on the way.
          </p>
        </FadeUp>

        <FadeUp delay={0.08}>
          {/* `items-end`: every card sits on the same baseline and the middle one
              grows *upward* out of it. Aligning the tops instead leaves three
              different bottom edges, which reads as a mistake rather than a fan. */}
          <div className="mt-12 flex h-[200px] max-w-5xl items-end justify-start gap-3 sm:mt-14 sm:h-[260px] sm:gap-4 lg:h-[310px]">
            {PLANNED.map(({ label, blurb, Icon, ground, mark, ink }, i) => {
              const middle = i === 1;
              return (
                <div
                  key={label}
                  style={{ backgroundColor: ground }}
                  className={cn(
                    // Top corners carry the rounding; the bottoms sit on a shared
                    // baseline where a big radius would read as three loose tiles
                    // rather than one row.
                    "relative isolate flex flex-col justify-end overflow-hidden rounded-t-[16px] rounded-b-lg p-3 sm:rounded-t-[26px] sm:p-6",
                    // Spaced rather than overlapped, so the middle card is the
                    // tall one instead of the one in front.
                    middle ? "h-full w-[36%]" : "h-[82%] w-[30%]",
                  )}
                >
                  {/* Oversized and cropped by the card, so it reads as a mark on
                      the surface. Lucide's stroke width is in viewBox units, so
                      it thickens with the icon — no weedy hairline at this size. */}
                  <Icon
                    aria-hidden
                    style={{ color: mark }}
                    className="-z-10 -right-[14%] -top-[10%] pointer-events-none absolute size-[78%]"
                  />
                  <p
                    style={{ color: ink }}
                    className="text-sm font-medium tracking-[-0.02em] sm:text-xl"
                  >
                    {label}
                  </p>
                  <p
                    style={{ color: ink }}
                    className="mt-1 hidden text-[0.8125rem] leading-snug opacity-70 sm:block"
                  >
                    {blurb}
                  </p>
                </div>
              );
            })}
          </div>
        </FadeUp>

        <FadeUp delay={0.14}>
          <p className="mt-8 flex items-center gap-2 text-sm font-medium text-foreground">
            Coming soon
            <ArrowRight className="size-4" aria-hidden="true" />
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
