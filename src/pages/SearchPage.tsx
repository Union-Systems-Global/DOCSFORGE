import { AppLayout } from "@/components/layout/AppLayout";
import { Search as SearchIcon, FileText, FolderOpen } from "lucide-react";
import { useState } from "react";
import { projects, documents } from "@/data/mockData";
import { TagBadge } from "@/components/TagBadge";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filteredDocs = query
    ? documents.filter(
        (d) =>
          d.title.toLowerCase().includes(query.toLowerCase()) ||
          d.content.toLowerCase().includes(query.toLowerCase()) ||
          d.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const filteredProjects = query
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
          <p className="text-sm text-muted-foreground mt-1">Search across all projects and documentation</p>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            placeholder="Search projects, documents, tags..."
            autoFocus
          />
        </div>

        {query && (
          <div className="space-y-6">
            {filteredProjects.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projects</h2>
                <div className="space-y-1">
                  {filteredProjects.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded hover:bg-muted transition-colors cursor-pointer">
                      <FolderOpen className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {filteredDocs.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Documents</h2>
                <div className="space-y-1">
                  {filteredDocs.map((d) => {
                    const proj = projects.find((p) => p.id === d.projectId);
                    return (
                      <div key={d.id} className="flex items-start gap-3 p-3 rounded hover:bg-muted transition-colors cursor-pointer">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{d.title}</p>
                          <p className="text-xs text-muted-foreground">{proj?.name} · {d.lastUpdated}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{d.content}</p>
                          <div className="flex gap-1 mt-1">
                            {d.tags.map((t) => <TagBadge key={t} name={t} />)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {filteredProjects.length === 0 && filteredDocs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No results found for "{query}"</p>
            )}
          </div>
        )}

        {!query && (
          <div className="text-center py-16">
            <SearchIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Start typing to search across all documentation</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
