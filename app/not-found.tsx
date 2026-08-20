import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { BrandWordmark } from "@/components/brand-wordmark";
import { Button } from "@/components/ui/button";
import { localizeHref } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const english = (await headers()).get("x-ricoui-locale") === "en";
  return {
    title: english
      ? "Page not found — RICOUI Video"
      : "页面不存在 — RICOUI Video",
    // A 404 has nothing to index and no canonical of its own.
    robots: { index: false, follow: true },
  };
}

/**
 * Root 404. Catches every unmatched path in the app, including `/docs/*`.
 *
 * Deliberately a full page rather than a line of text inside the docs chrome:
 * whoever lands here followed a broken link and needs somewhere to go, so the
 * three routes that actually matter are offered instead of a back button.
 */
export default async function NotFound() {
  const locale =
    (await headers()).get("x-ricoui-locale") === "en" ? "en" : "zh-CN";
  const english = locale === "en";
  const waysOut = [
    {
      href: "/docs/components",
      label: english ? "Browse all components" : "浏览全部组件",
    },
    {
      href: "/docs/getting-started/introduction",
      label: english ? "Read the docs" : "阅读文档",
    },
    {
      href: "/docs/showcase",
      label: english ? "See the showcase" : "查看作品展示",
    },
  ];
  return (
    <main className="section flex min-h-[70vh] flex-col items-start justify-center py-24">
      <Link
        href={localizeHref("/", locale)}
        aria-label="RICOUI Video home"
        className="mb-10 inline-flex"
      >
        <BrandWordmark />
      </Link>

      <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-3 max-w-[20ch] text-pretty font-sans text-[clamp(2rem,5vw,3.5rem)] font-normal leading-[1.05] tracking-[-0.03em] text-foreground">
        {english ? "This page doesn’t exist" : "这个页面不存在"}
      </h1>
      <p className="mt-4 max-w-md text-pretty text-body-lg text-current/70">
        {english
          ? "The link may be out of date, or the page may have moved. Everything the registry ships is one of these."
          : "链接可能已经失效，或者页面已被移动。你可以从下面几个入口继续浏览。"}
      </p>

      <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
        <Button
          size="lg"
          className="h-11 gap-2 px-6 text-sm"
          nativeButton={false}
          render={<Link href={localizeHref("/", locale)} />}
        >
          {english ? "Back home" : "返回首页"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <ul className="mt-10 flex flex-col gap-2.5">
        {waysOut.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={localizeHref(href, locale)}
              className="text-sm text-foreground/75 underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/40"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
