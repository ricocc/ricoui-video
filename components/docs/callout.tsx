import { AlertTriangleIcon, InfoIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Semantic amber for warnings; notes use the system accent blue. */
const WARNING_ACCENT = "#f79009";

function CalloutBase({
  icon,
  title,
  children,
  accent,
  className,
}: {
  icon: ReactNode;
  title?: string;
  children: ReactNode;
  /** Accent that tints the border + icon (snapcn design system colors). */
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "surface-card not-prose my-6 flex max-w-3xl gap-3 rounded-lg px-4 py-3 text-sm",
        className,
      )}
      style={
        accent
          ? {
              borderColor: `color-mix(in oklab, ${accent} 40%, var(--color-border))`,
            }
          : undefined
      }
    >
      <div
        className="mt-0.5 shrink-0 text-muted-foreground"
        style={
          accent
            ? {
                color: `color-mix(in oklab, ${accent} 72%, var(--color-foreground))`,
              }
            : undefined
        }
      >
        {icon}
      </div>
      <div className="flex-1 space-y-1 leading-relaxed">
        {title && <div className="font-medium text-foreground">{title}</div>}
        <div className="text-muted-foreground [&>p]:m-0">{children}</div>
      </div>
    </div>
  );
}

export function Note({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <CalloutBase
      icon={<InfoIcon className="size-4" />}
      title={title}
      accent="var(--primary)"
    >
      {children}
    </CalloutBase>
  );
}

export function Warning({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <CalloutBase
      icon={<AlertTriangleIcon className="size-4" />}
      title={title}
      accent={WARNING_ACCENT}
    >
      {children}
    </CalloutBase>
  );
}
