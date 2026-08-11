import { collectDocsPages, LLMS_HEADER, SITE_URL } from "@/lib/llms";

export const dynamic = "force-static";

/**
 * llms-full.txt: the entire documentation as one plain-markdown file, with
 * install widgets rewritten to runnable CLI commands. This is what agents and
 * answer engines ingest to answer "how do I build X with snapcn".
 */
export function GET() {
  const pages = collectDocsPages();

  const body = pages
    .map((page) =>
      [
        `# ${page.title}`,
        `URL: ${SITE_URL}${page.url}`,
        page.description,
        "",
        page.body,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n---\n\n");

  return new Response(`${LLMS_HEADER}\n${body}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
