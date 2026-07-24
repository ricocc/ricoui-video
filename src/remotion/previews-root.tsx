import { loadFont } from "@remotion/google-fonts/Geist";
import { AbsoluteFill, Composition, Img, registerRoot } from "remotion";
import { getDefaults } from "@/lib/customizer-config";
import { RENDERED_DEMOS } from "@/lib/rendered-demos";
import registry from "@/registry/__index__";

/**
 * Bundle root for `scripts/render-previews.mts`: one composition per slug in
 * `RENDERED_DEMOS`, rendered to the mp4 that the site plays in place of a live
 * `<Player>`.
 *
 * The whole point is that the file is *indistinguishable from what the Player
 * would have shown*, minus the stutter. So the stage below reproduces
 * `PreviewStage` exactly, and any drift between the two shows up on the site as
 * a demo that does not match its own component:
 *
 *  - **Props** — `getDefaults(config.controls)`, the same values `PreviewStage`
 *    starts from. Note the registry barrel has already folded in `SHARED_CONTROLS`
 *    and the `MIN_SPEED_ONE` overrides by the time we read the config, so the
 *    defaults here are the real ones, not the ones written in the config file.
 *  - **Backdrop** — the same full-bleed `previewBackdrop` fill `PreviewStage`
 *    paints behind the scene, because the preview surface is part of what the
 *    reader is judging.
 *  - **Font** — the site gets Geist from `next/font` as `--font-geist-sans`. A
 *    standalone Remotion bundle has no `next/font`, so load the real face and
 *    publish the same CSS variable the scenes reference. Without this the mp4
 *    silently falls back to Times, which is exactly the kind of difference that
 *    makes a demo worthless.
 *  - **Timing / size** — straight from the config, so the file's duration is one
 *    clean cycle. The `<video loop>` on the site handles repetition; baking a
 *    loop into the file would only make it bigger.
 */

const { fontFamily: GEIST } = loadFont();

function makeStage(slug: string) {
  const entry = registry[slug];
  const { Component, config } = entry;
  const props = getDefaults(config.controls);

  return function RenderedDemoStage() {
    const scene = <Component {...props} />;
    const backdrop = config.previewBackdrop;
    return (
      <AbsoluteFill
        style={{
          ["--font-geist-sans" as string]: GEIST,
          fontFamily: GEIST,
        }}
      >
        {backdrop &&
          (backdrop.type === "image" ? (
            <AbsoluteFill>
              <Img
                src={backdrop.src}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: backdrop.fit ?? "cover",
                }}
              />
            </AbsoluteFill>
          ) : (
            <AbsoluteFill style={{ background: backdrop.value }} />
          ))}
        {scene}
      </AbsoluteFill>
    );
  };
}

// Stable component identity per composition — building these inside render would
// remount the scene every frame.
const STAGES = Object.fromEntries(
  RENDERED_DEMOS.filter((slug) => registry[slug]).map((slug) => [
    slug,
    makeStage(slug),
  ]),
);

export function PreviewsRoot() {
  return (
    <>
      {Object.entries(STAGES).map(([slug, Stage]) => {
        const { config } = registry[slug];
        return (
          <Composition
            key={slug}
            id={slug}
            component={Stage}
            durationInFrames={config.durationInFrames}
            fps={config.fps}
            width={config.compositionWidth}
            height={config.compositionHeight}
          />
        );
      })}
    </>
  );
}

registerRoot(PreviewsRoot);
