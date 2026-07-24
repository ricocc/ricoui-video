"use client";

import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import {
  AbsoluteFill,
  getRemotionEnvironment,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const { fontFamily: FONT_FAMILY } = loadSans("normal", {
  weights: ["400", "500", "700", "800"],
  subsets: ["latin"],
});

export interface Follower {
  name: string;
}

export interface FollowerRushProps {
  totalFollowers?: number;
  followers?: Follower[];
  accentColor?: string;
  theme?: "light" | "dark";
  orientation?: "horizontal" | "vertical";
  speed?: number;
}

interface Theme {
  bg: string;
  fg: string;
  fgMuted: string;
}

// Hex mirrors the shadcn design-system tokens (background/foreground/
// mutedForeground) so the pile-up drops into a shadcn project unchanged.
const THEMES: Record<"light" | "dark", Theme> = {
  light: { bg: "#FFFFFF", fg: "#101828", fgMuted: "#667085" },
  dark: { bg: "#141417", fg: "#FAFAFA", fgMuted: "#A1A1AA" },
};

/**
 * The crowd of names shown in the pile and named in the callout. Purely
 * flavour — swap it via the `followers` prop. Each avatar is a deterministic
 * gradient monogram derived from the name, so the scene renders with no network,
 * no CORS, and no missing-photo placeholders.
 */
export const SAMPLE_FOLLOWERS: Follower[] = [
  "Manon",
  "Melon",
  "Victor",
  "Shane",
  "Lisa",
  "Natasha",
  "Annie",
  "Abdull",
  "Kratos",
  "Jhone",
  "Matt",
  "Huggy",
  "Felomi",
  "Hazar",
  "Mikasa",
  "Silmon",
  "Luciano",
  "Nova",
  "Priya",
  "Theo",
  "Amelia",
  "Rafael",
  "Sofia",
  "Kai",
  "Jordan",
  "Nora",
  "Dana",
  "Milo",
  "Yuki",
  "Bruno",
  "Elena",
  "Omar",
  "Ivy",
  "Leo",
  "Zara",
  "Finn",
  "Maya",
  "Cole",
].map((name) => ({ name }));

// --- Pure helpers (unit-tested) -------------------------------------------

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function smoothstep(x: number): number {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** FNV-1a hash → a stable number per string. */
function hashName(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/**
 * The running follower total at effective frame `fc`. Holds at 1 through the
 * inline intro; then grows *linearly* to a full pile (`midCount`) by `midF`;
 * then *explodes exponentially* to `target`, landing on it at `endF`. This is
 * the reference's shape — a believable trickle, then a blow-up. Rounded and
 * clamped to `[1, target]`.
 */
export function followerCount(
  fc: number,
  target: number,
  startF: number,
  midF: number,
  endF: number,
  midCount: number,
): number {
  if (fc <= startF) return 1;
  if (fc <= midF) {
    const p = (fc - startF) / (midF - startF);
    return Math.min(target, Math.max(1, Math.round(1 + p * (midCount - 1))));
  }
  const p = clamp01((fc - midF) / (endF - midF));
  const c = midCount * (target / midCount) ** p;
  return Math.min(target, Math.round(c));
}

// --- Sub-components --------------------------------------------------------

/** The X verified seal — the shape is the reference's, the fill is the theme
 *  accent (design-system rule: take the shape, leave the brand's paint). */
function VerifiedBadge({ accent, size }: { accent: string; size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 22 22"
      width={size}
      height={size}
      fill={accent}
      style={{ flexShrink: 0, display: "block" }}
    >
      <title>Verified</title>
      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
    </svg>
  );
}

/** The "new follower" silhouette that leads the pile before the wave takes over. */
function PersonIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      style={{ display: "block" }}
    >
      <title>New follower</title>
      <circle cx="12" cy="7.2" r="4" />
      <path d="M12 13.4c-4.05 0-7.2 2.3-7.2 5.6 0 .55.45 1 1 1h12.4c.55 0 1-.45 1-1 0-3.3-3.15-5.6-7.2-5.6z" />
    </svg>
  );
}

/** A deterministic gradient-monogram avatar keyed off the follower's name — a
 *  page-coloured ring separates it from its neighbours in the pile. */
function Avatar({
  follower,
  size,
  ring,
  theme,
}: {
  follower: Follower;
  size: number;
  ring: number;
  theme: Theme;
}) {
  const h = hashName(follower.name);
  const hue = h % 360;
  const hue2 = (hue + 34 + ((h >> 9) % 46)) % 360;
  const sat = 60 + ((h >> 3) % 18);
  const angle = (h >> 5) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        background: `linear-gradient(${angle}deg, hsl(${hue} ${sat}% 62%), hsl(${hue2} ${sat}% 46%))`,
        // Ring in the page colour, drawn as box-shadow so it doesn't grow the
        // layout box — the overlap pitch stays exact.
        boxShadow: `0 0 0 ${ring}px ${theme.bg}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.96)",
        fontFamily: FONT_FAMILY,
        fontWeight: 700,
        fontSize: size * 0.4,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {follower.name.charAt(0).toUpperCase()}
    </div>
  );
}

/** The bold-name + badge + "…followed you" callout under the pile. */
function FollowLine({
  name,
  others,
  fontSize,
  theme,
  accent,
}: {
  name: string;
  others: number;
  fontSize: number;
  theme: Theme;
  accent: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: fontSize * 0.24,
        whiteSpace: "nowrap",
        fontFamily: FONT_FAMILY,
        fontSize,
        lineHeight: 1,
      }}
    >
      <span
        style={{ fontWeight: 800, color: theme.fg, letterSpacing: "-0.01em" }}
      >
        {name}
      </span>
      <VerifiedBadge accent={accent} size={fontSize * 0.62} />
      <span style={{ fontWeight: 500, color: theme.fgMuted }}>
        {others <= 0
          ? "followed you"
          : `and ${others.toLocaleString("en-US")} others followed you`}
      </span>
    </div>
  );
}

// --- Main composition ------------------------------------------------------

export function FollowerRush({
  totalFollowers = 5000,
  followers = SAMPLE_FOLLOWERS,
  accentColor = "#266DF0",
  theme = "light",
  orientation = "horizontal",
  speed = 1,
}: FollowerRushProps) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = THEMES[theme] ?? THEMES.light;
  const pool = followers.length > 0 ? followers : SAMPLE_FOLLOWERS;
  const isVertical = orientation === "vertical";

  const refW = isVertical ? 720 : 1280;
  const refH = isVertical ? 1280 : 720;
  const stageScale = Math.min(width / refW, height / refH);
  const fc = frame * speed;

  // --- timeline (effective frames, fps 30) ---
  const APPEAR = 8;
  const INLINE_END = 20; // single "X followed you" notification holds until here
  const MORPH_END = 34; // …then lifts into the stacked pile
  const GROW_END = 150; // pile fills to MAX; wave + scroll begin
  const EXPLODE_END = 214; // count lands on the target; row has fully bent to a wave

  const MAX = 22; // most avatars ever shown at once

  // `totalFollowers` is the headline "others" number, so the running total that
  // drives the pile is one more (the lead + the others).
  const others = Math.max(0, Math.round(totalFollowers));
  const target = others + 1;
  const count = followerCount(
    fc,
    target,
    INLINE_END,
    GROW_END,
    EXPLODE_END,
    MAX,
  );
  const shownOthers = count - 1;

  // --- layout constants (reference stage px) ---
  const D = isVertical ? 60 : 66; // avatar diameter
  const ring = isVertical ? 3 : 4;
  const pilePitch = D * 0.76; // overlap in the flat pile
  const iconSize = D * 0.92;
  const iconGap = D * 0.24;
  const rowY = isVertical ? refH * 0.4 : 316; // avatar row centre (stacked)
  const textY = isVertical ? refH * 0.52 : 452; // follow-line centre (stacked)
  const inlineY = refH / 2;
  const fontSize = isVertical ? 40 : 48;

  // --- phase progresses ---
  const globalFade = interpolate(fc, [0, APPEAR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stackP = smoothstep((fc - INLINE_END) / (MORPH_END - INLINE_END));
  // The inline notification clears first; the stacked callout appears after, so
  // the two "…followed you" lines never overlap during the morph.
  const inlineOut = smoothstep((fc - INLINE_END) / 7);
  const textIn = smoothstep((fc - (INLINE_END + 7)) / (MORPH_END - INLINE_END));
  const sp = smoothstep((fc - GROW_END) / (EXPLODE_END - GROW_END)); // flat→wave
  const iconOpacity = interpolate(fc, [GROW_END - 6, GROW_END + 36], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Lead (bold) name cycles ~2.3×/s while followers rush in, then freezes on the
  // last one so the held wave doesn't flicker names forever.
  const NAME_SLOT = 13;
  const nameFreeze = Math.floor((EXPLODE_END - INLINE_END) / NAME_SLOT);
  const nameIdx =
    fc < INLINE_END
      ? 0
      : Math.min(Math.floor((fc - INLINE_END) / NAME_SLOT), nameFreeze);
  const leadName = pool[nameIdx % pool.length].name;

  // --- wave / pile geometry ---
  const waveMargin = isVertical ? 44 : 74;
  const waveLeft = waveMargin;
  const waveSpan = refW - waveMargin * 2;
  const waveP = waveSpan / (MAX - 1);
  const waveAmp = (isVertical ? 40 : 46) * sp;
  const WAVE_FREQ = 1.55; // periods across the strip
  const wavePhase = fc * 0.05; // the wave travels
  const scrollPx = Math.max(0, fc - GROW_END) * (isVertical ? 0.6 : 0.85);
  const scrollUnit = Math.floor(scrollPx / waveP);

  // Flat pile: icon + avatars, centred as one group. Width grows smoothly with
  // the (un-rounded) count so adding an avatar doesn't jolt the centring.
  const pileCountF = Math.min(
    MAX,
    fc <= INLINE_END
      ? 1
      : fc <= GROW_END
        ? 1 + ((fc - INLINE_END) / (GROW_END - INLINE_END)) * (MAX - 1)
        : MAX,
  );
  const pileW = (pileCountF - 1) * pilePitch + D;
  const groupW = iconSize + iconGap + pileW;
  const groupLeft = (refW - groupW) / 2;
  const pileStartCX = groupLeft + iconSize + iconGap + D / 2;
  const iconCX = groupLeft + iconSize / 2;

  const isRendering = getRemotionEnvironment().isRendering;
  const willChange = isRendering ? undefined : ("transform" as const);

  const SLOTS = MAX + 2; // two extra so the scroll never opens an edge gap

  return (
    <AbsoluteFill style={{ background: t.bg }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: refW,
          height: refH,
          transform: `translate(-50%, -50%) scale(${stageScale})`,
          opacity: globalFade,
        }}
      >
        {/* ---- Inline first notification: [icon][avatar] Name ✓ followed you.
             Fades up and out as the pile takes over. */}
        {inlineOut < 1 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: iconGap,
              opacity: 1 - inlineOut,
              transform: `translateY(${lerp(0, -18, inlineOut)}px)`,
              willChange,
            }}
          >
            <PersonIcon color={accentColor} size={iconSize} />
            <Avatar follower={pool[0]} size={D} ring={ring} theme={t} />
            <div style={{ marginLeft: iconGap * 0.6 }}>
              <FollowLine
                name={pool[0].name}
                others={0}
                fontSize={fontSize}
                theme={t}
                accent={accentColor}
              />
            </div>
          </div>
        )}

        {/* ---- Person icon leading the flat pile (fades out as the wave forms) */}
        {iconOpacity > 0 && sp < 1 && (
          <div
            style={{
              position: "absolute",
              left: iconCX,
              top: lerp(inlineY, rowY, stackP),
              transform: `translate(-50%, -50%) scale(${1 - sp})`,
              opacity: iconOpacity * stackP,
            }}
          >
            <PersonIcon color={accentColor} size={iconSize} />
          </div>
        )}

        {/* ---- The avatar crowd: a flat overlapping pile that bends into a
             travelling wave. A single edge mask fades the wave's ends; the
             centred pile never reaches the edges, so it is untouched. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: stackP,
            WebkitMaskImage: `linear-gradient(to right, transparent 0%, #000 ${(waveMargin / refW) * 100 + 1}%, #000 ${100 - (waveMargin / refW) * 100 - 1}%, transparent 100%)`,
            maskImage: `linear-gradient(to right, transparent 0%, #000 ${(waveMargin / refW) * 100 + 1}%, #000 ${100 - (waveMargin / refW) * 100 - 1}%, transparent 100%)`,
          }}
        >
          {Array.from({ length: SLOTS }, (_, i) => {
            const follower = pool[(i + scrollUnit) % pool.length];
            // pile position (flat, centred) → wave position (full width, sine)
            const pileCX = pileStartCX + i * pilePitch;
            const waveCX = waveLeft + i * waveP - (scrollPx % waveP);
            const cx = lerp(pileCX, waveCX, sp);
            const pileCY = lerp(inlineY, rowY, stackP);
            const waveCY =
              rowY +
              waveAmp *
                Math.sin((cx / refW) * Math.PI * 2 * WAVE_FREQ + wavePhase);
            const cy = lerp(pileCY, waveCY, sp);

            // pile avatars pop in as the count reaches them; the two extra
            // scroll slots only exist once the wave is spread out.
            const popIn = smoothstep(clamp01(count - i));
            const baseOpacity = i < MAX ? popIn : 0;
            const opacity = lerp(baseOpacity, 1, sp);
            if (opacity <= 0.001) return null;
            const popScale = lerp(0.55, 1, popIn);

            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: slots are positional; the follower shown in a slot changes as the crowd scrolls, so keying by follower would remount every frame.
                key={i}
                style={{
                  position: "absolute",
                  left: cx,
                  top: cy,
                  transform: `translate(-50%, -50%) scale(${lerp(popScale, 1, sp)})`,
                  opacity,
                  zIndex: SLOTS - i, // leftmost on top
                  willChange,
                }}
              >
                <Avatar follower={follower} size={D} ring={ring} theme={t} />
              </div>
            );
          })}
        </div>

        {/* ---- Follow-line callout (stacked), centred under the pile/wave. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: textY,
            display: "flex",
            justifyContent: "center",
            transform: `translateY(-50%) translateY(${lerp(12, 0, textIn)}px)`,
            opacity: textIn,
            textRendering: "geometricPrecision",
            willChange,
          }}
        >
          <FollowLine
            name={leadName}
            others={shownOthers}
            fontSize={fontSize}
            theme={t}
            accent={accentColor}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
}
