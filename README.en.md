# RICOUI Video

[简体中文](README.md) | [English](README.en.md)

Copy-paste Remotion components for building software demo videos.

Streaming AI answers, terminals, device frames, captions, text animations and
reusable video scenes. Install with the shadcn CLI. The code is yours.

[Website](https://video.ricoui.com/en) · [Components](https://video.ricoui.com/en/docs/components) · [Documentation](https://video.ricoui.com/en/docs)

## Features

- Purpose-built Remotion scenes for software and AI product demos
- Source code copied into your project instead of a runtime package
- Live, scrubbable previews and component documentation
- Functional categories such as text, captions, AI, terminal, device and scenes
- Simplified Chinese by default, with English at [`/en`](https://video.ricoui.com/en)
- MIT licensed with clear upstream attribution

## Installation

The `@ricoui-video` namespace is not yet listed in the shadcn Registry
Directory, so add its registry URL to your project's `components.json`:

```json
{
  "registries": {
    "@ricoui-video": "https://video.ricoui.com/r/{name}.json"
  }
}
```

Then install any component:

```bash
npx shadcn@latest add @ricoui-video/text-reveal
```

RICOUI Video expects an existing Remotion project. If needed, start one first
with `npx create-video@latest` and configure the `@` alias used by the copied
source.

## Registry

Registry items are served from `https://video.ricoui.com/r/<name>.json`. All
components use the public install form `@ricoui-video/<name>`; internal source
folders never appear in install commands.

## Components

Components are grouped by what they do, never by interface language. Existing
upstream components remain under `registry/snap-cn/` and
`registry/snap-cn-ui/` to keep future upstream diffs small. New RICOUI-authored
components belong in `registry/ricoui/`.

Source and modification status live in `registry/metadata/components.ts`,
outside the standard shadcn schema.

## Localization

Simplified Chinese is served at `/`. English uses the `/en` prefix. Shared UI
messages live in `lib/i18n/messages.ts`; locale routing and URL helpers live in
`lib/i18n/config.ts`. Component names, slugs, props, APIs, code and install
commands remain unchanged across locales.

To add another locale, extend the locale union and dictionary, add its route
prefix in `proxy.ts`, then add canonical and hreflang entries.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before adding a component. Keep changes
to upstream-derived components focused so they remain easy to compare with
SnapCN.

## Upstream

RICOUI Video is an independent open-source project based on
[SnapCN](https://github.com/snapcndev/snapcn). It is not an official translation
or distribution maintained or endorsed by SnapCN.

```text
origin/main   -> https://github.com/ricocc/ricoui-video
upstream/main -> https://github.com/snapcndev/snapcn
```

## Attribution

The project retains SnapCN's original MIT copyright notice and source history.
RICOUI Video-specific additions are maintained by the RICOUI contributors.

## License

[MIT](LICENSE)
