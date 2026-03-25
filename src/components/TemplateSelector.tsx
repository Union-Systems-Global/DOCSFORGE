import { X, FileText } from "lucide-react";
import { templates, type Template } from "@/data/mockData";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export function TemplateSelector({ open, onClose, onSelect }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg w-full max-w-lg mx-4 shadow-lg animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-sm">Choose a Template</h2>
          <button onClick={onClose} className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className="w-full text-left p-3 rounded border border-border hover:border-primary/30 hover:bg-muted/50 transition-all"
            >
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-medium">{t.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {t.sections.slice(0, 4).map((s) => (
                      <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{s}</span>
                    ))}
                    {t.sections.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        +{t.sections.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
