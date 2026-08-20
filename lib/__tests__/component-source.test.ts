import { describe, expect, it } from "vitest";
import {
  componentSourceLabel,
  getComponentSource,
} from "@/registry/metadata/components";

describe("component source metadata", () => {
  it("keeps untouched upstream components attributed to SnapCN", () => {
    const metadata = getComponentSource("text-reveal");
    expect(metadata.source).toBe("snapcn");
    expect(metadata.modified).toBe(false);
    expect(componentSourceLabel(metadata)).toBe("SnapCN");
  });

  it("marks migrated defaults as adapted", () => {
    const metadata = getComponentSource("logo-assemble");
    expect(metadata.source).toBe("snapcn");
    expect(metadata.modified).toBe(true);
    expect(componentSourceLabel(metadata)).toBe("Adapted from SnapCN");
  });

  it("defaults future original components to RICOUI", () => {
    const metadata = getComponentSource("future-original");
    expect(metadata.source).toBe("ricoui");
    expect(componentSourceLabel(metadata)).toBe("RICOUI");
  });
});
