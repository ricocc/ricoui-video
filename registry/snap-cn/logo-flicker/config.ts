import { type ComponentConfig, FPS, H, W } from "@/lib/customizer-config";

export const logoFlickerConfig: ComponentConfig = {
  componentName: "LogoFlicker",
  importPath: "@/components/snap-cn/logo-flicker",
  controls: {
    brandName: {
      type: "text",
      default: "RICOUI Video",
      label: "Brand name",
    },
    logoSrc: {
      type: "image",
      default: "/android-chrome-512x512.png",
      label: "Logo (simple, monochrome)",
    },
    flipInterval: {
      type: "number",
      default: 2,
      min: 1,
      max: 6,
      step: 1,
      label: "Flip interval (frames)",
    },
    background: { type: "color", default: "#050505", label: "Background" },
  },
  durationInFrames: 100,
  fps: FPS,
  compositionWidth: W,
  compositionHeight: H,
  previewBackdrop: { type: "color", value: "#050505" },
};
