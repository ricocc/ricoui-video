import { convertNpmCommand } from "@/lib/convert-npm-command";
import { CodeBlockCommand } from "./code-block-command";

export function InstallBlock({
  name,
  registry = "snap-cn",
}: {
  name: string;
  registry?: "snap-cn" | "snap-cn-ui";
}) {
  const npmCommand = `npx shadcn@latest add @${registry}/${name}`;
  return (
    <div className="my-6">
      <CodeBlockCommand
        component={name}
        variant="outline"
        prompt={`Add the @${registry}/${name} component to my project.`}
        {...convertNpmCommand(npmCommand)}
      />
    </div>
  );
}
