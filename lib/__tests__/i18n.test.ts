import { describe, expect, it } from "vitest";
import { localizeHref } from "@/lib/i18n/config";

describe("localizeHref", () => {
  it("adds the English prefix once", () => {
    expect(localizeHref("/", "en")).toBe("/en");
    expect(localizeHref("/docs/components", "en")).toBe("/en/docs/components");
    expect(localizeHref("/zh/docs/components", "en")).toBe(
      "/en/docs/components",
    );
  });

  it("keeps Chinese routes unprefixed", () => {
    expect(localizeHref("/", "zh-CN")).toBe("/");
    expect(localizeHref("/docs/components", "zh-CN")).toBe("/docs/components");
    expect(localizeHref("/zh/docs/components", "zh-CN")).toBe(
      "/docs/components",
    );
    expect(localizeHref("/en/docs/components", "zh-CN")).toBe(
      "/docs/components",
    );
  });

  it("does not rewrite external URLs", () => {
    expect(localizeHref("https://example.com", "zh-CN")).toBe(
      "https://example.com",
    );
  });
});
