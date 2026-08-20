# RICOUI Video：新增 Remotion 组件完整指南

这份指南面向要在当前仓库新增组件的维护者。完成后，一个组件应该同时具备：

- 可维护的 Remotion 源码
- 网站中的实时预览和参数控制
- `@ricoui-video/<slug>` 安装入口
- 中英文组件介绍
- 来源、修改状态与语言能力 metadata
- 测试与可重复构建的 Registry JSON

下面的示例使用原创组件 `badge-pop`。请把它替换成你的实际组件 slug。

## 1. 先决定组件放在哪里

| 目录 | 用途 | 什么时候使用 |
| --- | --- | --- |
| `registry/ricoui/` | RICOUI Video 原创组件 | 新设计、新场景、新动画默认放这里 |
| `registry/snap-cn/` | 来自 SnapCN 的视频组件和场景 | 同步上游组件，或修改已有 SnapCN 组件 |
| `registry/snap-cn-ui/` | SnapCN 的底层主题与 UI primitive | Input、Caret、Theme 等可被场景复用的底层能力 |

判断顺序：

1. 新组件由 RICOUI 自己设计：放进 `registry/ricoui/<slug>/`。
2. 组件直接来自 SnapCN：保持在 `registry/snap-cn/<slug>/`。
3. 只是修改已有 SnapCN 组件：不要搬目录，在 metadata 中标记 `modified: true`。
4. 只有可复用的底层 UI primitive 才放 `snap-cn-ui`。普通视频场景不要放进去。

组件支持中文不代表它属于 `ricoui`，也不需要复制一份“中文组件”。来源和语言能力是两个独立概念。

## 2. 命名规则

以 `BadgePop` 为例：

```text
Registry slug       badge-pop
React component     BadgePop
Config export       badgePopConfig
源代码目录          registry/ricoui/badge-pop/
安装命令            @ricoui-video/badge-pop
用户项目目标文件    components/ricoui/badge-pop.tsx
英文文档            content/docs/<category>/badge-pop.mdx
中文文档            content/docs/<category>/badge-pop.zh-CN.mdx
```

要求：

- slug 使用小写 kebab-case。
- React 组件和 Props 类型使用 PascalCase。
- 不翻译 slug、Props、API、组件名和安装命令。
- 不把来源目录写进公开 namespace。安装入口始终是 `@ricoui-video/<slug>`。

## 3. 创建组件目录

原创组件建议结构：

```text
registry/ricoui/badge-pop/
├── index.tsx
├── config.ts
└── __tests__/
    └── badge-pop.test.ts
```

`index.tsx` 是最终复制到用户项目的文件。不要依赖网站专用组件、数据库、Next.js API 或只能在浏览器交互环境运行的状态。

一个最小的帧驱动组件：

```tsx
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface BadgePopProps {
  text?: string;
  color?: string;
}

export function BadgePop({
  text = "New release",
  color = "#266df0",
}: BadgePopProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 180 },
  });
  const opacity = interpolate(frame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        style={{
          backgroundColor: color,
          color: "white",
          opacity,
          padding: "14px 22px",
          borderRadius: 10,
          transform: `scale(${progress})`,
          transformOrigin: "50% 50%",
        }}
      >
        {text}
      </div>
    </div>
  );
}
```

### Remotion 组件必须遵守的规则

- 时间只能来自 `useCurrentFrame()`、`useVideoConfig()` 和基于 frame 的计算。
- 不使用 `setTimeout`、`setInterval`、CSS keyframes 或依赖真实时间的动画库。
- 相同 frame、props 和素材必须产生相同画面。
- 需要随机值时使用确定性 seed，不直接调用会在每次渲染变化的 `Math.random()`。
- 动画数值要设置 extrapolation，避免超出预期范围。
- 远程图片可能使渲染不可重复。优先使用用户传入素材、`staticFile()` 或稳定资源。
- Props 要允许用户替换文案、颜色和内容，不要把 RICOUI 品牌写死在通用组件中。
- 修改来源组件前阅读 `MOTION.md` 和 `DESIGN.md`，不要顺手重构上游代码。

## 4. 添加 `config.ts`

Config 同时驱动网站预览、Customizer、Composition 尺寸和代码片段。没有 Config，组件无法正常进入现有展示系统。

```ts
import { type ComponentConfig, FPS, H, W } from "@/lib/customizer-config";

export const badgePopConfig: ComponentConfig = {
  componentName: "BadgePop",
  importPath: "@/components/ricoui/badge-pop",
  controls: {
    text: {
      type: "text",
      default: "New release",
      label: "Text",
    },
    color: {
      type: "color",
      default: "#266df0",
      label: "Color",
    },
  },
  durationInFrames: 60,
  fps: FPS,
  compositionWidth: W,
  compositionHeight: H,
  previewBackdrop: { type: "color", value: "#fafafa" },
};
```

检查点：

