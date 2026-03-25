import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCard } from "@/components/ProjectCard";
import { DocumentCard } from "@/components/DocumentCard";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { projects, documents, activities } from "@/data/mockData";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const recentDocs = documents.slice(0, 4);
  const recentProjects = projects.slice(0, 4);

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's what's happening across your documentation.</p>
        </div>

        {/* Recent Documents */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent Documents</h2>
            <button onClick={() => navigate("/search")} className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentDocs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>

        {/* Projects */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Projects</h2>
            <button onClick={() => navigate("/projects")} className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>

        {/* Activity */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent Activity</h2>
            <button onClick={() => navigate("/activity")} className="text-xs text-primary flex items-center gap-1 hover:underline">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="rounded border border-border bg-card p-4">
            <ActivityTimeline activities={activities} limit={5} />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
