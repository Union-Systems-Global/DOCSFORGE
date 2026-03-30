import { FolderOpen, FileText, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Project } from "@/data/mockData";
import { TagBadge } from "./TagBadge";

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();

  // Fake progress calculation for visual flair (0-100%)
  const progress = Math.min(Math.round((project.documentCount / 20) * 100), 100);

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="text-left w-full p-5 rounded-2xl border border-border/60 bg-card relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40"
    >
      {/* Animated gradient background flair */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary text-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div className="h-8 w-8 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/30 transition-all duration-300">
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
        
        <h3 className="font-extrabold text-lg text-foreground truncate group-hover:text-primary transition-colors tracking-tight">{project.name}</h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 max-w-[90%] leading-relaxed">{project.description}</p>
        
        {/* Mini Data Visualization */}
        <div className="mt-5 space-y-2">
           <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Project Health</span>
              <span className="text-primary">{progress}%</span>
           </div>
           <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progress}%` }} 
              />
           </div>
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/40 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
            <FileText className="h-3.5 w-3.5 text-primary/70" /> {project.documentCount} docs
          </div>
          <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
            <Clock className="h-3.5 w-3.5 text-primary/70" /> {project.lastUpdated}
          </div>
        </div>

        {project.tags.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {project.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag} name={tag} />
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