- `componentName` 必须和导出的 React 组件名一致。
- `importPath` 必须和 Registry 的目标路径一致。
- control 的 default 应与组件 Props 默认值一致。
- `durationInFrames` 要覆盖最后一个动画节拍，不要在收尾前截断。
- Preview backdrop 同时检查浅色和深色内容的可读性。
- 通用 `speed` control 会在 `registry/__index__.tsx` 中自动合并，不要重复声明。

## 5. 注册到网站预览入口

编辑 `registry/__index__.tsx`：

```tsx
import { BadgePop } from "@/registry/ricoui/badge-pop";
import { badgePopConfig } from "@/registry/ricoui/badge-pop/config";
```

然后加入 registry 对象：

```tsx
const registry: Record<string, RegistryEntry> = {
  // ...existing entries
  "badge-pop": { Component: BadgePop, config: badgePopConfig },
};
```

如果组件的最终节拍要求 `speed >= 1`，再把 slug 加到该文件的 `MIN_SPEED_ONE`。普通组件不要加入。

## 6. 加入 shadcn Registry manifest

原创组件编辑 `registry/ricoui/registry.json`，在 `items` 中增加：

```json
{
  "name": "badge-pop",
  "type": "registry:component",
  "title": "Badge Pop",
  "description": "A compact badge that scales into view and settles on the frame.",
  "dependencies": ["remotion"],
  "registryDependencies": [
    "https://video.ricoui.com/r/snap-cn-ui.json"
  ],
  "files": [
    {
      "path": "badge-pop/index.tsx",
      "type": "registry:component",
      "target": "components/ricoui/badge-pop.tsx"
    }
  ]
}
```

注意：

- `registryDependencies` 只写真实依赖。不依赖主题核心时应删除该字段。
- 在 `@ricoui-video` 进入 shadcn Registry Directory 前，内部依赖使用完整 URL 最可靠。
- npm 依赖放 `dependencies`，RICOUI Registry 组件依赖放 `registryDependencies`。
- 不向标准 manifest 添加 `source`、`modified`、`languages` 等自定义字段。
- 根目录 `registry.json` 已 include `registry/ricoui/registry.json`，通常不需要再修改。
- `registry.json` 和各 manifest 是手工维护文件。只改自己的条目，避免全文件重排。

构建后，公开文件会生成到：

```text
public/r/badge-pop.json
```

用户安装方式仍然是：

```bash
npx shadcn@latest add @ricoui-video/badge-pop
```

## 7. 添加来源与语言 metadata

来源逻辑位于 `registry/metadata/components.ts`。

- `registry/ricoui` 中的新 slug 默认返回 `source: "ricoui"`、`modified: false`。
- 未修改的上游组件显示 `SnapCN`。
- 修改过的上游组件需要加入 `modifiedSnapCnComponents`，显示 `Adapted from SnapCN`。
- `languages` 描述组件内容能力，不描述网站当前语言。

语言值：

```text
universal  普遍适用
cjk        对中日韩排版做过优化
zh         行为与中文强相关
en         行为与英文强相关
ja         行为与日文强相关
```

只要组件能接收任意字符串，通常保持 `universal`。不要因为示例文案是中文就标记成 `zh`。

## 8. 加入组件画廊

编辑 `lib/gallery-data.ts`，把组件放进已有功能分类：

```ts
{
  name: "Badge Pop",
  description: "A compact badge that scales into view and settles cleanly",
  category: "text",
  href: "/docs/text/badge-pop",
}
```

当前分类包括：

```text
text       文字与标题
captions   字幕
logos      Logo 动画
screens    屏幕与设备
social     社交证明
scenes     完整场景
ai-input   AI 交互
```

不要为了一个组件创建空分类。确实出现一组新用途时，再扩展 `CategoryId`、分类数组、图标和中英文标签。

中文展示名和描述写入 `lib/i18n/gallery.ts`：

```ts
"badge-pop": {
  name: "徽章弹出",
  description: "徽章缩放进入画面，并以克制的回弹停稳。",
},
```

这里可以翻译 UI 展示名称，但 Registry slug 和 React 组件名仍保持英文。

## 9. 编写中英文文档

在组件所属分类下创建：

```text
content/docs/text/badge-pop.mdx
content/docs/text/badge-pop.zh-CN.mdx
```

英文文档最小模板：

```mdx
---
title: Badge Pop
description: A compact badge that scales into view and settles cleanly
---

<ComponentPreview name="badge-pop" />

## Installation

<InstallBlock name="badge-pop" />

## Component code

<ComponentSource name="badge-pop" />

## Usage

\`\`\`tsx
import { BadgePop } from "@/components/ricoui/badge-pop";

<BadgePop text="New release" />
\`\`\`

## Props

<PropsTable
  rows={[
    {
      name: "text",
      type: "string",
      default: '"New release"',
      description: "Text displayed inside the badge",
    },
  ]}
/>
```

中文文档使用相同组件名、slug、Props、代码和安装命令，只翻译说明文字。中文站点默认位于 `/`，英文站点位于 `/en`，不要再把中文链接写成 `/zh/...`。

## 10. 编写测试

优先测试纯函数和时间边界，不要依赖肉眼判断：

