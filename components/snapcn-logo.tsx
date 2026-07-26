import Image from "next/image";
import { cn } from "@/lib/utils";

const WIDTH = 464;
const HEIGHT = 409;

/**
 * The snap-cn mark, as a light/dark pair.
 *
 * The mark is a single flat colour on transparency, so it cannot be one file:
 * the dark mark vanishes on the dark theme and the white one vanishes on the
 * light theme. Both are rendered and CSS picks — which means no `useTheme()`,
 * no client boundary, and no flash of the wrong logo on first paint (a theme
 * read in React happens after hydration; this happens at first style).
 *
 * ponytail: two PNGs because the mark only exists as raster. Redraw it as an
 * SVG on `currentColor` and this collapses to one ~1KB file that is crisp at
 * every DPI and needs no pair at all.
 */
export function SnapCnLogo({ className }: { className?: string }) {
  const size = cn("h-7 w-auto", className);

  return (
    <>
      <Image
        src="/logo/snapcn.png"
        alt="snap-cn"
        width={WIDTH}
        height={HEIGHT}
        priority
        className={cn(size, "dark:hidden")}
      />
      {/* Decorative twin: the light copy above already carries the alt text, so
          announcing this one would read the logo out twice. */}
      <Image
        src="/logo/snapcn-white.png"
        alt=""
        aria-hidden
        width={WIDTH}
        height={HEIGHT}
        priority
        className={cn(size, "hidden dark:block")}
      />
    </>
  );
}
