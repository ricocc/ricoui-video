import { collectDocsPages, LLMS_HEADER, SITE_URL } from "@/lib/llms";

export const dynamic = "force-static";

/**
 * llms.txt (https://llmstxt.org): a compact, LLM-friendly index of the docs.
 * Answer engines fetch this instead of scraping HTML; the full corpus lives
 * at /llms-full.txt.
 */
export function GET() {
  const pages = collectDocsPages();

  const sections = new Map<string, string[]>();
  for (const page of pages) {
    const lines = sections.get(page.category) ?? [];
    lines.push(
      `- [${page.title}](${SITE_URL}${page.url})${page.description ? `: ${page.description}` : ""}`,
    );
    sections.set(page.category, lines);
  }

  const body = [...sections.entries()]
    .map(([category, lines]) => `## ${category}\n\n${lines.join("\n")}`)
    .join("\n\n");

  const text = `${LLMS_HEADER}\nFull docs as one file: ${SITE_URL}/llms-full.txt\n\n${body}\n`;

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
