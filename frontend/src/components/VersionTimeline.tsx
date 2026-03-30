import { GitBranch, RotateCcw } from "lucide-react";
import type { Version } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface Props {
  versions: Version[];
  activeVersion?: string;
  onSelect?: (version: Version) => void;
  onRestore?: (version: Version) => void;
}

export function VersionTimeline({ versions, activeVersion, onSelect, onRestore }: Props) {
  return (
    <div className="space-y-0">
      {versions.map((v, i) => (
        <div key={v.id} className="flex gap-3 py-3 relative group">
          {i < versions.length - 1 && (
            <div className="absolute left-[15px] top-10 bottom-0 w-px bg-border" />
          )}
          <div
            className={cn(
              "h-8 w-8 rounded flex items-center justify-center shrink-0 z-10 transition-colors",
              activeVersion === v.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
          >
            <GitBranch className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <button onClick={() => onSelect?.(v)} className="text-left">
              <p className="text-sm font-medium">v{v.version}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{v.summary}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {v.author} · {new Date(v.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </button>
            {i > 0 && (
              <button
                onClick={() => onRestore?.(v)}
                className="mt-2 text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <RotateCcw className="h-3 w-3" /> Restore this version
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
