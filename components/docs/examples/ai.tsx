import type { ComponentType } from "react";
import { ClaudeChat } from "@/registry/snap-cn/claude-chat";
import { claudeChatConfig } from "@/registry/snap-cn/claude-chat/config";
import { V0 } from "@/registry/snap-cn/v0";
import { v0Config } from "@/registry/snap-cn/v0/config";

export interface AiExampleEntry {
  Component: ComponentType;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}

interface SceneConfig {
  durationInFrames: number;
  fps: number;
  compositionWidth: number;
  compositionHeight: number;
}

function entry(Component: ComponentType, config: SceneConfig): AiExampleEntry {
  return {
    Component,
    durationInFrames: config.durationInFrames,
    fps: config.fps,
    width: config.compositionWidth,
    height: config.compositionHeight,
  };
}

export const aiExamples: Record<string, AiExampleEntry> = {
  "claude-chat": entry(ClaudeChat, claudeChatConfig),
  v0: entry(V0, v0Config),
};
