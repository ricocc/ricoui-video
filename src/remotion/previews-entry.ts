// Bundler entry for the rendered-preview script (scripts/render-previews.mts).
// Importing the root runs `registerRoot(PreviewsRoot)`. Kept separate from
// index.ts and demos-entry.ts because a bundle registers exactly one root.
// Side-effect-only by design.
import "./previews-root";
