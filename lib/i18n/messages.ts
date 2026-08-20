import type { Locale } from "./config";

export const messages = {
  en: {
    "nav.components": "Components",
    "nav.docs": "Docs",
    "nav.menu": "Menu",
    "nav.getStarted": "Get started",
    "nav.language": "中文",
    "search.label": "Search",
    "search.placeholder": "Search…",
    "hero.title": "Product demo videos, in React.",
    "hero.description":
      "Copy-paste Remotion components for the shots a software demo is made of — streaming AI answers, terminals, device frames, captions. Install with the shadcn CLI; the code is yours.",
    "hero.browse": "Browse components",
    "hero.installAll": "Install all",
    "footer.copyright": "RICOUI Video — MIT licensed",
    "footer.upstream": "Independent project based on SnapCN.",
    "gallery.components": "components",
    "gallery.all": "Every RICOUI Video component, ready to install.",
    "home.registryTitle": "A shadcn registry, for video",
    "home.registryIntro":
      "RICOUI Video is a registry of Remotion components for React video. Install a component with the shadcn CLI and its source lands in your project, ready to edit.",
    "home.allComponents": "All components →",
    "home.faqTitle": "Before you install",
    "home.composeTitle": "Compose it, then animate it",
  },
  "zh-CN": {
    "nav.components": "组件",
    "nav.docs": "文档",
    "nav.menu": "菜单",
    "nav.getStarted": "开始使用",
    "nav.language": "English",
    "search.label": "搜索",
    "search.placeholder": "搜索…",
    "hero.title": "用代码来制作视频",
    "hero.description":
      "一套复制粘贴就能用的 Remotion 组件，备齐了软件演示的常见镜头——AI 流式回复、终端、设备外框、字幕、文字动画，还有组合好的完整场景。用 shadcn CLI 安装，代码归你，想改就改。",
    "hero.browse": "浏览组件",
    "hero.installAll": "安装全部组件",
    "footer.copyright": "RICOUI Video — MIT 许可",
    "footer.upstream": "独立项目，脱胎于 SnapCN。",
    "gallery.components": "个组件",
    "gallery.all": "RICOUI Video 的全部组件都在这里，看中哪个直接装。",
    "home.registryTitle": "给视频用的 shadcn Registry",
    "home.registryIntro":
      "RICOUI Video 是一个 shadcn Registry，装的是 Remotion 视频组件。用 shadcn CLI 安装，源码直接落到你的项目里，随时可改。",
    "home.allComponents": "查看全部组件 →",
    "home.faqTitle": "安装前，你可能会问",
    "home.composeTitle": "先搭场景，再调动画",
  },
} as const;

export type MessageKey = keyof (typeof messages)["en"];

export function getMessages(locale: Locale) {
  return messages[locale];
}
