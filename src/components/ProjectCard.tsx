import { FolderOpen, FileText, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Project } from "@/data/mockData";
import { TagBadge } from "./TagBadge";

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="text-left w-full p-4 rounded border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <FolderOpen className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{project.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{project.documentCount} docs</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{project.lastUpdated}</span>
          </div>
          {project.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {project.tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag} name={tag} />
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
