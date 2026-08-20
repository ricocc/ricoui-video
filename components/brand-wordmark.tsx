import { cn } from "@/lib/utils";

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 whitespace-nowrap font-sans text-[0.9375rem] font-medium tracking-[-0.02em] text-foreground",
        className,
      )}
    >
      <span>RICOUI</span>
      <span className="text-muted-foreground">Video</span>
    </span>
  );
}
