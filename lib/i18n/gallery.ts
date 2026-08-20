import type { GalleryItem } from "@/lib/gallery-data";
import { slugFromHref } from "@/lib/gallery-data";

const zh: Record<string, Pick<GalleryItem, "name" | "description">> = {
  "text-reveal": {
    name: "文字显现",
    description: "支持淡入、滑动、模糊、缩放、遮罩与字距等预设的交错文字动画。",
  },
  "text-swell": {
    name: "文字涌现",
    description: "主词向镜头浮起，后续文字围绕它逐步组合，再整体回落。",
  },
  "text-highlight": {
    name: "文字高亮",
    description: "用标记笔、变色、下划线、替换删除线或 shimmer 强调句中内容。",
  },
  "text-swap": {
    name: "文字切换",
    description: "通过先退场后进场的时间安排，在两段文字之间切换。",
  },
  "text-build": {
    name: "文字构建",
    description: "单词依次进入，已有文字自动重排并持续保持居中。",
  },
  "word-flip": {
    name: "词语翻转",
    description:
      "标题输入完成后，让其中一个词以带预备动作和运动模糊的 3D 翻转循环。",
  },
  "word-captions": {
    name: "逐词字幕",
    description: "适合常见视频平台风格的内嵌字幕，并可突出当前朗读词。",
  },
  "karaoke-captions": {
    name: "卡拉 OK 字幕",
    description: "随语音逐词填充或高亮的粗体描边字幕。",
  },
  "logo-assemble": {
    name: "Logo 组装",
    description: "图片卡片环绕并向中心收拢，最终组合出 Logo 与品牌名。",
  },
  "logo-flicker": {
    name: "Logo 闪现",
    description: "快速切换图片后逐渐减速，让 Logo 与品牌名从闪烁中显现。",
  },
  "phone-frame": {
    name: "手机框架",
    description: "带灵动岛和屏幕插槽的手机设备框架，支持轻量 3D 进场。",
  },
  "laptop-frame": {
    name: "笔记本框架",
    description: "笔记本打开并展示通知，随后镜头推进到屏幕内容。",
  },
  "terminal-simulator": {
    name: "终端模拟器",
    description: "支持分段命令、停顿、滚动和光标聚焦镜头的终端窗口。",
  },
  "follower-rush": {
    name: "粉丝涌入",
    description: "头像堆叠、粉丝数快速增长，最后形成动态人脸波浪。",
  },
  "announce-title": {
    name: "发布标题",
    description: "由眉题、产品名和标语组成的四镜头产品发布标题。",
  },
  "status-cycle": {
    name: "状态循环",
    description: "状态标签滚动切换，容器宽度带回弹调整，并过渡到标签列表。",
  },
  "hero-launch": {
    name: "产品 Hero",
    description: "两张卡片进入构图，标题在上方显现的产品发布场景。",
  },
  "orbit-gallery": {
    name: "环绕画廊",
    description: "图片沿螺旋轨道流向中心，并为中央标题留出清晰空间。",
  },
  "moodboard-reveal": {
    name: "情绪板显现",
    description: "动态标题过渡到散落照片，再由镜头推进落到单张主图。",
  },
  "search-typing": {
    name: "搜索输入",
    description: "搜索框向前推进并输入内容，再横向移动展示后半部分。",
  },
  "prompt-zoom": {
    name: "提示词聚焦",
    description: "从 AI 首页硬切并聚焦到光标位置，随后输入提示词。",
  },
  "answer-stream": {
    name: "回答流式生成",
    description: "从发送按钮切到逐词生成的回答，同时镜头持续后拉。",
  },
};

export const zhCategoryLabels = {
  text: "文字与标题",
  captions: "字幕",
  logos: "Logo 动画",
  screens: "屏幕与设备",
  social: "社交证明",
  scenes: "完整场景",
  "ai-input": "AI 交互",
} as const;

export function localizeGalleryItem(item: GalleryItem, locale: "en" | "zh-CN") {
  if (locale === "en") return item;
  return { ...item, ...zh[slugFromHref(item.href)] };
}
