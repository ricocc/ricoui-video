"use client";

import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { type CSSProperties, useCallback, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Easing,
  getRemotionEnvironment,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily: SANS } = loadInter("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});

export interface HeroLaunchProps {
  /** Reveal caption under the cards. */
  heading?: string;
  /**
   * Left card media. An image URL, a video URL (`.mp4`/`.webm`/`.mov` → plays
   * via <OffthreadVideo>), or a CSS `linear-gradient(...)`. The video editor
   * swaps this for the viewer's own image/clip.
   */
  image1?: string;
  /** Right card media (same rules as `image1`). */
  image2?: string;
}

const BG = "#050505";
const PERSP = 1000;
// Pure rotateY about each card's INNER edge — no rotateX, so the inner edges
// stay vertical and the centre gap is a clean, even channel top-to-bottom.
const TILT = 17;
const GAP = 92;
const PLACEHOLDER = "linear-gradient(135deg,#2a2a2e,#0b0b0d)";

// Sample product-reveal clips (Next serves public/ at /). Each card plays a
// video via <OffthreadVideo>; the viewer swaps these for their own media.
const SHOWCASE = [
  "/showcase-videos/iphone-17-reveal.mp4",
  "/showcase-videos/airpods-pro.mp4",
];

const isVideo = (src: string) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src);
const isGradient = (src: string) => src.startsWith("linear-gradient");

// easeOutQuint — quick to move, silky to settle, lands exactly on target with
// no asymptotic "stuck" tail (the thing overdamped springs get wrong).
const OUT = Easing.bezier(0.22, 1, 0.36, 1);
// Gravity-ish accelerate for the drop-off.
const FALL = Easing.bezier(0.5, 0, 0.9, 0.4);

/**
 * A root-relative asset ("/showcase-assets/..") is served at the origin root by
 * Next in the Player, but a server render serves `public/` through
 * `staticFile()` — so rewrite local paths only while rendering, and pass
 * http(s)/data/blob URLs straight through.
 */
function resolveSrc(src: string): string {
  const isLocal = src.startsWith("/") && !src.startsWith("//");
  if (isLocal && getRemotionEnvironment().isRendering) {
    return staticFile(src.replace(/^\/+/, ""));
  }
  return src;
}

/**
 * Image that holds the server render until it has actually *loaded*, then
 * releases. Remotion's <Img> is avoided on purpose: it awaits `img.decode()`,
 * which the headless compositor rejects for some progressive JPEGs and hangs the
 * export. A plain <img> paints fine — we wait for `onload` ourselves and clear
 * on error too, so a bad source degrades gracefully. In the Player this is an
 * ordinary, instantly-shown image.
 */
function HeroImage({ src, style }: { src: string; style: CSSProperties }) {
  const [handle] = useState(() => delayRender(`hero image: ${src}`));
  const release = useCallback(() => continueRender(handle), [handle]);
  return (
    // biome-ignore lint/performance/noImgElement: Remotion frame, not a Next route.
    <img
      src={resolveSrc(src)}
      alt=""
      style={style}
      onLoad={release}
      onError={release}
    />
  );
}

/** Fills a card edge-to-edge with an image, a video, or a gradient. */
function CardMedia({ src }: { src: string }) {
  const media: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };
  const effective = src || PLACEHOLDER;
  if (isGradient(effective)) {
    return <div style={{ ...media, background: effective }} />;
  }
  if (isVideo(effective)) {
    return <OffthreadVideo src={resolveSrc(effective)} muted style={media} />;
  }
  return <HeroImage src={effective} style={media} />;
}

/**
 * Cinematic product-launch hero — deterministic Remotion composition
 * (1280×720 @30fps). Two image cards, one continuous professionally-eased
 * motion, no bounce:
 *
 *   f0–40    the left image HOLDS full-screen, flat and clear
 *   f40      it recedes to its floating size and angles in about its inner edge
 *   f60      the right image slides in from the right; the two sit SYMMETRIC
 *            about the frame centre with an even, centred gap
 *   f100     both breathe with a barely-there float (never dead-static)
 *   f122     they fall off the lower edge together
 *   f126     the headline reveals and eases forward ("comes to front")
 *
 * Left/right/bottom edges dissolve into black. `image1`/`image2` + `heading`
 * are the props the video editor drives.
 */
