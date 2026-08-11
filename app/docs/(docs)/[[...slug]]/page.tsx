import { DocsBody, DocsDescription, DocsTitle } from "fumadocs-ui/page";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { GALLERY_HREFS } from "@/lib/gallery-data";
import { getMDXComponents } from "@/mdx-components";
import { source } from "@/source";

const SITE_URL = "https://snapcn.dev";

/**
 * Components no longer have standalone docs pages — their MDX renders inline in
 * the components gallery overlay. Any hit on a component's old route (bookmarks,
 * in-doc cross-links, search results) bounces to that overlay. Non-component
 * docs (getting-started, UI concepts/installation) are untouched.
 */
function componentOverlayRedirect(slug: string[] | undefined): string | null {
  if (!slug?.length) return null;
  const path = `/docs/${slug.join("/")}`;
  if (GALLERY_HREFS.has(path)) {
    return `/docs/components?item=${slug[slug.length - 1]}`;
  }
  return null;
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const overlay = componentOverlayRedirect(params.slug);
  if (overlay) redirect(overlay);
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const data = page.data as any;
  const MDX = data.body;

  // Docs > Category > Page trail derived from the URL segments. Answer
  // engines and Google both consume this for breadcrumb rich results.
  const crumbs = [
    { name: "Docs", path: "/docs" },
    ...page.slugs.map((_, i) => ({
      name: i === page.slugs.length - 1 ? data.title : page.slugs[i],
      path: `/docs/${page.slugs.slice(0, i + 1).join("/")}`,
    })),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: data.title,
        description: data.description,
        url: `${SITE_URL}${page.url}`,
        image: `${SITE_URL}/og/${page.slugs.join("/")}`,
        author: {
          "@type": "Person",
          name: "Sri Nath",
          url: "https://x.com/SriNath693",
        },
        publisher: { "@type": "Organization", name: "snapcn", url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: `${SITE_URL}${c.path}`,
        })),
      },
    ],
  };

  // Rendered directly inside the gallery chrome's content column (see
  // `app/docs/(docs)/layout.tsx`) — no fumadocs `DocsPage`, so there's no TOC
  // rail or breadcrumb, matching the Components page. The prose is centred in a
  // readable, roomy-enough column for the inline component previews.
  return (
    <article className="mx-auto w-full max-w-4xl pt-4 pb-16 md:pt-6 md:pb-20">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from page frontmatter
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DocsTitle
        style={{ fontFamily: "var(--font-display)" }}
        className="text-4xl font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl"
      >
        {data.title}
      </DocsTitle>
      <DocsDescription className="mt-3 mb-0 max-w-3xl text-balance text-lg text-muted-foreground md:text-xl">
        {data.description}
      </DocsDescription>
      <DocsBody className="mt-8">
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </article>
  );
}

export function generateStaticParams() {
  // The `components` and `showcase` slugs are served by bespoke `(gallery)`
  // routes, not this catch-all. Neither has an MDX file, so the loader doesn't
  // yield them — this filter is belt-and-braces against any future re-add.
  const RESERVED = new Set(["components", "showcase", "video-editor"]);
  return (
    source
      .generateParams()
      .filter((p) => !(p.slug?.length === 1 && RESERVED.has(p.slug[0])))
      // Component docs live in the gallery overlay now; their routes only
      // redirect, so there's nothing to prerender.
      .filter((p) => !componentOverlayRedirect(p.slug))
  );
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();
  const data = page.data as any;
  const ogImage = `/og/${page.slugs.join("/")}`;

  return {
    title: data.title,
    description: data.description,
    alternates: { canonical: page.url },
    openGraph: {
      type: "article",
      url: page.url,
      title: data.title,
      description: data.description,
      siteName: "snapcn",
      images: [{ url: ogImage, width: 1200, height: 630, alt: data.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
      images: [ogImage],
    },
  };
}
