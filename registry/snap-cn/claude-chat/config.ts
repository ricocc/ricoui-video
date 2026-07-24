import { type ComponentConfig, FPS, H, W } from "@/lib/customizer-config";

export const claudeChatConfig: ComponentConfig = {
  componentName: "ClaudeChat",
  importPath: "@/components/snap-cn/claude-chat",
  controls: {
    greeting: { type: "text", default: "Afternoon, Dana", label: "Greeting" },
    placeholder: {
      type: "text",
      default: "How can I help you today?",
      label: "Placeholder",
    },
    prompt: {
      type: "text",
      default: "Draft a refund policy for Acme's annual plan",
      label: "Prompt",
    },
    response: {
      type: "text",
      default:
        "Here's a draft refund policy for Acme's annual plan:\n\nFull refund within 30 days of purchase, no questions asked. After day 30, refunds are prorated for the unused months of the term. Requests go to billing@acme.com and are processed within 5 business days.",
      label: "Response",
    },
    modelName: { type: "text", default: "Opus 4.8", label: "Model" },
    modelTier: { type: "text", default: "Max", label: "Tier" },
    accentColor: { type: "color", default: "#D97757", label: "Accent" },
    showFrame: { type: "boolean", default: true, label: "Pulsing frame" },
  },
  durationInFrames: 300,
  fps: FPS,
  compositionWidth: W,
  compositionHeight: H,
  previewBackdrop: { type: "color", value: "#FAFAFA" },
};
