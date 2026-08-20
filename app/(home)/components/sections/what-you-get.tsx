"use client";

import Link from "next/link";
import { useI18n } from "@/components/locale-provider";
import { INSTALL_COMMAND } from "@/config/site";
import type { CategoryId } from "@/lib/gallery-data";
import {
  CATEGORY_ICONS,
  GALLERY_CATEGORIES,
  GALLERY_COUNT,
  GALLERY_ITEMS,
} from "@/lib/gallery-data";
import { FadeUp } from "../fade-up";

/**
 * The page's answer to "what is this", in prose a machine can quote.
 *
 * Everything above this section is a picture or a button. A crawler — and, more
 * to the point, an assistant summarising snapcn for somebody who asked it what
 * to use for a Remotion demo — had one sentence of the hero to go on. This is
 * the paragraph that gets quoted, so it says the whole thing plainly: registry,
 * CLI, the file lands in your repo, no package.
 *
 * The category list is also the only place on the landing page that links into
 * the seven docs categories. Those pages are where the long-tail traffic lands
 * ("remotion text animation", "remotion captions"); a home page that links to
 * none of them hands them no authority at all.
 *
 * Counts come from `GALLERY_ITEMS`, never from a number typed here — same rule
 * the gallery's own top bar follows.
 */
const COUNTS = GALLERY_ITEMS.reduce<Record<string, number>>((acc, item) => {
  acc[item.category] = (acc[item.category] ?? 0) + 1;
  return acc;
}, {});

/**
 * One line per category, written as the sentence somebody would type into a
 * search box — "text reveals", "karaoke captions", "phone and laptop mockups" —
 * rather than as a category blurb. The label above it is already the abstract
 * noun; this is the concrete one.
 */
const BLURBS: Record<CategoryId, string> = {
  text: "Text reveals, word flips, kinetic titles and highlight sweeps — the type animations a product video opens on.",
  captions:
    "Word-by-word and karaoke captions, timed against your audio, for the vertical cuts that get watched on mute.",
  logos:
    "Logo stings: an assemble that snaps your mark together, and a flicker for the sign-on shot.",
  screens:
    "Phone, laptop and terminal mockups to put your actual product on screen without opening a design tool.",
  social:
    "Follower and metric counters that rush up to a number, for the social proof beat.",
  scenes:
    "Whole compositions — hero launch, orbit gallery, moodboard reveal — assembled from the primitives above.",
  "ai-input":
    "Prompt typing, answer streaming and prompt zooms, for demoing an AI product's actual interaction.",
};

const ZH_LABELS: Record<CategoryId, string> = {
  text: "文字与标题",
  captions: "字幕",
  logos: "Logo 动画",
  screens: "屏幕与设备",
  social: "社交证明",
  scenes: "完整场景",
  "ai-input": "AI 交互",
};

const ZH_BLURBS: Record<CategoryId, string> = {
  text: "文字显现、词语翻转、动态标题与高亮扫过，适合产品视频的开场与重点表达。",
  captions:
    "逐词字幕与卡拉 OK 字幕，可与音频时间轴对齐，也适合静音观看的竖屏视频。",
  logos: "用于品牌开场与收尾的 Logo 组装和闪现动画。",
  screens: "手机、笔记本与终端框架，无需先在设计工具里制作设备样机。",
  social: "粉丝数与指标快速增长动画，用于展示社交证明。",
  scenes: "由基础组件组合而成的产品发布、环绕画廊与情绪板等完整场景。",
  "ai-input": "提示词输入、回答流式生成与输入框聚焦，适合演示 AI 产品交互。",
};

export function WhatYouGet() {
  const { href, locale, t } = useI18n();
  return (
    <section id="what-you-get" className="relative pb-20 sm:pb-28">
      <div className="section">
        <FadeUp>
          <h2 className="mx-auto max-w-[18ch] text-pretty text-center font-sans text-[clamp(2.25rem,4.6vw,3.5rem)] font-normal leading-[1.06] tracking-[-0.03em] text-foreground">
            {t("home.registryTitle")}
          </h2>
          <div className="mx-auto mt-5 max-w-2xl space-y-4 text-pretty text-center text-body-lg text-current/70">
            <p>
              {t("home.registryIntro")} {locale === "en" ? "Run" : "运行"}{" "}
              <code className="font-mono text-[0.9em] text-foreground">
                {INSTALL_COMMAND}
              </code>
              {locale === "en"
                ? ", and the source file lands in "
                : "，源码将写入 "}
              <code className="font-mono text-[0.9em] text-foreground">
                components/snap-cn/
              </code>
              {locale === "en" ? "." : "。"}
            </p>
            <p>
              {locale === "en"
                ? "Nothing is added to your "
                : "项目不会新增 RICOUI 运行时依赖；你的 "}
              <code className="font-mono text-[0.9em] text-foreground">
                package.json
              </code>
              {locale === "en"
                ? ". There is no RICOUI Video runtime or version to pin. Every component uses the plain Remotion API — "
                : " 中不会出现需要锁定版本的 RICOUI Video 包。每个组件都直接使用 Remotion API："}
              <code className="font-mono text-[0.9em] text-foreground">
                useCurrentFrame()
              </code>
              ,{" "}
              <code className="font-mono text-[0.9em] text-foreground">
                interpolate()
              </code>{" "}
              and{" "}
              <code className="font-mono text-[0.9em] text-foreground">
                spring()
              </code>{" "}
              {locale === "en"
                ? " — readable code that you own."
                : "，因此拿到的源码既清晰又可控。"}
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.08}>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY_CATEGORIES.map(({ id, label }) => {
              const Icon = CATEGORY_ICONS[id];
              return (
                <li key={id} className="bg-background">
                  <Link
                    href={href(`/docs/${id}`)}
                    className="flex h-full flex-col gap-2 p-6 transition-colors hover:bg-muted/60"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="size-4 text-current/50" aria-hidden />
                      <h3 className="text-base font-medium text-foreground">
                        {locale === "zh-CN" ? ZH_LABELS[id] : label}
                      </h3>
                      <span className="text-sm text-current/40">
                        {COUNTS[id] ?? 0}
                      </span>
                    </span>
                    <p className="text-sm leading-relaxed text-pretty text-current/70">
                      {locale === "zh-CN" ? ZH_BLURBS[id] : BLURBS[id]}
                    </p>
                  </Link>
                </li>
              );
            })}
            <li className="bg-background">
              <Link
                href={href("/docs/components")}
                className="flex h-full flex-col gap-2 p-6 transition-colors hover:bg-muted/60"
              >
                <h3 className="text-base font-medium text-foreground">
                  {t("home.allComponents")}
                </h3>
                <p className="text-sm leading-relaxed text-pretty text-current/70">
                  {locale === "zh-CN"
                    ? `在同一个可筛选网格中浏览全部 ${GALLERY_COUNT} 个组件，每张卡片都由真实的 Remotion Player 播放。`
                    : "The whole registry in one filterable grid, every card playing its own scene in a real Remotion player."}
                </p>
              </Link>
            </li>
          </ul>
        </FadeUp>
      </div>
    </section>
  );
}
