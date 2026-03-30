import { FileText, FolderOpen, Trash2, Edit } from "lucide-react";
import type { Activity } from "@/data/mockData";
import { cn } from "@/lib/utils";

const iconMap = {
  created: FileText,
  creation: FileText,
  updated: Edit,
  update: Edit,
  deleted: Trash2,
  deletion: Trash2,
  document_create: FileText,
  document_update: Edit,
  document_delete: Trash2,
  portal_create: FolderOpen,
  portal_update: Edit,
  version_create: FileText,
};

const labelMap = {
  created: "created",
  creation: "created",
  updated: "updated",
  update: "updated",
  deleted: "deleted",
  deletion: "deleted",
  document_create: "created",
  document_update: "updated",
  document_delete: "deleted",
  portal_create: "created portal",
  portal_update: "updated portal",
  version_create: "created version",
};

export function ActivityTimeline({ activities, limit }: { activities: Activity[]; limit?: number }) {
  const items = limit ? activities.slice(0, limit) : activities;

  return (
    <div className="space-y-0">
      {items.map((activity, i) => {
        const Icon = activity.entity === "project" ? FolderOpen : iconMap[activity.type];
        return (
          <div key={activity.id} className="flex gap-4 py-4 relative group">
            {i < items.length - 1 && (
              <div className="absolute left-[19px] top-12 bottom-0 w-[2px] bg-border/50 group-hover:bg-primary/20 transition-colors duration-300 rounded-full" />
            )}
            
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 z-10 transition-transform duration-300 group-hover:scale-110 shadow-sm border border-transparent",
                activity.type === "created" && "bg-blue-500/10 text-blue-500 group-hover:border-blue-500/20 group-hover:bg-blue-500/20",
                activity.type === "updated" && "bg-emerald-500/10 text-emerald-500 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/20",
                activity.type === "deleted" && "bg-red-500/10 text-red-500 group-hover:border-red-500/20 group-hover:bg-red-500/20"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm leading-tight">
                <span className="font-bold text-foreground">{activity.author}</span>{" "}
                <span className="text-muted-foreground">{labelMap[activity.type]}</span>{" "}
                <span className="font-bold text-foreground transition-colors duration-200 group-hover:text-primary cursor-pointer">{activity.entityName}</span>
              </p>
              <div className="flex items-center gap-2 mt-1.5 opacity-80">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50">
                  {activity.projectName}
                </span>
                <span className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wider">
                  {new Date(activity.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
            
          </div>
        );
      })}
    </div>
  );
}
