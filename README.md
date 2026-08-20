# RICOUI Video

[简体中文](README.md) | [English](README.en.md)

用于软件演示视频的 Remotion 可复制组件库。

包含 AI 流式回复、终端、设备框架、字幕、文字动画和可复用视频场景。通过
shadcn CLI 安装，源码直接进入你的项目。

[官网](https://video.ricoui.com) · [组件](https://video.ricoui.com/docs/components) · [文档](https://video.ricoui.com/docs)

## 特性

- 专门服务于软件与 AI 产品演示的 Remotion 场景
- 源码直接复制到项目中，不引入 RICOUI Video 运行时依赖
- 可拖动进度的实时预览与组件文档
- 按文字、字幕、AI、终端、设备和场景等用途分类
- 默认提供简体中文，英文页面位于 `/en`
- 采用 MIT License，清晰保留上游归属信息

## 安装

`@ricoui-video` 尚未加入 shadcn Registry Directory，因此使用前需要先在项目的
`components.json` 中配置 Registry 地址：

```json
{
  "registries": {
    "@ricoui-video": "https://video.ricoui.com/r/{name}.json"
  }
}
```

然后安装组件：

```bash
npx shadcn@latest add @ricoui-video/text-reveal
```

RICOUI Video 面向已有的 Remotion 项目。如果还没有项目，请先运行
`npx create-video@latest`，并配置复制源码所使用的 `@` 路径别名。

## Registry

Registry 文件通过 `https://video.ricoui.com/r/<name>.json` 提供。所有组件统一使用
`@ricoui-video/<name>` 安装，内部来源目录不会出现在安装命令中。

## 组件

组件按用途分类，不按界面语言分类。来自上游的组件继续保留在
`registry/snap-cn/` 与 `registry/snap-cn-ui/`，便于以后与 SnapCN 对比和同步。
RICOUI Video 原创组件放在 `registry/ricoui/`。

组件来源和修改状态统一维护在 `registry/metadata/components.ts`，不会向标准
shadcn Registry schema 写入自定义字段。

## 多语言

简体中文位于 `/`，英文页面使用 `/en` 前缀。共享界面翻译位于
`lib/i18n/messages.ts`，路由与 URL 辅助函数位于 `lib/i18n/config.ts`。组件名、
slug、Props、API、代码和安装命令不会随站点语言变化。

新增语言时，需要扩展 locale 与字典、在 `proxy.ts` 中增加前缀处理，并补充
canonical 与 hreflang。

## 参与贡献

添加组件前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。修改上游来源组件时应尽量
保持 diff 聚焦，便于后续同步 SnapCN。

## 上游

RICOUI Video 是基于 [SnapCN](https://github.com/snapcndev/snapcn) 开发的独立开源
项目，不是 SnapCN 官方中文版，也不代表获得 SnapCN 的维护或背书。

```text
origin/main   -> https://github.com/ricocc/ricoui-video
upstream/main -> https://github.com/snapcndev/snapcn
```

## 归属说明

项目保留 SnapCN 原始 MIT 版权声明与 Git 历史。RICOUI Video 新增内容由 RICOUI
贡献者维护。

## License

[MIT](LICENSE)
