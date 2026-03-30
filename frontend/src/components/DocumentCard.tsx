import { FileText, Clock, ExternalLink } from "lucide-react";
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
      className="text-left w-full p-5 rounded-2xl border border-border/60 bg-card relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors duration-300">
            <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          
          <div className="flex-1 min-w-0 pr-6">
            <h4 className="text-base font-bold text-foreground truncate tracking-tight group-hover:text-primary transition-colors">{doc.title}</h4>
            {project && <p className="text-xs font-semibold text-primary/70 mt-1 uppercase tracking-wider">{project.name}</p>}
          </div>

          <div className="absolute top-5 right-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
             <ExternalLink className="h-4 w-4 text-primary" />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold border-2 border-card z-10">
                  {doc.author.charAt(0)}
                </div>
             </div>
             <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
               <Clock className="h-3.5 w-3.5" />{doc.lastUpdated}
             </span>
          </div>
          
          <div className="flex gap-1.5">
            {doc.tags.slice(0, 2).map((tag) => (
              <TagBadge key={tag} name={tag} />
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
