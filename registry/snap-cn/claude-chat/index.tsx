"use client";

import { loadFont as loadHeadingFont } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadBodyFont } from "@remotion/google-fonts/Inter";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Caret } from "@/components/snap-cn/caret";
import { useTypewriter } from "@/lib/snap-cn-ui";
import { PulsingBorder } from "@/registry/snap-cn/pulsing-border";

const { fontFamily: SANS_FAMILY } = loadBodyFont("normal", {
  weights: ["400", "500"],
  subsets: ["latin"],
});
const { fontFamily: SERIF_FAMILY } = loadHeadingFont("normal", {
  weights: ["500"],
  subsets: ["latin"],
});

export interface ClaudeChatProps {
  greeting?: string;
  placeholder?: string;
  prompt?: string;
  response?: string;
  modelName?: string;
  modelTier?: string;
  accentColor?: string;
  showFrame?: boolean;
  speed?: number;
}

interface Theme {
  page: string;
  cardBg: string;
  cardBorder: string;
  fg: string;
  fgMuted: string;
  placeholder: string;
  iconBtnBorder: string;
  bubbleBg: string;
  windowBorder: string;
  windowShadow: string;
}

export const THEMES: Record<"light" | "dark", Theme> = {
  light: {
    page: "#F5F4EF",
    cardBg: "#FFFFFF",
    cardBorder: "#E8E5DD",
    fg: "#1F1E1D",
    fgMuted: "#73726C",
    placeholder: "#A3A097",
    iconBtnBorder: "#E0DDD4",
    bubbleBg: "#F0EEE6",
    windowBorder: "#E4E7EC",
    windowShadow:
      "0 1px 2px rgba(16,24,40,0.05), 0 16px 40px -20px rgba(16,24,40,0.14)",
  },
  dark: {
    page: "#262624",
    cardBg: "#1F1E1D",
    cardBorder: "#3A3936",
    fg: "#F0EEE6",
    fgMuted: "#9B9892",
    placeholder: "#73726C",
    iconBtnBorder: "#3A3936",
    bubbleBg: "#33322F",
    windowBorder: "#26272B",
    windowShadow:
      "0 1px 2px rgba(0,0,0,0.4), 0 16px 40px -20px rgba(0,0,0,0.5)",
  },
};

export const DEFAULT_PROMPT = "Draft a refund policy for Acme's annual plan";

export const DEFAULT_RESPONSE =
  "Here's a draft refund policy for Acme's annual plan:\n\nFull refund within 30 days of purchase, no questions asked. After day 30, refunds are prorated for the unused months of the term. Requests go to billing@acme.com and are processed within 5 business days.";

export const TYPING_START_FRAME = 42;

export const TYPING_CPS = 22;

export const SEND_FRAME = 116;

export const RESPONSE_START_FRAME = 140;

export const RESPONSE_CPS = 90;

export function morphProgressAt(
  frame: number,
  opts: { startFrame?: number; fps: number; speed: number },
): number {
  const startFrame = opts.startFrame ?? TYPING_START_FRAME;
  const value = spring({
    fps: opts.fps,
    frame: frame * opts.speed - startFrame,
    config: { damping: 14, stiffness: 200, mass: 0.6 },
  });
  return Math.max(0, Math.min(value, 1));
}

/**
 * Waveform-to-send morph over the whole timeline: springs to 1 when the
 * prompt starts typing, springs back to 0 the moment the prompt is sent
 * and the input empties again.
 */
export function sendMorphAt(
  frame: number,
  opts: { fps: number; speed: number },
): number {
  const morphIn = morphProgressAt(frame, {
    ...opts,
    startFrame: TYPING_START_FRAME,
  });
  const morphOut = morphProgressAt(frame, { ...opts, startFrame: SEND_FRAME });
  return Math.max(0, Math.min(morphIn - morphOut, 1));
}

export function introBounceIn(
  frame: number,
  fps: number,
): { translateY: number; scale: number } {
  const s = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 110, mass: 0.7 },
  });
  const translateY = interpolate(s, [0, 1], [28, 0]);
  const scale = interpolate(s, [0, 1], [0.97, 1]);
  return { translateY, scale };
}

export function fadeUpAt(
  frame: number,
  range: [number, number],
): { opacity: number; translateY: number } {
  const opts = {
    extrapolateLeft: "clamp" as const,
    extrapolateRight: "clamp" as const,
  };
  return {
    opacity: interpolate(frame, range, [0, 1], opts),
    translateY: interpolate(frame, range, [12, 0], opts),
  };
}

