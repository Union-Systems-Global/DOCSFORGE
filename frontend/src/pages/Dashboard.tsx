import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectCard } from "@/components/ProjectCard";
import { DocumentCard } from "@/components/DocumentCard";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { useActivityStore } from "@/stores/activityStore";
import { useDocumentStore } from "@/stores/documentStore";
import { usePortalStore } from "@/stores/portalStore";
import { ArrowRight, Sparkles, Clock, Layers, Activity, Users, ArrowUpRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { activities, stats, fetchActivities, fetchStats } = useActivityStore();
  const { documents, fetchDocuments } = useDocumentStore();
  const { portals, fetchPortals } = usePortalStore();

  useEffect(() => {
    fetchActivities();
    fetchStats();
    fetchDocuments();
    fetchPortals();
  }, [fetchActivities, fetchStats, fetchDocuments, fetchPortals]);

  const recentDocs = documents.slice(0, 4);
  const recentPortals = portals.slice(0, 4);

  return (
    <AppLayout>
      <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
        
        {/* Dynamic Personalized Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 sm:p-12 shadow-sm group">
          <style>{`
            @keyframes cross-1 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(-80vw, 25rem) scale(1.5); }
            }
            @keyframes cross-2 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              50% { transform: translate(80vw, -25rem) scale(1.5); }
            }
            .animate-cross-1 { animation: cross-1 20s ease-in-out infinite; }
            .animate-cross-2 { animation: cross-2 20s ease-in-out infinite; }
          `}</style>
          
          {/* Subtle Ambient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-transparent to-primary/5 z-0" />
          
          {/* Drifting, glowing orbs that cross from corner to corner */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-[100px] animate-cross-1 mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] bg-indigo-500/20 rounded-full blur-[100px] animate-cross-2 mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold backdrop-blur-md uppercase tracking-wide shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Workspace Insights
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
                Good morning, Sarah.
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                Your team has published <strong className="text-foreground">{stats.recentActivityCount} updates</strong> today. You have <strong className="text-foreground">{stats.totalDocuments} documents</strong> across <strong className="text-foreground">{stats.totalPortals} portals</strong> in your workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 shrink-0">
              <button 
                onClick={() => navigate('/create-new')}
                className="h-12 px-6 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
              >
                Create Document <ArrowUpRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/documents')}
                className="h-12 px-6 bg-muted/50 border border-border text-foreground rounded-xl font-bold text-sm hover:bg-muted hover:-translate-y-1 transition-all active:scale-95 backdrop-blur-md"
              >
                Browse All
              </button>
            </div>
          </div>
        </section>

        {/* Quick Access Dock (Horizontal Scroll) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">Jump Back In</h2>
            <span className="text-sm text-muted-foreground ml-2">Recent files</span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-6 pt-2 px-1 snap-x scrollbar-thin scrollbar-thumb-muted">
            {recentDocs.map((doc, i) => (
              <div 
                key={doc.id}
                onClick={() => navigate(`/documents`)}
                className="shrink-0 w-[280px] sm:w-[320px] snap-start group cursor-pointer"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative h-full overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/40 hover:bg-primary/5">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Layers className="w-24 h-24" />
                  </div>
                  <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                    <div>
                      <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {doc.content ? doc.content.replace(/<[^>]*>?/gm, '').substring(0, 80) + '...' : "No description available."}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                       <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                         <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center uppercase text-[10px]">
                           {doc.author?.charAt(0) || "A"}
                         </div>
                         {new Date(doc.updatedAt).toLocaleDateString()}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Active Projects (Takes up 2 columns on XL) */}
          <section className="xl:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold tracking-tight">Active Projects</h2>
              </div>
              <button onClick={() => navigate("/projects")} className="text-sm font-semibold text-primary/80 hover:text-primary flex items-center gap-1 group">
                View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentPortals.map((p) => (
                <ProjectCard key={p.id} project={{
                  id: p.id,
                  name: p.name,
                  description: `${p.type.charAt(0).toUpperCase() + p.type.slice(1)} portal for bank code ${p.bankCode || 'N/A'}`,
                  documentCount: documents.filter(d => d.bankId === p.id).length,
                  lastUpdated: "Just now",
                  tags: [p.type]
                }} />
              ))}
            </div>
          </section>

          {/* Activity Pulse (Takes up 1 column on XL) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold tracking-tight">Activity Pulse</h2>
              </div>
              <button onClick={() => navigate("/activity")} className="text-sm font-semibold text-primary/80 hover:text-primary flex items-center gap-1 group">
                Full feed <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm overflow-hidden relative">
              {/* Subtle background flair */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <ActivityTimeline 
                activities={activities.map(a => ({
                  id: a.id.toString(),
                  type: a.type as any,
                  message: a.message,
                  entity: a.type.includes('portal') ? 'project' : 'document',
                  entityName: a.message.split('"')[1] || "Item",
                  projectName: portals.find(p => p.id === a.bankId)?.name || "Workspace",
                  author: a.user_name,
                  date: a.createdAt
                }))} 
                limit={5} 
              />
            </div>
          </section>

        </div>
      </div>
    </AppLayout>
  );
}
