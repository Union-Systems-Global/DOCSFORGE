import { AppLayout } from "@/components/layout/AppLayout";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your workspace preferences</p>
        </div>

        <div className="space-y-4">
          <div className="rounded border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-1">Profile</h3>
            <p className="text-xs text-muted-foreground mb-4">Manage your account settings</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Display Name</label>
                <input className="mt-1 w-full h-9 px-3 rounded border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="Sarah Chen" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <input className="mt-1 w-full h-9 px-3 rounded border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="sarah.chen@company.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Team</label>
                <input className="mt-1 w-full h-9 px-3 rounded border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary" defaultValue="Engineering" />
              </div>
            </div>
          </div>

          <div className="rounded border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-1">Notifications</h3>
            <p className="text-xs text-muted-foreground mb-4">Configure how you receive updates</p>
            <div className="space-y-3">
              {["Document updates", "New project created", "Version published", "Comment mentions"].map((item) => (
                <label key={item} className="flex items-center justify-between">
                  <span className="text-sm">{item}</span>
                  <div className="h-5 w-9 rounded-full bg-primary relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-primary-foreground transition-transform" />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
