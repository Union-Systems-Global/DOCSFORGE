import { AppLayout } from "@/components/layout/AppLayout";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { activities } from "@/data/mockData";

export default function ActivityPage() {
  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">Recent activity across all projects</p>
        </div>
        <div className="rounded border border-border bg-card p-4">
          <ActivityTimeline activities={activities} />
        </div>
      </div>
    </AppLayout>
  );
}
