import { type ComponentConfig, FPS, H, W } from "@/lib/customizer-config";

export const dataFlowPipesConfig: ComponentConfig = {
  componentName: "DataFlowPipes",
  importPath: "@/components/snap-cn/data-flow-pipes",
  controls: {
    theme: {
      type: "select",
      default: "light",
      options: ["light", "dark"],
      label: "Theme",
    },
    pulseColor: { type: "color", default: "#266DF0", label: "Packet color" },
    pulseLength: {
      type: "number",
      default: 48,
      min: 10,
      max: 200,
      step: 2,
      label: "Packet length",
    },
    pulseDuration: {
      type: "number",
      default: 36,
      min: 8,
      max: 120,
      step: 1,
      label: "Packet duration",
    },
    cycleFrames: {
      type: "number",
      default: 90,
      min: 0,
      max: 300,
      step: 5,
      label: "Cycle frames",
    },
  },
  durationInFrames: 180,
  fps: FPS,
  compositionWidth: W,
  compositionHeight: H,
  previewBackdrop: { type: "color", value: "#FAFAFA" },
};
