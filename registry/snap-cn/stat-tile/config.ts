import { type ComponentConfig, FPS, H, W } from "@/lib/customizer-config";

export const statTileConfig: ComponentConfig = {
  componentName: "StatTile",
  importPath: "@/components/snap-cn/stat-tile",
  controls: {
    stats: {
      type: "text",
      default:
        "12,480 | Active users | +23%; 99.98% | Uptime; 4.9 | Avg rating",
      label: "Stats (value | label | delta; …)",
    },
    layout: {
      type: "select",
      default: "row",
      options: ["single", "row"],
      label: "Layout",
    },
    counterMode: {
      type: "select",
      default: "rolling",
      options: ["rolling", "odometer", "slot"],
      label: "Counter mode",
    },
    stagger: {
      type: "number",
      default: 10,
      min: 0,
      max: 40,
      step: 1,
      label: "Stagger (frames)",
    },
    theme: {
      type: "select",
      default: "light",
      options: ["light", "dark"],
      label: "Theme",
    },
    valueFontSize: {
      type: "number",
      default: 72,
      min: 40,
      max: 140,
      step: 2,
      label: "Number size",
    },
  },
  durationInFrames: 150,
  fps: FPS,
  compositionWidth: W,
  compositionHeight: H,
  previewBackdrop: { type: "color", value: "#FAFAFA" },
};
