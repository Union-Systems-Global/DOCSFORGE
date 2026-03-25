import { cn } from "@/lib/utils";

export function TagBadge({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary",
        className
      )}
    >
      {name}
    </span>
  );
}
