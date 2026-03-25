import { FileText, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Document } from "@/data/mockData";
import { projects } from "@/data/mockData";
import { TagBadge } from "./TagBadge";

export function DocumentCard({ doc }: { doc: Document }) {
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === doc.projectId);

  return (
    <button
      onClick={() => navigate(`/projects/${doc.projectId}/docs/${doc.id}`)}
      className="text-left w-full p-4 rounded border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{doc.title}</h4>
          {project && <p className="text-xs text-muted-foreground mt-0.5">{project.name}</p>}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />{doc.lastUpdated}
            </span>
            {doc.tags.map((tag) => (
              <TagBadge key={tag} name={tag} />
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
