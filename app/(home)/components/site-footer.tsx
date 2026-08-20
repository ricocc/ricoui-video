"use client";

import Link from "next/link";
import { useI18n } from "@/components/locale-provider";
import { FOOTER_COLUMNS } from "@/config/site";
import { cn } from "@/lib/utils";

const ZH_LABELS: Record<string, string> = {
  Components: "组件",
  Documentation: "文档",
  Browse: "浏览",
  Project: "项目",
  "Text & Titles": "文字与标题",
  Captions: "字幕",
  Logos: "Logo 动画",
  "Screens & Devices": "屏幕与设备",
  "Social Proof": "社交证明",
  Scenes: "完整场景",
  "AI Chat Input": "AI 交互",
  Introduction: "项目介绍",
  Installation: "安装",
  "Agent skill": "Agent Skill",
  "All components": "全部组件",
  Showcase: "作品展示",
  "MIT license": "MIT 许可",
  Issues: "问题反馈",
  "SnapCN upstream": "SnapCN 上游",
};

/**
 * Sitemap footer: one column per group, each headed by a mono eyebrow.
 *
 * It replaced a single row of two links, which left the bottom of a full-bleed
 * page looking unfinished and gave a reader who reached the end nowhere to go.
 * Columns come from `FOOTER_COLUMNS` so the links cannot drift from the routes.
 */

/**
 * The hover from ruixen.com's `AnimatedLink` (registry/ruixenui/animated-link).
 *
 * The detail that makes it read as a wipe rather than a stretch is the origin
 * *flipping*: at rest the underline is scaled to nothing about its right edge, and
 * on hover the origin becomes the left edge before it scales up — so it sweeps in
 * from one side instead of growing out of the middle. Scaling a pseudo-element
 * also keeps the whole thing on the compositor; no layout is touched.
 */
const LINK = cn(
  "group relative inline-flex w-fit items-center text-sm text-foreground/75",
  "transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none",
  "before:pointer-events-none before:absolute before:left-0 before:top-[1.5em] before:h-[0.05em] before:w-full before:bg-current before:content-['']",
  "before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.4,0,0.2,1)]",
  "hover:before:origin-left hover:before:scale-x-100",
  "motion-reduce:before:transition-none",
);

/** The diagonal that draws itself in on hover, from the same component. */
function DrawArrow() {
  return (
    <svg
      className="ml-[0.3em] size-[0.55em]"
      fill="none"
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="[stroke-dasharray:32] [stroke-dashoffset:32] transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:[stroke-dashoffset:0] motion-reduce:transition-none"
      />
    </svg>
  );
}

export function SiteFooter() {
  const { href: localizedHref, locale, t } = useI18n();
  return (
    <footer className="border-t border-border">
      <div className="section pt-14 pb-12 sm:pt-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {FOOTER_COLUMNS.map(({ title, links }) => (
            <div key={title}>
              <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {locale === "zh-CN" ? (ZH_LABELS[title] ?? title) : title}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {links.map(({ href, label }) => {
                  // Anything off-site opens in a new tab and says so, rather
                  // than silently navigating away from the docs.
                  const external = href.startsWith("http");
                  return (
                    <li key={href}>
                      {external ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className={LINK}
                        >
                          {locale === "zh-CN"
                            ? (ZH_LABELS[label] ?? label)
                            : label}
                          <DrawArrow />
                        </a>
                      ) : (
                        <Link
                          href={
                            href.startsWith("/") ? localizedHref(href) : href
                          }
                          className={LINK}
                        >
                          {locale === "zh-CN"
                            ? (ZH_LABELS[label] ?? label)
                            : label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <p
          className="mt-14 text-sm text-muted-foreground sm:mt-16"
          suppressHydrationWarning
        >
          © {new Date().getFullYear()} {t("footer.copyright")} ·{" "}
          {t("footer.upstream")}
        </p>
      </div>
    </footer>
  );
}
