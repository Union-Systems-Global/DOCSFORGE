import { AppLayout } from "@/components/layout/AppLayout";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { Activity, Users, FileText, Zap, TrendingUp, GitCommit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActivityStore } from "@/stores/activityStore";
import { useDocumentStore } from "@/stores/documentStore";
import { usePortalStore } from "@/stores/portalStore";
import { useEffect, useMemo } from "react";

export default function ActivityPage() {
  const { activities, stats, fetchActivities, fetchStats } = useActivityStore();
  const { documents, fetchDocuments } = useDocumentStore();
  const { portals, fetchPortals } = usePortalStore();

  useEffect(() => {
    fetchActivities();
    fetchStats();
    fetchDocuments(undefined, true);
    fetchPortals();
  }, [fetchActivities, fetchStats, fetchDocuments, fetchPortals]);

  // Map activities for the timeline
  const mappedActivities = useMemo(() => activities.map(a => ({
    id: a.id.toString(),
    type: a.type.includes('create') ? 'creation' : a.type.includes('update') ? 'update' : a.type.includes('delete') ? 'deletion' : 'alert' as any,
    message: a.message,
    entity: a.type.includes('portal') ? 'project' : 'document' as any,
    entityName: a.message.split('"')[1] || "Item",
    projectName: portals.find(p => p.id === a.bankId)?.name || "Workspace",
    author: a.user_name,
    date: a.createdAt
  })), [activities, portals]);

  const heatmapData = useMemo(() => {
    const countsByDay: Record<string, number> = {};
    activities.forEach(a => {
      const day = new Date(a.createdAt).toLocaleDateString();
      countsByDay[day] = (countsByDay[day] || 0) + 1;
    });

    return Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString();
      return {
        date,
        count: countsByDay[date] || 0
      };
    });
  }, [activities]);

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen bg-background pb-24 group/page">
        
        {/* Header Dashboard Area */}
        <div className="relative overflow-hidden border-b border-border bg-card/40 pb-12 pt-16 px-6 lg:px-12">
          {/* Subtle animated background glowing blobs */}
          <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20 flex justify-center pointer-events-none">
            <div className="absolute top-0 right-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/20 blur-[100px]" />
            <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-blue-500/20 blur-[100px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20">
                <Activity className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                  Workspace Pulse
                </h1>
                <p className="text-muted-foreground mt-1 text-base font-medium">Real-time insights and activity across your entire organization.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 lg:px-12 pt-10 space-y-10">
          
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Active Contributors", value: stats.activeContributors.toString(), icon: Users, trend: "+0%", color: "text-blue-500", bg: "bg-blue-500/10", border: "group-hover:border-blue-500/30" },
              { label: "Documents Created", value: stats.totalDocuments.toLocaleString(), icon: FileText, trend: "+0%", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "group-hover:border-emerald-500/30" },
              { label: "Total Updates 今日", value: stats.recentActivityCount.toLocaleString(), icon: Zap, trend: "+0%", color: "text-amber-500", bg: "bg-amber-500/10", border: "group-hover:border-amber-500/30" },
              { label: "Portals Configured", value: stats.totalPortals.toLocaleString(), icon: GitCommit, trend: "+0%", color: "text-purple-500", bg: "bg-purple-500/10", border: "group-hover:border-purple-500/30" },
            ].map((metric, i) => (
              <div key={i} className={cn("relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-default", metric.border)}>
                <div className="absolute top-0 right-0 p-4 opacity-5 transition-transform duration-500 group-hover:scale-150 group-hover:opacity-10">
                  <metric.icon className="h-24 w-24" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-inner", metric.bg, metric.color)}>
                      <metric.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md tracking-wider">{metric.trend}</span>
                  </div>
                  <h3 className="text-3xl font-extrabold tracking-tight text-foreground">{metric.value}</h3>
                  <p className="text-sm font-semibold text-muted-foreground mt-1 uppercase tracking-wider">{metric.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Heatmap & Deep Dive (Left Column - 2 spans) */}
            <div className="xl:col-span-2 space-y-8">
               
               {/* 30-day Contribution Activity */}
              <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-sm relative overflow-hidden transition-all duration-500 hover:shadow-lg">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-transform duration-1000 group-hover/page:rotate-12">
                  <GitCommit className="h-[250px] w-[250px]" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 relative z-10 gap-4">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight">Activity Heatmap</h3>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Daily contributions over the last 30 days</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl shadow-sm border border-emerald-500/20">
                    <TrendingUp className="h-4 w-4" />
                    +24% this month
                  </div>
                </div>

                <div className="relative z-10 flex gap-2.5 flex-wrap">
                  {heatmapData.map((day, i) => (
                    <div 
                      key={i} 
                      title={`${day.count} contributions on ${day.date}`}
                      className={cn(
                        "h-8 w-8 rounded-lg transition-all duration-300 hover:scale-125 hover:shadow-xl cursor-crosshair",
                        day.count === 0 ? "bg-muted/40 border border-border/40" :
                        day.count === 1 ? "bg-primary/20 hover:bg-primary/30" :
                        day.count === 2 ? "bg-primary/50 hover:bg-primary/60" :
                        day.count === 3 ? "bg-primary/80 hover:bg-primary/90" :
                        "bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]"
                      )}
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-3 mt-8 text-xs font-medium text-muted-foreground relative z-10">
                  <span className="uppercase tracking-wider">Less</span>
                  <div className="flex gap-1.5">
                    <div className="h-4 w-4 rounded-md bg-muted/40 border border-border/40"></div>
                    <div className="h-4 w-4 rounded-md bg-primary/20"></div>
                    <div className="h-4 w-4 rounded-md bg-primary/50"></div>
                    <div className="h-4 w-4 rounded-md bg-primary/80"></div>
                    <div className="h-4 w-4 rounded-md bg-primary shadow-sm"></div>
                  </div>
                  <span className="uppercase tracking-wider">More</span>
                </div>
              </div>

            </div>

            {/* Timeline (Right Column) */}
            <div className="xl:col-span-1">
               <div className="rounded-3xl border border-border/80 bg-card flex flex-col h-full shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-border/50 bg-muted/20">
                    <h3 className="text-xl font-extrabold tracking-tight">Recent Activity</h3>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Live feed of document changes</p>
                 </div>
                 <div className="p-6 flex-1 overflow-y-auto max-h-[500px] xl:max-h-full scrollbar-thin">
                   <ActivityTimeline activities={mappedActivities} />
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
