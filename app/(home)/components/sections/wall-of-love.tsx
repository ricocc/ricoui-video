import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FadeUp } from "../fade-up";

/**
 * The wall of love, before there is a wall.
 *
 * There are no testimonials yet, so there are none on this page. Inventing three
 * smiling quotes would be the one thing on the site that is not true, and a wall
 * of real posts is worth waiting for. What ships now is the half that can be
 * honest: the ask, with the post already written.
 *
 * ## Why these are plain links
 *
 * `x.com/intent/tweet` is a URL, not an SDK. No widget script, no embed, no
 * client boundary — two `<a>`s and this whole section is server-rendered with
 * zero JavaScript of its own. It also degrades to exactly what the reader
 * expects: a middle-click opens a tab, a long-press offers "copy link".
 *
 * The composer opens pre-filled and fully editable — nothing is posted by
 * clicking these, X still needs its own send. That is why the button can say what
 * it does without a confirmation step behind it.
 */
const SITE_URL = "https://snapcn.dev";

const intent = (text: string) =>
  `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;

const POSTS = [
  {
    label: "Post about snap-cn",
    // Written in the reader's voice, not ours — they are the one posting it, and
    // a line of marketing copy in the first person is the thing people delete.
    text: `@snapcn: ready-made Remotion components for video, installed with the shadcn CLI. Copy the code, own it forever.`,
    primary: true,
  },
  {
    label: "Show what you built",
    text: `Made this with snap-cn 🎬

Remotion video components you install with the shadcn CLI:
${SITE_URL}`,
    primary: false,
  },
] as const;

export function WallOfLove() {
  return (
    // Bottom padding only, like every other section here: the showcase wall
    // above already carries its own `pb`, and adding a `pt` to meet it stacked
    // two gaps into one 176px hole.
    <section id="wall-of-love" className="relative pb-20 sm:pb-28">
      <div className="section">
        <FadeUp>
          {/* At the same size the changelog and the hero use — the size is what
              keeps this section on the same page as the two above it, and now
              the alignment matches them too. */}
          <h2 className="mx-auto max-w-[14ch] text-pretty text-center font-sans text-[clamp(2.25rem,4.6vw,3.5rem)] font-normal leading-[1.06] tracking-[-0.03em] text-foreground">
            Show us what you made
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-center text-body-lg text-current/70">
            Nothing here yet — this is where the posts will go. Put something on
            X and yours is the first one on the wall.
          </p>
        </FadeUp>

        <FadeUp delay={0.08}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {POSTS.map(({ label, text, primary }) => (
              <a
                key={label}
                href={intent(text)}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({
                    size: "lg",
                    variant: primary ? "default" : "outline",
                  }),
                  "h-11 w-full gap-2 px-6 text-sm sm:w-auto",
                )}
              >
                <XIcon className="size-4" />
                {label}
              </a>
            ))}
          </div>
        </FadeUp>

        <FadeUp delay={0.14}>
          <p className="mt-5 text-center text-sm text-current/50">
            Opens X with the post already written. Edit anything before you send
            it.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" role="img">
    <title>X</title>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
