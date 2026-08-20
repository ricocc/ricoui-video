import snapCnRegistry from "../snap-cn/registry.json";
import snapCnUiRegistry from "../snap-cn-ui/registry.json";

export type ComponentSource = "snapcn" | "ricoui";

export interface ComponentSourceMetadata {
  name: string;
  source: ComponentSource;
  modified: boolean;
  languages: readonly ("universal" | "cjk" | "zh" | "en" | "ja")[];
}

const snapCnItems = [...snapCnRegistry.items, ...snapCnUiRegistry.items];

/**
 * Kept outside the shadcn registry manifests so source provenance never adds
 * non-standard fields to the public registry schema. Add a slug here only when
 * RICOUI changes the upstream implementation, not for docs or brand copy edits.
 */
const modifiedSnapCnComponents = new Set<string>([
  "hero-launch",
  "input",
  "logo-assemble",
  "logo-flicker",
  "moodboard-reveal",
]);

export const componentSourceMetadata = Object.fromEntries(
  snapCnItems.map((item) => [
    item.name,
    {
      name: item.name,
      source: "snapcn",
      modified: modifiedSnapCnComponents.has(item.name),
      languages: ["universal"],
    } satisfies ComponentSourceMetadata,
  ]),
) as Record<string, ComponentSourceMetadata>;

export function getComponentSource(name: string): ComponentSourceMetadata {
  return (
    componentSourceMetadata[name] ?? {
      name,
      source: "ricoui",
      modified: false,
      languages: ["universal"],
    }
  );
}

export function componentSourceLabel(metadata: ComponentSourceMetadata) {
  if (metadata.source === "ricoui") return "RICOUI";
  return metadata.modified ? "Adapted from SnapCN" : "SnapCN";
}
