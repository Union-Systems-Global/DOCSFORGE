import { ChevronRight, FileText, Plus, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DocPage } from "@/data/mockData";

interface Props {
  pages: DocPage[];
  activePage?: string;
  onSelect: (pageId: string) => void;
}

function PageTreeItem({ page, depth, activePage, onSelect }: { page: DocPage; depth: number; activePage?: string; onSelect: (id: string) => void }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = page.children && page.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1.5 px-2 rounded text-sm cursor-pointer group hover:bg-muted transition-colors",
          activePage === page.id && "bg-primary/10 text-primary font-medium"
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="h-4 w-4 shrink-0 flex items-center justify-center">
            <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform", expanded && "rotate-90")} />
          </button>
        ) : (
          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="flex-1 truncate" onClick={() => onSelect(page.id)}>{page.title}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
          <button className="h-5 w-5 rounded flex items-center justify-center hover:bg-muted-foreground/10">
            <Plus className="h-3 w-3 text-muted-foreground" />
          </button>
          <button className="h-5 w-5 rounded flex items-center justify-center hover:bg-muted-foreground/10">
            <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>
      {hasChildren && expanded && (
        <div>
          {page.children!.map((child) => (
            <PageTreeItem key={child.id} page={child} depth={depth + 1} activePage={activePage} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PageTree({ pages, activePage, onSelect }: Props) {
  return (
    <div className="space-y-0.5">
      {pages.map((page) => (
        <PageTreeItem key={page.id} page={page} depth={0} activePage={activePage} onSelect={onSelect} />
      ))}
    </div>
  );
}
