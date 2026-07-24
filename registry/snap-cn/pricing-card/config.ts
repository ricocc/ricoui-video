import { type ComponentConfig, FPS, H, W } from "@/lib/customizer-config";

export const pricingCardConfig: ComponentConfig = {
  componentName: "PricingCard",
  importPath: "@/components/snap-cn/pricing-card",
  controls: {
    tiers: {
      type: "text",
      default:
        "Starter | 0 | /mo | 3 projects, Community support, Basic analytics; " +
        "Pro | 29 | /mo | Unlimited projects, Priority support, Advanced analytics, Team seats | popular; " +
        "Scale | 99 | /mo | Everything in Pro, SSO & SCIM, Dedicated success manager, Custom SLA",
      label: "Tiers (name | price | period | features | popular; …)",
    },
    layout: {
      type: "select",
      default: "row",
      options: ["single", "row"],
      label: "Layout",
    },
    priceCountIn: {
      type: "boolean",
      default: true,
      label: "Count prices in",
    },
    featureStagger: {
      type: "number",
      default: 6,
      min: 0,
      max: 20,
      step: 1,
      label: "Feature stagger (frames)",
    },
    cardStagger: {
      type: "number",
      default: 8,
      min: 0,
      max: 30,
      step: 1,
      label: "Card stagger (frames)",
    },
    theme: {
      type: "select",
      default: "light",
      options: ["light", "dark"],
      label: "Theme",
    },
    accentColor: { type: "color", default: "#266DF0", label: "Accent" },
    currency: { type: "text", default: "$", label: "Currency" },
  },
  durationInFrames: 180,
  fps: FPS,
  compositionWidth: W,
  compositionHeight: H,
  previewBackdrop: { type: "color", value: "#FAFAFA" },
};
