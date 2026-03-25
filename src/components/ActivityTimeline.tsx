import { FileText, FolderOpen, Trash2, Edit } from "lucide-react";
import type { Activity } from "@/data/mockData";
import { cn } from "@/lib/utils";

const iconMap = {
  created: FileText,
  updated: Edit,
  deleted: Trash2,
};

const labelMap = {
  created: "created",
  updated: "updated",
  deleted: "deleted",
};

export function ActivityTimeline({ activities, limit }: { activities: Activity[]; limit?: number }) {
  const items = limit ? activities.slice(0, limit) : activities;

  return (
    <div className="space-y-0">
      {items.map((activity, i) => {
        const Icon = activity.entity === "project" ? FolderOpen : iconMap[activity.type];
        return (
          <div key={activity.id} className="flex gap-3 py-3 relative">
            {i < items.length - 1 && (
              <div className="absolute left-[15px] top-10 bottom-0 w-px bg-border" />
            )}
            <div
              className={cn(
                "h-8 w-8 rounded flex items-center justify-center shrink-0 z-10",
                activity.type === "created" && "bg-accent/10 text-accent",
                activity.type === "updated" && "bg-primary/10 text-primary",
                activity.type === "deleted" && "bg-destructive/10 text-destructive"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.author}</span>{" "}
                <span className="text-muted-foreground">{labelMap[activity.type]}</span>{" "}
                <span className="font-medium">{activity.entityName}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activity.projectName} · {new Date(activity.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