function Sunburst({ size, color }: { size: number; color: string }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <title>Claude</title>
      {rays.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line
            key={angle}
            x1={12 + 3.2 * Math.cos(rad)}
            y1={12 + 3.2 * Math.sin(rad)}
            x2={12 + 10 * Math.cos(rad)}
            y2={12 + 10 * Math.sin(rad)}
            stroke={color}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function ChevronDown({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <title>Expand</title>
      <path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <title>Add</title>
      <path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function MicIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <title>Voice input</title>
      <rect
        x={9}
        y={3}
        width={6}
        height={11}
        rx={3}
        stroke={color}
        strokeWidth={1.8}
      />
      <path
        d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21M9 21h6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WaveformIcon({ size, color }: { size: number; color: string }) {
  const bars = [
    { x: 4, h: 8 },
    { x: 9, h: 16 },
    { x: 14, h: 12 },
    { x: 19, h: 20 },
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <title>Voice</title>
      {bars.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x - 1}
          y={(24 - bar.h) / 2}
          width={2.4}
          height={bar.h}
          rx={1.2}
          fill={color}
        />
      ))}
    </svg>
  );
}

function SendIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <title>Send</title>
      <path
        d="M12 19V5M12 5l-6 6M12 5l6 6"
        stroke="#FFFFFF"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconButton({
  size,
  border,
  children,
}: {
  size: number;
  border: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "100%",
        border: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

export function ClaudeChat({
  greeting = "Afternoon, Dana",
  placeholder = "How can I help you today?",
  prompt = DEFAULT_PROMPT,
  response = DEFAULT_RESPONSE,
  modelName = "Opus 4.8",
  modelTier = "Max",
  accentColor = "#D97757",
  showFrame = true,
  speed = 1,
}: ClaudeChatProps) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = THEMES.light;

  const refW = 1280;
  const refH = 720;
  const stageScale = Math.min(width / refW, height / refH);
  const e = frame * speed;

  const tw = useTypewriter(prompt, {
    cps: TYPING_CPS,
    speed,
    startFrame: TYPING_START_FRAME,
  });
  const sent = e >= SEND_FRAME;
  const visibleText = sent ? "" : tw.text;
  const showText = visibleText.length > 0;
  const morph = sendMorphAt(frame, { fps, speed });

  const res = useTypewriter(response, {
    cps: RESPONSE_CPS,
    speed,
    startFrame: RESPONSE_START_FRAME,
  });
  const responseParagraphs = res.text.split("\n\n");
  const thinking = sent && res.count === 0;
  const thinkPulse =
    0.45 + 0.55 * Math.abs(Math.sin(((e - SEND_FRAME) / fps) * Math.PI * 1.4));

  const responseDoneFrame =
    RESPONSE_START_FRAME + Math.ceil((response.length / RESPONSE_CPS) * fps);

  const intro = introBounceIn(e, fps);
  const windowFade = fadeUpAt(e, [0, 14]);
  const greetingFade = fadeUpAt(e, [8, 26]);
  const bubbleFade = fadeUpAt(e, [SEND_FRAME, SEND_FRAME + 12]);
  const responseFade = fadeUpAt(e, [SEND_FRAME + 8, SEND_FRAME + 20]);

  const windowW = 920;
  const windowH = 600;
  const windowLeft = (refW - windowW) / 2;
  const windowTop = (refH - windowH) / 2;
  const cardWidth = 840;
  const cardLeft = (windowW - cardWidth) / 2;
  const iconBtnSize = 36;
  const morphSize = 40;

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      {showFrame ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity:
              interpolate(e, [SEND_FRAME - 4, SEND_FRAME + 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }) *
              interpolate(
                e,
                [responseDoneFrame + 8, responseDoneFrame + 32],
                [1, 0],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
          }}
        >
          <PulsingBorder speed={0.6 * speed} />
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: refW,
          height: refH,
          transform: `translate(-50%, -50%) scale(${stageScale})`,
        }}
      >
        {/* App window — outer chrome uses snap-cn tokens */}
        <div
          style={{
            position: "absolute",
            left: windowLeft,
            top: windowTop,
            width: windowW,
            height: windowH,
            background: t.page,
            border: `1px solid ${t.windowBorder}`,
            borderRadius: 10,
            boxShadow: t.windowShadow,
            overflow: "hidden",
            opacity: windowFade.opacity,
            translate: `0px ${windowFade.translateY + intro.translateY}px`,
            scale: String(intro.scale),
          }}
        >
          {/* Greeting — fades out when the prompt is sent */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 158,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              opacity:
                greetingFade.opacity *
                interpolate(e, [SEND_FRAME, SEND_FRAME + 10], [1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              translate: `0px ${
                greetingFade.translateY +
                interpolate(e, [SEND_FRAME, SEND_FRAME + 10], [0, -10], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })
              }px`,
            }}
          >
            <Sunburst size={34} color={accentColor} />
            <span
              style={{
                fontFamily: SERIF_FAMILY,
                fontSize: 36,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                color: t.fg,
              }}
            >
              {greeting}
            </span>
          </div>

          {/* Conversation — user bubble + streaming reply */}
          <div
            style={{
              position: "absolute",
              left: cardLeft,
              right: cardLeft,
              top: 36,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                opacity: bubbleFade.opacity,
                translate: `0px ${bubbleFade.translateY}px`,
              }}
            >
              <div
                style={{
                  maxWidth: 620,
                  background: t.bubbleBg,
                  borderRadius: 14,
                  padding: "13px 18px",
                  fontFamily: SANS_FAMILY,
                  fontSize: 18,
                  lineHeight: 1.45,
                  color: t.fg,
                }}
              >
                {prompt}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                marginTop: 26,
                opacity: responseFade.opacity,
                translate: `0px ${responseFade.translateY}px`,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  marginTop: 2,
                  opacity: thinking ? thinkPulse : 1,
                  scale: thinking ? String(0.92 + 0.08 * thinkPulse) : "1",
                }}
              >
                <Sunburst size={24} color={accentColor} />
              </div>
              <div
                style={{
                  fontFamily: SANS_FAMILY,
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: t.fg,
                  minHeight: 30,
                }}
              >
                {responseParagraphs.map((para, i) => {
                  const isLast = i === responseParagraphs.length - 1;
                  return (
                    <p
                      key={`${i}-${para.slice(0, 8)}`}
                      style={{
                        margin: 0,
                        marginTop: i === 0 ? 0 : 14,
                      }}
                    >
                      {para}
                      {isLast && res.count > 0 && !res.done ? (
                        <Caret
                          color={accentColor}
                          blink={false}
                          speed={speed}
                          height={20}
                          radius={2}
                          marginLeft={3}
                          style={{
                            verticalAlign: "text-bottom",
                            transform: "translateY(2px)",
                          }}
                        />
                      ) : null}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Input card — product-native Claude composer */}
          <div
            style={{
              position: "absolute",
              left: cardLeft,
              top: interpolate(
                e,
                [SEND_FRAME, SEND_FRAME + 16],
                [238, windowH - 186],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.cubic),
                },
              ),
              width: cardWidth,
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 16,
              boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
            }}
          >
            <div
              style={{
                padding: "24px 26px",
                minHeight: 54,
                fontFamily: SANS_FAMILY,
                fontSize: 20,
                lineHeight: 1.3,
                display: "flex",
                alignItems: "center",
              }}
            >
              {showText ? (
                <span style={{ color: t.fg }}>
                  {visibleText}
                  <Caret
                    color={t.fg}
                    blink={!tw.typing}
                    speed={speed}
                    height={23}
                    radius={0}
                    marginLeft={1}
                    style={{
                      verticalAlign: "text-bottom",
                      transform: "translateY(3px)",
                    }}
                  />
                </span>
              ) : (
                <span
                  style={{
                    color: t.placeholder,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <Caret
                    color={t.fg}
                    blink={!tw.typing}
                    speed={speed}
                    height={23}
                    radius={0}
                    marginLeft={1}
                    style={{
                      verticalAlign: "text-bottom",
                      transform: "translateY(3px)",
                    }}
                  />
                  <span style={{ marginLeft: 2 }}>{placeholder}</span>
                </span>
              )}
            </div>

            <div
              style={{
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <IconButton size={iconBtnSize} border={t.iconBtnBorder}>
                <PlusIcon size={20} color={t.fg} />
              </IconButton>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <span
                    style={{
                      fontFamily: SANS_FAMILY,
                      fontSize: 17,
                      fontWeight: 500,
                      color: t.fg,
                    }}
                  >
                    {modelName}
                  </span>
                  <span
                    style={{
                      fontFamily: SANS_FAMILY,
                      fontSize: 17,
                      fontWeight: 400,
                      color: t.fgMuted,
                    }}
                  >
                    {modelTier}
                  </span>
                  <ChevronDown size={16} color={t.fgMuted} />
                </div>

                <IconButton size={iconBtnSize} border={t.iconBtnBorder}>
                  <MicIcon size={20} color={t.fg} />
                </IconButton>

                <div
                  style={{
                    position: "relative",
                    width: morphSize,
                    height: morphSize,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "100%",
                      border: `1px solid ${t.iconBtnBorder}`,
                      opacity: 1 - morph,
                      scale: String(1 - 0.1 * morph),
                    }}
                  >
                    <WaveformIcon size={22} color={t.fg} />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                      background: accentColor,
                      opacity: morph,
                      scale: String(0.8 + 0.2 * morph),
                    }}
                  >
                    <SendIcon size={22} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
