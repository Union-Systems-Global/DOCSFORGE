import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCard } from "@/components/ProjectCard";
import { projects, tags } from "@/data/mockData";
import { Plus, Filter } from "lucide-react";
import { useState } from "react";
import { TagBadge } from "@/components/TagBadge";
import { cn } from "@/lib/utils";

export default function Projects() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = selectedTag
    ? projects.filter((p) => p.tags.includes(selectedTag))
    : projects;

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">{projects.length} software systems registered</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="h-9 px-4 rounded bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" /> New Project
          </button>
        </div>

        {/* Tag filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <button
            onClick={() => setSelectedTag(null)}
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
              !selectedTag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                selectedTag === tag.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tag.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>

        {/* Create Project Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
            <div className="bg-card border border-border rounded-lg w-full max-w-md mx-4 p-6 shadow-lg animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <h2 className="font-semibold mb-4">Create New Project</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">System Name</label>
                  <input className="mt-1 w-full h-9 px-3 rounded border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g., Payment Gateway" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <textarea className="mt-1 w-full h-20 px-3 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" placeholder="Brief description of the system..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Tags</label>
                  <input className="mt-1 w-full h-9 px-3 rounded border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="API, Backend, Security" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowCreate(false)} className="h-9 px-4 rounded border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                  <button className="h-9 px-4 rounded bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Create Project</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
