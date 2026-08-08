import { describe, expect, it } from "vitest";
import { classifyClient } from "../analytics-server";

/**
 * `classifyClient` is what makes `registry_component_fetched` mean anything: it
 * separates a real install from a crawler and an agent. Get it wrong and the
 * headline number on the dashboard is wrong in a way nobody notices, because it
 * still looks like a plausible install count.
 *
 * The ordering cases below are the ones that actually bite — agent user-agents
 * that contain "bot", and agents that ship a full browser UA string.
 */
describe("classifyClient", () => {
  it("counts a bare shadcn/Node fetch as a CLI install", () => {
    expect(classifyClient(null)).toBe("cli");
    expect(classifyClient("node")).toBe("cli");
    expect(classifyClient("undici")).toBe("cli");
    expect(classifyClient("shadcn/4.11.0")).toBe("cli");
    expect(classifyClient("curl/8.4.0")).toBe("cli");
  });

  it("puts AI agents ahead of the bot and browser rules", () => {
    // Contains "bot" — must NOT be classified as a crawler.
    expect(classifyClient("PerplexityBot/1.0")).toBe("agent");
    expect(classifyClient("ChatGPT-User/1.0")).toBe("agent");
    expect(classifyClient("Claude-User/1.0")).toBe("agent");
    // Ships a full browser string — must NOT be classified as a browser.
    expect(
      classifyClient("Mozilla/5.0 (compatible; anthropic-ai/1.0; +http://x)"),
    ).toBe("agent");
    expect(classifyClient("Cursor/0.42 Chrome/120")).toBe("agent");
  });

  it("keeps crawlers out of the install count", () => {
    expect(classifyClient("Googlebot/2.1")).toBe("bot");
    expect(classifyClient("Mozilla/5.0 (compatible; bingbot/2.0)")).toBe("bot");
    expect(classifyClient("facebookexternalhit/1.1")).toBe("bot");
  });

  it("recognises a person looking at the JSON in a tab", () => {
    expect(
      classifyClient(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
      ),
    ).toBe("browser");
  });

  it("falls back rather than guessing", () => {
    expect(classifyClient("something-nobody-has-seen/1.0")).toBe("unknown");
  });
});
