import { AppLayout } from "@/components/layout/AppLayout";
import { templates } from "@/data/mockData";
import { FileText } from "lucide-react";

export default function TemplatesPage() {
  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Start new documentation from predefined templates</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((t) => (
            <div key={t.id} className="p-4 rounded border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
              <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">{t.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
              <div className="flex gap-1 mt-3 flex-wrap">
                {t.sections.map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