```ts
import { describe, expect, it } from "vitest";

describe("badge progress", () => {
  it("starts hidden", () => {
    expect(resolveBadgeOpacity(0)).toBe(0);
  });

  it("is visible after its entrance", () => {
    expect(resolveBadgeOpacity(8)).toBe(1);
  });
});
```

值得测试的内容：

- 起始帧、结束帧和边界 frame。
- clamp 是否正确。
- preset 和默认参数。
- 文本切分、排序、布局等纯函数。
- 非法输入的 fallback。
- 相同输入是否得到确定性结果。

组件需要浏览器截图时，再增加浏览器级测试；不要用脆弱的整页 snapshot 替代行为测试。

## 11. 判断是否需要预渲染 MP4

大多数组件使用 `@remotion/player` 实时预览即可。只有 Player 明显错误呈现最终渲染效果时，才把 slug 加入 `lib/rendered-demos.tsx`。

加入后必须生成并提交：

```bash
pnpm run render:previews --only badge-pop
```

产物位于：

```text
public/demos/badge-pop.mp4
```

不要因为“看起来更流畅”就默认加入 allowlist。每个 MP4 都会增加后续维护成本。

## 12. 构建和验证

先生成 Registry：

```bash
pnpm registry:build
```

确认存在：

```text
public/r/badge-pop.json
```

检查生成文件中的关键字段：

```text
name
dependencies
registryDependencies
files[].target
files[].content
```

然后执行：

```bash
pnpm typecheck
pnpm test
pnpm build
```

仓库完整 lint 目前受历史 CRLF/LF 基线影响。至少应对本次新增的 TS、TSX 和 JSON 文件运行 Biome，并确保没有新增诊断。

## 13. 本地测试真实安装

运行网站：

```bash
pnpm dev
```

先直接访问：

```text
http://localhost:3000/r/badge-pop.json
```

然后在一个临时 Remotion 项目中配置：

```json
{
  "registries": {
    "@ricoui-video": "http://localhost:3000/r/{name}.json"
  }
}
```

执行：

```bash
npx shadcn@latest add @ricoui-video/badge-pop
```

最后检查：

- 文件是否写入 manifest 声明的目标位置。
- 所有 npm dependency 是否安装。
- Registry dependency 是否一并复制。
- 用户项目中没有依赖 `@/registry/*`、Next.js 或本站内部文件。
- Remotion Composition 能预览，也能执行真实 render。

## 14. 修改 SnapCN 上游组件时

如果不是新增原创组件，而是修改已有 `registry/snap-cn/<slug>`：

1. 保持目录、导出名、Props 和整体代码结构稳定。
2. 只修改解决当前问题所需的部分。
3. 不批量重命名内部 identifier。
4. 不为了格式统一重排整个 manifest。
5. 把 slug 加入 `modifiedSnapCnComponents`。
6. 如果组件在 `RENDERED_DEMOS`，同步重渲染 MP4。
7. 在 PR 中说明为什么修改，以及如何验证。

这样以后执行 `git diff upstream/main` 时，看到的是有效差异，而不是格式噪声。

## 15. 完成检查表

提交前逐项确认：

- [ ] 选择了正确来源目录
- [ ] slug 和 React 组件名符合命名规则
- [ ] 动画完全由 frame 驱动
- [ ] Props 默认值和 Config 默认值一致
- [ ] 已加入 `registry/__index__.tsx`
- [ ] 已加入正确的 Registry manifest
- [ ] `dependencies` 与 `registryDependencies` 完整
- [ ] 已加入 `lib/gallery-data.ts`
- [ ] 已加入中文画廊名称和描述
- [ ] 已添加英文 MDX
- [ ] 已添加中文 MDX
- [ ] source、modified、languages metadata 正确
- [ ] `pnpm registry:build` 成功
- [ ] `public/r/<slug>.json` 内容正确
- [ ] 单元测试通过
- [ ] TypeScript 检查通过
- [ ] Next.js 生产构建通过
- [ ] 在临时项目中完成一次真实 shadcn 安装
- [ ] 如使用预渲染 demo，已提交最新 MP4

## 常见错误

### 网站能预览，但用户安装后报错

通常是组件引用了 `@/registry/*`、本站组件或未声明的依赖。最终安装文件只能依赖用户能够同时获得的文件和 npm package。

### Registry 构建成功，但画廊没有组件

检查 `registry/__index__.tsx` 和 `lib/gallery-data.ts`。Registry manifest 只负责安装产物，不会自动把组件加入网站画廊。

### 中文站点仍显示英文组件描述

检查 `lib/i18n/gallery.ts` 是否存在对应 slug，以及中文 MDX 是否使用 `.zh-CN.mdx` 后缀。

### 修改参数后，代码片段与预览不一致

检查组件 Props 默认值、`config.ts` controls default 和文档 Props 表是否使用了同一组值。

### 动画在 Player 中正常，真实渲染不正常

检查真实时间、CSS animation、远程素材、字体加载、随机值和浏览器 compositor。最终以 Remotion render 的逐帧结果为准。