export function HeroLaunch({
  heading = "npx shadcn add @snap-cn",
  image1 = SHOWCASE[0],
  image2 = SHOWCASE[1],
}: HeroLaunchProps) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = height / 720;

  const cardW = 1000 * s;
  const cardH = 620 * s;
  const centerLeft = (width - cardW) / 2;
  const cardTop = 0.3 * height;
  // Symmetric about the centre → the gap sits exactly on the frame's midline.
  const restOffset = (cardW + GAP * s) / 2;
  const leftXFinal = -restOffset;
  const rightXFinal = restOffset;
  const rightXStart = 1.08 * width;
  const groupYFinal = 0.16 * height;

  // A clamped, eased 0→1 segment — the single motion primitive for the whole
  // scene. Easing lands cleanly on the target, so nothing ever "sticks".
  const seg = (start: number, dur: number, easing = OUT) =>
    interpolate(frame, [start, start + dur], [0, 1], {
      easing,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const recede = seg(40, 30); // full-screen → floating
  const angle = seg(46, 36); // flat → angled (rotateY only)
  const slideL = seg(46, 36); // centre → left rest
  const slideR = seg(60, 40); // offscreen right → right rest
  const drop = seg(122, 34, FALL); // settle → fall off bottom
  const title = seg(126, 40); // headline reveal + forward

  const leftScale = interpolate(recede, [0, 1], [1.5, 1]);
  const leftX = interpolate(slideL, [0, 1], [0, leftXFinal]);
  const leftDeg = interpolate(angle, [0, 1], [0, -TILT]);
  const leftOpacity = interpolate(frame, [2, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rightX = interpolate(slideR, [0, 1], [rightXStart, rightXFinal]);
  const rightOpacity = interpolate(slideR, [0, 0.35], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Barely-there float once settled (fades out into the drop) so the held beat
  // reads as alive, not frozen — the classic "why does it feel stuck" fix.
  const floatEnv = seg(94, 22) * (1 - drop);
  const floatY = Math.sin(frame * 0.09) * 3.5 * s * floatEnv;
  const groupY = interpolate(drop, [0, 1], [0, groupYFinal]) + floatY;

  const titleY = interpolate(title, [0, 1], [40 * s, 0]);
  const titleScale = interpolate(title, [0, 1], [0.82, 1]);
  const titleBlur = interpolate(title, [0, 1], [10, 0]);

  const vignette = seg(50, 40, Easing.linear);

  const cardBox = (x: number, opacity: number): CSSProperties => ({
    position: "absolute",
    left: centerLeft,
    top: cardTop,
    width: cardW,
    height: cardH,
    opacity,
    transform: `translateX(${x}px)`,
  });

  // Opening zoom pivots on the centre; the tilt pivots on the inner edge.
  const zoom = (scale: number): CSSProperties => ({
    width: "100%",
    height: "100%",
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  });
  const tilt = (deg: number, origin: string): CSSProperties => ({
    width: "100%",
    height: "100%",
    transform: `perspective(${PERSP * s}px) rotateY(${deg}deg)`,
    transformOrigin: origin,
  });
  const fade = (gradient: string): CSSProperties => ({
    position: "absolute",
    inset: 0,
    background: gradient,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: SANS }}>
      <AbsoluteFill style={{ transform: `translateY(${groupY}px)` }}>
        <div style={cardBox(leftX, leftOpacity)}>
          <div style={zoom(leftScale)}>
            {/* inner edge = right edge → pivot at 100% 50% */}
            <div style={tilt(leftDeg, "100% 50%")}>
              <ImageCard s={s} src={image1} />
            </div>
          </div>
        </div>
        <div style={cardBox(rightX, rightOpacity)}>
          {/* inner edge = left edge → pivot at 0% 50% */}
          <div style={tilt(TILT, "0% 50%")}>
            <ImageCard s={s} src={image2} />
          </div>
        </div>
      </AbsoluteFill>

      {/* Wide, clean edge dissolve — fades in after the full-screen opening. */}
      <AbsoluteFill style={{ opacity: vignette, pointerEvents: "none" }}>
        <div
          style={fade(`linear-gradient(to left, ${BG} 0%, transparent 30%)`)}
        />
        <div
          style={fade(`linear-gradient(to right, ${BG} 0%, transparent 22%)`)}
        />
        <div
          style={fade(`linear-gradient(to top, ${BG} 0%, transparent 30%)`)}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0.22 * height,
          padding: `0 ${40 * s}px`,
          textAlign: "center",
          color: "#fff",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          fontSize: 42 * s,
          opacity: title,
          filter: `blur(${titleBlur}px)`,
          transform: `translateY(${titleY}px) scale(${titleScale})`,
        }}
      >
        {heading}
      </div>
    </AbsoluteFill>
  );
}

/** A single card: one image (or video/gradient) filling it edge-to-edge. */
function ImageCard({ s, src }: { s: number; src: string }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: 30 * s,
        background: "#0b0b0d",
        // Drop shadow + a subtle inset hairline ring so the edge reads on both
        // dark and bright media without dominating.
        boxShadow: `0 ${20 * s}px ${52 * s}px -${28 * s}px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,255,255,0.22)`,
      }}
    >
      <CardMedia src={src} />
      {/* subtle depth: darken the lower edge + a hairline top sheen */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 32%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 26 * s,
          right: 26 * s,
          top: 0,
          height: 1,
          background:
            "linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)",
        }}
      />
    </div>
  );
}
