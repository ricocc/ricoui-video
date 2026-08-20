import { type ComponentConfig, FPS, H, W } from "@/lib/customizer-config";

export const heroLaunchConfig: ComponentConfig = {
  componentName: "HeroLaunch",
  importPath: "@/components/snap-cn/hero-launch",
  controls: {
    image1: {
      type: "image",
      default: "/showcase-videos/iphone-17-reveal.mp4",
      label: "Left card (image/video)",
    },
    image2: {
      type: "image",
      default: "/showcase-videos/airpods-pro.mp4",
      label: "Right card (image/video)",
    },
    heading: {
      type: "text",
      default: "npx shadcn add @ricoui-video",
      label: "Headline",
    },
  },
  durationInFrames: 170,
  fps: FPS,
  compositionWidth: W,
  compositionHeight: H,
  previewBackdrop: { type: "color", value: "#050505" },
};
