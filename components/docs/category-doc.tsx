import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { headers } from "next/headers";
import Link from "next/link";
import {
  type CategoryId,
  GALLERY_CATEGORIES,
  GALLERY_ITEMS,
  slugFromHref,
} from "@/lib/gallery-data";
import registry from "@/registry/__index__";
import { CategoryGrid } from "./category-grid";
import { InstallBlock } from "./install-block";

/**
 * The body of a category index page: what is in the category, how to install one
 * of them, and how to put it on screen.
 *
 * These pages used to be a title, a paragraph and a grid of cards — a reader who
 * arrived at `/docs/text` from the nav got a list of names and no answer to
 * "and then what?". The per-category prose above this component says what the
 * category is *for*; everything below it is the same three questions for all
 * seven, so it is generated from `GALLERY_ITEMS` rather than written out seven
 * times and left to rot in six of them.
 *
 * Every number in the usage snippet — duration, fps, dimensions, the export name
 * and its import path — is read from the component's own registry config, the
 * same object the live preview and the customizer run on. Nothing here is a
 * figure typed into a doc that the component can drift away from.
 */
export async function CategoryDoc({ category }: { category: CategoryId }) {
  const zh = (await headers()).get("x-ricoui-locale") !== "en";
  const prefix = zh ? "" : "/en";
  const items = GALLERY_ITEMS.filter((item) => item.category === category);
  const label =
    GALLERY_CATEGORIES.find((c) => c.id === category)?.label ?? category;

  // The category's first curated entry is its flagship — the one worth showing
  // in the install and usage examples.
  const leadSlug = slugFromHref(items[0].href);
  const config = registry[leadSlug]?.config;

  return (
    <>
      <h2 id="components">{zh ? "组件" : "The components"}</h2>
      <p>
        {zh
          ? `这一分类共有 ${items.length} 个组件。每张卡片都会播放默认场景；打开后可以查看 Props、安装源码和可逐帧拖动的 Player。`
          : `${items.length === 1 ? "One component" : `${items.length} components`} in ${label}. Each card plays its own default scene — open one for its props, the source file shadcn add writes, and a player you can scrub frame by frame.`}
      </p>

      <CategoryGrid category={category} />

      <h2 id="install">{zh ? "安装" : "Install"}</h2>
      <p>
        {zh
          ? "组件通过 shadcn CLI 安装到你的 Remotion 项目，源码可以直接修改。"
          : "Components are installed into your own Remotion project with the shadcn CLI, and the file it writes is yours to edit — there is no RICOUI Video runtime package to depend on. "}
        <Link href={`${prefix}/docs/getting-started/installation`}>
          {zh ? "先完成一次 Registry 配置" : "Set the registry up once"}
        </Link>
        {zh ? "，再按名称添加组件：" : ", then add components by name:"}
      </p>

      <InstallBlock name={leadSlug} />

      <p>
        {zh ? "该命令会写入 " : "That writes "}
        <code>components/snap-cn/{leadSlug}.tsx</code>
        {zh
          ? "。安装其他组件时只需替换名称。"
          : ". Swap the name for any other component on this page."}
      </p>

      {config ? (
        <>
          <h2 id="usage">{zh ? "放入画面" : "Put it on screen"}</h2>
          <p>
            {zh
              ? "每个 Prop 都有可用默认值，挂载进 Composition 后即可渲染："
              : "Every prop has a working default, so the component renders as soon as it is mounted — give it a composition and you have a video:"}
          </p>
          <DynamicCodeBlock
            lang="tsx"
            code={`// src/Root.tsx
import { Composition } from "remotion";
import { ${config.componentName} } from "${config.importPath}";

export const RemotionRoot = () => (
  <Composition
    id="${config.componentName}"
    component={${config.componentName}}
    durationInFrames={${config.durationInFrames}}
    fps={${config.fps}}
    width={${config.compositionWidth}}
    height={${config.compositionHeight}}
  />
);`}
          />
          <p>
            <code>durationInFrames</code> is the length {config.componentName}{" "}
            is choreographed for — {config.durationInFrames} frames at{" "}
            {config.fps} fps. Cut it short and the animation is cut short with
            it. To use one as a beat inside a longer video, mount it in a{" "}
            <code>&lt;Sequence&gt;</code> of the same length instead of giving
            it a composition of its own. Each component&apos;s page lists its
            props; they are all plain values, so anything you can compute you
            can animate.
          </p>
        </>
      ) : null}

      <h2 id="next">{zh ? "下一步" : "Next"}</h2>
      <ul>
        <li>
          <Link href={`${prefix}/docs/getting-started/installation`}>
            {zh ? "安装" : "Installation"}
          </Link>{" "}
          — the one-time registry setup, and the Remotion project it needs.
        </li>
        <li>
          <Link href={`${prefix}/docs/components`}>
            {zh ? "全部组件" : "All components"}
          </Link>{" "}
          — the full gallery, filterable across every category.
        </li>
        <li>
          <Link href={`${prefix}/docs/getting-started/agent-skill`}>
            Agent skill
          </Link>{" "}
          — hand snapcn to a coding agent so it picks the right component
          itself.
        </li>
      </ul>
    </>
  );
}
