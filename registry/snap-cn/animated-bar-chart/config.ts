import { type ComponentConfig, FPS, H, W } from "@/lib/customizer-config";

export const animatedBarChartConfig: ComponentConfig = {
  componentName: "AnimatedBarChart",
  importPath: "@/components/snap-cn/animated-bar-chart",
  controls: {
    title: {
      type: "text",
      default: "Deploys per weekday",
      label: "Title",
    },
    barColor: { type: "color", default: "#266DF0", label: "Bar color" },
    gridColor: { type: "color", default: "#E4E7EC", label: "Grid color" },
    labelColor: { type: "color", default: "#667085", label: "Label color" },
    titleColor: { type: "color", default: "#101828", label: "Title color" },
    gap: {
      type: "number",
      default: 20,
      min: 0,
      max: 80,
      step: 2,
      label: "Gap",
    },
    staggerFrames: {
      type: "number",
      default: 5,
      min: 0,
      max: 30,
      step: 1,
      label: "Stagger frames",
    },
  },
  durationInFrames: 120,
  fps: FPS,
  compositionWidth: W,
  compositionHeight: H,
  previewBackdrop: { type: "color", value: "#FAFAFA" },
};
