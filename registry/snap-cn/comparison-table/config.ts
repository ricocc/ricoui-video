import { type ComponentConfig, FPS, H, W } from "@/lib/customizer-config";

export const comparisonTableConfig: ComponentConfig = {
  componentName: "ComparisonTable",
  importPath: "@/components/snap-cn/comparison-table",
  controls: {
    columns: {
      type: "text",
      default: "*Acme, Legacy tools",
      label: "Columns (* = highlighted)",
    },
    rows: {
      type: "text",
      default:
        "Setup time | 5 min | 2 weeks; API access | yes | no; Realtime sync | yes | no; Support | 24/7 | Email only",
      label: "Rows (; rows, | cells)",
    },
    rowStagger: {
      type: "number",
      default: 10,
      min: 0,
      max: 30,
      step: 1,
      label: "Row stagger (frames)",
    },
    theme: {
      type: "select",
      default: "light",
      options: ["light", "dark"],
      label: "Theme",
    },
    accentColor: { type: "color", default: "#266DF0", label: "Accent" },
    crossColor: { type: "color", default: "#667085", label: "Cross color" },
    tableWidth: {
      type: "number",
      default: 720,
      min: 420,
      max: 1100,
      step: 10,
      label: "Table width",
    },
    fontSize: {
      type: "number",
      default: 22,
      min: 14,
      max: 40,
      step: 1,
      label: "Font size",
    },
  },
  durationInFrames: 120,
  fps: FPS,
  compositionWidth: W,
  compositionHeight: H,
  previewBackdrop: { type: "color", value: "#FAFAFA" },
};
