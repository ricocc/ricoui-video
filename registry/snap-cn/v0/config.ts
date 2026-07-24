import { type ComponentConfig, FPS, H, W } from "@/lib/customizer-config";

export const v0Config: ComponentConfig = {
  componentName: "V0",
  importPath: "@/components/snap-cn/v0",
  controls: {
    greeting: {
      type: "text",
      default: "What should we build today?",
      label: "Greeting",
    },
    placeholder: {
      type: "text",
      default: "Ask v0 to build…",
      label: "Placeholder",
    },
    prompt: {
      type: "text",
      default: "Generate a pricing page for Acme",
      label: "Prompt",
    },
    modelName: { type: "text", default: "v0 Max", label: "Model" },
    projectName: { type: "text", default: "acme-web", label: "Project" },
    theme: {
      type: "select",
      default: "light",
      options: ["light", "dark"],
      label: "Theme",
    },
    speed: {
      type: "number",
      default: 1,
      min: 1,
      max: 2,
      step: 0.25,
      label: "Speed",
    },
  },
  durationInFrames: 150,
  fps: FPS,
  compositionWidth: W,
  compositionHeight: H,
  previewBackdrop: { type: "color", value: "#FAFAFA" },
};
