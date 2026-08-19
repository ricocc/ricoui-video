import type React from "react";
import { type ComponentConfig, SHARED_CONTROLS } from "@/lib/customizer-config";
import { AnnounceTitle } from "@/registry/snap-cn/announce-title";
import { announceTitleConfig } from "@/registry/snap-cn/announce-title/config";
import { AnswerStream } from "@/registry/snap-cn/answer-stream";
import { answerStreamConfig } from "@/registry/snap-cn/answer-stream/config";
import { FollowerRush } from "@/registry/snap-cn/follower-rush";
import { followerRushConfig } from "@/registry/snap-cn/follower-rush/config";
import { HeroLaunch } from "@/registry/snap-cn/hero-launch";
import { heroLaunchConfig } from "@/registry/snap-cn/hero-launch/config";
import { KaraokeCaptions } from "@/registry/snap-cn/karaoke-captions";
import { karaokeCaptionsConfig } from "@/registry/snap-cn/karaoke-captions/config";
import { LaptopFrame } from "@/registry/snap-cn/laptop-frame";
import { laptopFrameConfig } from "@/registry/snap-cn/laptop-frame/config";
import { LogoAssemble } from "@/registry/snap-cn/logo-assemble";
import { logoAssembleConfig } from "@/registry/snap-cn/logo-assemble/config";
import { LogoFlicker } from "@/registry/snap-cn/logo-flicker";
import { logoFlickerConfig } from "@/registry/snap-cn/logo-flicker/config";
import { MoodboardReveal } from "@/registry/snap-cn/moodboard-reveal";
import { moodboardRevealConfig } from "@/registry/snap-cn/moodboard-reveal/config";
import { OrbitGallery } from "@/registry/snap-cn/orbit-gallery";
import { orbitGalleryConfig } from "@/registry/snap-cn/orbit-gallery/config";
import { PhoneFrame } from "@/registry/snap-cn/phone-frame";
import { phoneFrameConfig } from "@/registry/snap-cn/phone-frame/config";
import { PromptZoom } from "@/registry/snap-cn/prompt-zoom";
import { promptZoomConfig } from "@/registry/snap-cn/prompt-zoom/config";
import { SearchTyping } from "@/registry/snap-cn/search-typing";
import { searchTypingConfig } from "@/registry/snap-cn/search-typing/config";
import { TerminalSimulator } from "@/registry/snap-cn/terminal-simulator";
import { terminalSimulatorConfig } from "@/registry/snap-cn/terminal-simulator/config";
import { TextBuild } from "@/registry/snap-cn/text-build";
import { textBuildConfig } from "@/registry/snap-cn/text-build/config";
import { TextHighlight } from "@/registry/snap-cn/text-highlight";
import { textHighlightConfig } from "@/registry/snap-cn/text-highlight/config";
import { TextReveal } from "@/registry/snap-cn/text-reveal";
import { textRevealConfig } from "@/registry/snap-cn/text-reveal/config";
import { TextSwap } from "@/registry/snap-cn/text-swap";
import { textSwapConfig } from "@/registry/snap-cn/text-swap/config";
import { TextSwell } from "@/registry/snap-cn/text-swell";
import { textSwellConfig } from "@/registry/snap-cn/text-swell/config";
import { WordCaptions } from "@/registry/snap-cn/word-captions";
import { wordCaptionsConfig } from "@/registry/snap-cn/word-captions/config";
import { WordFlip } from "@/registry/snap-cn/word-flip";
import { wordFlipConfig } from "@/registry/snap-cn/word-flip/config";

export interface RegistryEntry {
  Component: React.ComponentType<any>;
  config: ComponentConfig;
}

const registry: Record<string, RegistryEntry> = {
  "announce-title": { Component: AnnounceTitle, config: announceTitleConfig },
  "answer-stream": { Component: AnswerStream, config: answerStreamConfig },
  "follower-rush": { Component: FollowerRush, config: followerRushConfig },
  "hero-launch": { Component: HeroLaunch, config: heroLaunchConfig },
  "karaoke-captions": {
    Component: KaraokeCaptions,
    config: karaokeCaptionsConfig,
  },
  "laptop-frame": { Component: LaptopFrame, config: laptopFrameConfig },
  "logo-assemble": { Component: LogoAssemble, config: logoAssembleConfig },
  "logo-flicker": { Component: LogoFlicker, config: logoFlickerConfig },
  "moodboard-reveal": {
    Component: MoodboardReveal,
    config: moodboardRevealConfig,
  },
  "orbit-gallery": { Component: OrbitGallery, config: orbitGalleryConfig },
  "phone-frame": { Component: PhoneFrame, config: phoneFrameConfig },
  "prompt-zoom": { Component: PromptZoom, config: promptZoomConfig },
  "search-typing": { Component: SearchTyping, config: searchTypingConfig },
  "terminal-simulator": {
    Component: TerminalSimulator,
    config: terminalSimulatorConfig,
  },
  "text-build": { Component: TextBuild, config: textBuildConfig },
  "text-highlight": { Component: TextHighlight, config: textHighlightConfig },
  "text-reveal": { Component: TextReveal, config: textRevealConfig },
  "text-swap": { Component: TextSwap, config: textSwapConfig },
  "text-swell": { Component: TextSwell, config: textSwellConfig },
  "word-captions": { Component: WordCaptions, config: wordCaptionsConfig },
  "word-flip": { Component: WordFlip, config: wordFlipConfig },
};

// Append the shared controls (e.g. `speed`) to every component config so
// every animation in the customizer exposes the same baseline knobs.
for (const { config } of Object.values(registry)) {
  config.controls = { ...config.controls, ...SHARED_CONTROLS };
}

// These components schedule a payoff (a count-up landing on its target, a
// scripted flow reaching its end state, a reveal whose last elements enter at
// a fixed late frame) against the shared speed-scaled clock. A speed < 1 would
// stall the timeline short of that payoff, so the customizer caps their
// `speed` knob at a minimum of 1. Reassigning the existing key keeps its order.
const MIN_SPEED_ONE = [
  "follower-rush",
  // The tagline finishes draining to white at frame 147 of 170; under speed < 1
  // the line never reaches its resting colour inside the composition.
  "announce-title",
  "terminal-simulator",
  // The notch notification lands "connected" at frame 120 of 240; under
  // speed < 1 that beat never arrives inside the composition.
  "laptop-frame",
  // The hero landing is the last beat (frame 108–150); under speed < 1 the
  // montage never reaches it inside the composition.
  "moodboard-reveal",
  // The logo + brand name land in the last beat; under speed < 1 they never
  // arrive inside the composition.
  "logo-assemble",
  "logo-flicker",
  "text-build",
  "text-swell",
  "karaoke-captions",
  "word-captions",
  // The payoff is the finished sentence and the beat that follows it. Under
  // speed < 1 the last characters never land inside durationInFrames.
  "search-typing",
];
for (const name of MIN_SPEED_ONE) {
  const entry = registry[name];
  if (entry) {
    entry.config.controls.speed = {
      type: "number",
      default: 1,
      min: 1,
      max: 4,
      step: 0.25,
      label: "Speed",
    };
  }
}

export default registry;
