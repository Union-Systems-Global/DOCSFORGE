import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTree } from "@/components/PageTree";
import { DocumentEditor } from "@/components/DocumentEditor";
import { projects, projectPages, versions } from "@/data/mockData";
import { VersionTimeline } from "@/components/VersionTimeline";
import { TemplateSelector } from "@/components/TemplateSelector";
import { Save, History, Plus, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function ProjectWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === projectId);
  const pages = projectPages[projectId || "1"] || projectPages["1"];
  const [activePage, setActivePage] = useState(pages[0]?.id || "");
  const [showVersions, setShowVersions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  if (!project) {
    return <AppLayout><div className="p-6">Project not found.</div></AppLayout>;
  }

  const activePageTitle = (() => {
    for (const p of pages) {
      if (p.id === activePage) return p.title;
      if (p.children) {
        const child = p.children.find((c) => c.id === activePage);
        if (child) return child.title;
      }
    }
    return "Overview";
  })();

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Page tree sidebar */}
        <div className="w-60 shrink-0 border-r border-border bg-card overflow-y-auto">
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <button onClick={() => navigate("/projects")} className="hover:text-foreground transition-colors">Projects</button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium truncate">{project.name}</span>
            </div>
            <button
              onClick={() => setShowTemplates(true)}
              className="w-full h-8 rounded border border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="h-3 w-3" /> New Page
            </button>
          </div>
          <div className="p-2">
            <PageTree pages={pages} activePage={activePage} onSelect={setActivePage} />
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
            <div>
              <h2 className="text-sm font-semibold">{activePageTitle}</h2>
              <p className="text-xs text-muted-foreground">Last updated Mar 24, 2026 · Sarah Chen</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="h-8 px-3 rounded border border-border text-xs font-medium flex items-center gap-1.5 hover:bg-muted transition-colors"
              >
                <History className="h-3.5 w-3.5" /> History
              </button>
              <button className="h-8 px-3 rounded bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity">
                <Save className="h-3.5 w-3.5" /> Save
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <DocumentEditor />
          </div>
        </div>

        {/* Version History Panel */}
        {showVersions && (
          <div className="w-72 shrink-0 border-l border-border bg-card overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Version History</h3>
              <button onClick={() => setShowVersions(false)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <VersionTimeline versions={versions.slice(0, 3)} />
          </div>
        )}
      </div>

      <TemplateSelector open={showTemplates} onClose={() => setShowTemplates(false)} onSelect={() => setShowTemplates(false)} />
    </AppLayout>
  );
}
