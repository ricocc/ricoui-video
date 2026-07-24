# claude-chat

**Tier:** `snap-cn` (animation) · **Vibe:** tech · **Natural length:** 150f @ 30fps

Animated Claude chat input — types a prompt character-by-character and the waveform button morphs into a terracotta send button the moment text appears. Warm light/dark themes matching Anthropic's design language exactly.

## Install

```bash
shadcn add @snap-cn/claude-chat
```

Lands at `components/snap-cn/claude-chat.tsx`. Pulls `@snap-cn/caret`, `@snap-cn/snap-cn-ui` automatically.

## Props

| Prop | Type | Default |
|---|---|---|
| `greeting` | `string` | — |
| `placeholder` | `string` | `"Try: draft an email · summarize a doc · plan your…` |
| `prompt` | `string` | `"Draft a launch tweet for our new release"` |
| `modelName` | `string` | `"Opus 4.8"` |
| `modelTier` | `string` | `"Max"` |
| `accentColor` | `string` | `"#D97757"` |
| `speed` | `number` | `1` |

## Example

```tsx
<ClaudeChat placeholder="Try: draft an email · summarize a doc · plan your… />
```

## Use when

- Announcing a Claude integration or Anthropic-powered feature where the Claude brand must be visible.
- Showcasing a prompt workflow where claude.ai is the UI surface — the warm terracotta accent is the brand signal.
- A multi-AI comparison video needs the Claude card alongside `v0`.

## Don't use when

- The product is a CLI/terminal agent rather than a chat UI — use `terminal-simulator` for a generic terminal surface.
