/**
 * Unit tests for pure helpers in registry/snap-cn/pricing-card/index.tsx.
 *
 * Run with:
 *   pnpm vitest run registry/snap-cn/pricing-card
 *
 * No React DOM or Remotion player needed — only pure JS logic is exercised.
 */

import { describe, expect, it } from "vitest";

import {
  accentTint,
  FEATURES_LEAD,
  featureStartFrame,
  PRICING_PALETTES,
  parseTiers,
  priceReelWidth,
  tierStartFrame,
  visibleTiers,
} from "../index";

describe("parseTiers", () => {
  it("passes arrays through untouched", () => {
    const tiers = [{ name: "Pro", price: 29, features: ["Everything"] }];
    expect(parseTiers(tiers)).toBe(tiers);
  });

  it("parses the compact demo string into three tiers", () => {
    const tiers = parseTiers(
      "Starter | 0 | /mo | 3 projects, Community support; " +
        "Pro | 29 | /mo | Unlimited projects, Team seats | popular; " +
        "Scale | 99 | /mo | Everything in Pro, Custom SLA",
    );
    expect(tiers).toHaveLength(3);
    expect(tiers[0]).toEqual({
      name: "Starter",
      price: 0,
      period: "/mo",
      features: ["3 projects", "Community support"],
    });
    expect(tiers[1].popular).toBe(true);
    expect(tiers[1].badge).toBeUndefined();
    expect(tiers[2].popular).toBeUndefined();
  });

  it("treats a non-keyword 5th field as a custom badge", () => {
    const [tier] = parseTiers("Pro | 29 | /mo | Team seats | Best value");
    expect(tier.popular).toBe(true);
    expect(tier.badge).toBe("Best value");
  });

  it("strips currency symbols and separators from prices", () => {
    const [tier] = parseTiers("Scale | $1,299 | /yr | SLA");
    expect(tier.price).toBe(1299);
  });

  it("defaults unparseable prices to 0 and drops empty features", () => {
    const [tier] = parseTiers("Free | n/a | | ");
    expect(tier.price).toBe(0);
    expect(tier.features).toEqual([]);
  });
});

describe("visibleTiers", () => {
  const tiers = parseTiers(
    "Starter | 0 | /mo | A; Pro | 29 | /mo | B | popular; Scale | 99 | /mo | C",
  );

  it("returns every tier for the row layout", () => {
    expect(visibleTiers(tiers, "row")).toHaveLength(3);
  });

  it("returns only the popular tier for the single layout", () => {
    const single = visibleTiers(tiers, "single");
    expect(single).toHaveLength(1);
    expect(single[0].name).toBe("Pro");
  });

  it("falls back to the first tier when none is popular", () => {
    const plain = parseTiers("Starter | 0 | /mo | A; Scale | 99 | /mo | C");
    expect(visibleTiers(plain, "single")[0].name).toBe("Starter");
  });

  it("handles an empty tier list", () => {
    expect(visibleTiers([], "single")).toEqual([]);
  });
});

describe("timing helpers", () => {
  it("staggers card entrances linearly", () => {
    expect(tierStartFrame(0, 8)).toBe(0);
    expect(tierStartFrame(2, 8)).toBe(16);
  });

  it("offsets feature rows by the lead plus the stagger", () => {
    expect(featureStartFrame(10, 0, 6)).toBe(10 + FEATURES_LEAD);
    expect(featureStartFrame(10, 3, 6)).toBe(10 + FEATURES_LEAD + 18);
  });
});

describe("priceReelWidth", () => {
  it("grows with the digit count", () => {
    expect(priceReelWidth(9, "$", 56)).toBeLessThan(
      priceReelWidth(99, "$", 56),
    );
  });

  it("accounts for thousands separators", () => {
    // prefix (0.6em) + 4 digit columns (0.62em) + 1 comma (0.32em)
    expect(priceReelWidth(1299, "$", 56)).toBe(
      Math.ceil(56 * (0.6 + 4 * 0.62 + 0.32)),
    );
  });

  it("treats $0 as a single digit", () => {
    expect(priceReelWidth(0, "$", 56)).toBe(Math.ceil(56 * (0.6 + 0.62)));
  });
});

describe("accentTint", () => {
  it("converts the accent blue with the light tint alpha", () => {
    expect(accentTint("#266DF0", PRICING_PALETTES.light.tintAlpha)).toBe(
      "rgba(38,109,240,0.04)",
    );
  });

  it("expands 3-digit hex", () => {
    expect(accentTint("#fff", 0.5)).toBe("rgba(255,255,255,0.5)");
  });

  it("falls back to accent blue on bad input", () => {
    expect(accentTint("not-a-color", 0.1)).toBe("rgba(38,109,240,0.1)");
  });
});
