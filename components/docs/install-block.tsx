import { convertNpmCommand } from "@/lib/convert-npm-command";
import { CodeBlockCommand } from "./code-block-command";

/**
 * The install command for a single component.
 *
 * ## Why the URL and not `@snap-cn/<name>`
 *
 * The short form only resolves if the CLI already knows the `@snap-cn`
 * namespace — from the shadcn registry index, or from a `registries` entry the
 * reader has to add to their own `components.json` first. Until snap-cn is in
 * that index, printing the short form means printing a command that fails, and
 * the fix is a paragraph of setup nobody reads before pasting.
 *
 * A registry-item URL needs none of that. It is longer, and it is one command
 * that works on a clean project. When snap-cn lands in the index, this line
 * goes back to the short form and every call site follows.
 *
 * Both `registry/*` items publish to the same flat `/r/<name>.json`, so the
 * `registry` prop no longer picks a path — it only names the component for the
 * agent prompt.
 */
export function InstallBlock({
  name,
  registry = "snap-cn",
}: {
  name: string;
  registry?: "snap-cn" | "snap-cn-ui";
}) {
  const url = `https://snapcn.dev/r/${name}.json`;
  const npmCommand = `npx shadcn@latest add ${url}`;
  return (
    <div className="my-6">
      <CodeBlockCommand
        component={name}
        variant="outline"
        // The agent gets the URL too. Told to "add @snap-cn/<name>", it would
        // run the short form and hit the same unknown-registry error.
        prompt={`Add the ${registry} ${name} component to my project by running: ${npmCommand}`}
        {...convertNpmCommand(npmCommand)}
      />
    </div>
  );
}
