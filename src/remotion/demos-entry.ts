// Bundler entry for the demos render script (scripts/render-demos.mts).
// Importing the root runs `registerRoot(DemosRoot)`. Kept separate from
// index.ts so the Root.tsx server bundle and the demos bundle don't collide
// (a bundle registers exactly one root). Side-effect-only by design.
// Tailwind + the design-system tokens, compiled into the bundle.
//
// A Remotion render has no app CSS: a class like `bg-card` or `rounded-lg`
// resolves on the site (which imports this same file) and to *nothing* in an
// mp4. Measured before this line existed — `bg-red-500` rendered pure white.
// Pulling `globals.css` in here rather than re-declaring the tokens keeps one
// source of truth, so a theme change on the site cannot drift from the renders.
import "../../app/globals.css";
import "./demos-root";
