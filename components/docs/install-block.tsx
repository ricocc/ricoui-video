import { installCommand } from "@/config/site";
import { convertNpmCommand } from "@/lib/convert-npm-command";
import { CodeBlockCommand } from "./code-block-command";

/**
 * The install command for a single component. Spelled once, in
 * `installCommand` — the public `@ricoui-video/<name>` namespace.
 *
 * Both `registry/*` items publish to the same flat `/r/<name>.json`, so the
 * `registry` prop no longer picks a path — it only names the component for the
 * agent prompt.
 */
export function InstallBlock({
  name,
  registry = "snapcn",
}: {
  name: string;
  registry?: "snapcn" | "snap-cn-ui";
}) {
  const npmCommand = installCommand(name);
  return (
    <div className="my-6">
      <CodeBlockCommand
        component={name}
        variant="outline"
        prompt={`Add the RICOUI Video ${name} component (${registry} source tier) by running: ${npmCommand}`}
        {...convertNpmCommand(npmCommand)}
      />
    </div>
  );
}
