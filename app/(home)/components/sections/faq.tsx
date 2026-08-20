import { ChevronDown } from "lucide-react";
import { headers } from "next/headers";
import { INSTALL_COMMAND } from "@/config/site";
import { GALLERY_COUNT } from "@/lib/gallery-data";
import { FadeUp } from "../fade-up";

/**
 * ## Why `<details>` and not the Accordion in `components/ui`
 *
 * A Radix-style accordion unmounts its panel when it is closed. Everything
 * written below would then be absent from the HTML a crawler receives, and the
 * one section on this page written specifically to be quoted would be the one
 * section nothing can read. `<details>` keeps its content in the DOM, opens
 * without a byte of JavaScript, and is what a browser's own find-in-page
 * expands. Rung 4: the platform already does this.
 *
 * ## Why the answers are plain strings
 *
 * They are rendered here *and* serialised into the FAQPage JSON-LD on the home
 * page. One array, both consumers — an answer cannot say one thing to a reader
 * and another to a crawler, because there is only one of it.
 *
 * Questions are phrased the way somebody types them ("Do I need Remotion
 * first?"), not the way a marketing page words them ("Prerequisites"). The
 * question *is* the query.
 */
export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "What is RICOUI Video?",
    a: `RICOUI Video is a shadcn-style registry of ${GALLERY_COUNT} Remotion components for React video — text animations, captions, logo stings, device mockups and full scenes. You install one with the shadcn CLI and the source file is copied into your project, exactly the way shadcn/ui works for interface components.`,
  },
  {
    q: "Do I need Remotion installed first?",
    a: "Yes. RICOUI Video does not bootstrap a video project — npx create-video@latest does that. Once you have a Remotion project with a components.json, its components install like any other shadcn registry.",
  },
  {
    q: "How do I install a RICOUI Video component?",
    a: `Run ${INSTALL_COMMAND}. The component is written to components/snap-cn/ (or wherever your components.json points), along with anything it depends on, and every prop but the words you are animating is defaulted, so it renders the moment you mount it in a composition.`,
  },
  {
    q: "Is RICOUI Video free?",
    a: "Yes. Every component is MIT licensed, the whole registry is on GitHub, and there is no account, no key and no paid tier to install any of it.",
  },
  {
    q: "Can I edit a component after installing it?",
    a: "That is the point. The file is yours — not a dependency you configure through props somebody else chose. It is ordinary Remotion built on useCurrentFrame, interpolate and spring, so changing a duration means changing a number in a file you can read.",
  },
  {
    q: "How is this different from an npm animation package?",
    a: "A package puts the animation behind a version number: you get what its author shipped, you upgrade on their schedule, and a patch release can change your video after you signed it off. A registry copies the code in once. There is no RICOUI Video runtime in your package.json.",
  },
  {
    q: "Does it work in a project without Tailwind?",
    a: "Yes. The components carry their own styles inline through a theme prop rather than through utility classes, because CSS custom properties do not survive a Remotion render. They look the same in a Tailwind project and in one that has never seen it.",
  },
  {
    q: "Does it render to MP4?",
    a: "Yes — the component that plays in the browser preview is the one that goes into the file. Because the output is ordinary Remotion, anything that renders a Remotion project renders these: npx remotion render, the SSR APIs, or Remotion Lambda.",
  },
  {
    q: "Does it work with Claude Code and other AI agents?",
    a: "The repository retains SnapCN's upstream agent skill — a component catalog with props, durations, motion-design rules and anti-patterns. Install it with npx skills add snapcndev/snapcn while RICOUI Video develops its own additions separately.",
  },
];

export const FAQ_ITEMS_ZH: { q: string; a: string }[] = [
  {
    q: "RICOUI Video 是什么？",
    a: `RICOUI Video 是一个包含 ${GALLERY_COUNT} 个 Remotion 组件的 shadcn 风格 Registry，覆盖文字动画、字幕、Logo 动画、设备框架和完整场景。安装后得到的是项目内可直接修改的源码。`,
  },
  {
    q: "需要先安装 Remotion 吗？",
    a: "需要。RICOUI Video 不负责创建视频项目；请先用 npx create-video@latest 初始化 Remotion，再通过 shadcn CLI 安装组件。",
  },
  {
    q: "如何安装组件？",
    a: `先在 components.json 中配置 @ricoui-video Registry，然后运行 ${INSTALL_COMMAND}。组件及其依赖会被复制到 components.json 指定的目录。`,
  },
  {
    q: "可以免费商用吗？",
    a: "项目采用 MIT License。你可以使用和修改组件；来自 SnapCN 的代码保留原作者版权与许可声明。",
  },
  {
    q: "安装后可以修改组件吗？",
    a: "可以，这正是 copy-paste Registry 的用途。组件会成为你项目中的普通 Remotion 源码，不受远程包版本控制。",
  },
  {
    q: "与 npm 动画包有什么区别？",
    a: "npm 包把实现隐藏在版本依赖后面；Registry 只在安装时复制一次源码，之后由你的项目自行维护。",
  },
  {
    q: "没有 Tailwind 也能使用吗？",
    a: "可以。视频组件通过内联样式和 theme prop 控制外观，不依赖页面中的 Tailwind 工具类。",
  },
  {
    q: "可以渲染为 MP4 吗？",
    a: "可以。组件使用标准 Remotion API，可通过 npx remotion render、SSR API 或 Remotion Lambda 渲染。",
  },
];

export async function Faq() {
  const zh = (await headers()).get("x-ricoui-locale") !== "en";
  const items = zh ? FAQ_ITEMS_ZH : FAQ_ITEMS;
  return (
    <section id="faq" className="relative pb-20 sm:pb-28">
      <div className="section">
        <FadeUp>
          <h2 className="mx-auto max-w-[14ch] text-pretty text-center font-sans text-[clamp(2.25rem,4.6vw,3.5rem)] font-normal leading-[1.06] tracking-[-0.03em] text-foreground">
            {zh ? "安装前常见问题" : "Before you install"}
          </h2>
        </FadeUp>

        <FadeUp delay={0.08}>
          {/* The column is centred on the page; the rows inside it are not. A
              question and its chevron sit on a shared baseline at opposite ends
              of the row — centre the text and the two stop lining up with
              anything. */}
          <div className="mx-auto mt-8 max-w-2xl border-t border-border">
            {items.map(({ q, a }) => (
              <details key={q} className="group border-b border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-body-lg text-foreground [&::-webkit-details-marker]:hidden">
                  <h3 className="font-normal">{q}</h3>
                  <ChevronDown
                    className="size-4 shrink-0 text-current/40 transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="pb-5 pr-8 text-pretty leading-relaxed text-current/70">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
