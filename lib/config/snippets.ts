import { LAVENDER, MINT, PEACH } from "@/config/site";

// ---------------------------------------------------------------------------
// Hero code block
// ---------------------------------------------------------------------------

/** Shown inside the hero's code player — the real snap-cn flow. */
export const HERO_CODE = `// npx shadcn@latest add snap-cn/text-reveal
import { AbsoluteFill } from "remotion";
import { TextReveal } from "@/components/snap-cn/text-reveal";

export function LaunchScene() {
  return (
    <AbsoluteFill style={{ background: "#0a0a0a" }}>
      <TextReveal text="Ship your launch video" />
    </AbsoluteFill>
  );
}`;

// ---------------------------------------------------------------------------
// Get-started steps
// ---------------------------------------------------------------------------

export type Step = {
  n: number;
  title: string;
  description: string;
  command: string;
  component?: string;
  /** Pastel accent that differentiates this step from its neighbours. */
  accent: string;
};

export const START: Step = {
  n: 1,
  title: "Start with Remotion",
  description:
    "Already have a Remotion project? Skip ahead. Otherwise scaffold one in seconds.",
  command: "npx create-video@latest",
  accent: PEACH,
};

export const INIT: Step = {
  n: 2,
  title: "Set up shadcn",
  description:
    "Run the shadcn init once so the CLI knows where to drop component files in your project.",
  command: "npx shadcn@latest init",
  accent: MINT,
};

export const ADD: Step = {
  n: 3,
  title: "Add a component",
  description:
    "Pull any primitive or composition straight into your project with the shadcn CLI — the code lands in your repo, yours to tweak.",
  command: "npx shadcn@latest add snap-cn/text-reveal",
  component: "text-reveal",
  accent: LAVENDER,
};

export const RENDER: Step = {
  n: 4,
  title: "Render your video",
  description:
    "Drop the component into a composition and export an mp4 — no editor required.",
  command: "npx remotion render",
  accent: PEACH,
};

/** A taste of what `snap-cn/<name>` pulls in — fills the featured card. */
export const SAMPLE_COMPONENTS = [
  "text-reveal",
  "follower-rush",
  "phone-frame",
  "terminal-simulator",
];
