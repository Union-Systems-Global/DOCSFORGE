import { FileText, Layout } from "lucide-react";
import { templates, type Template } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export function TemplateSelector({ open, onClose, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            Choose a Template
          </DialogTitle>
          <DialogDescription>
            Select a predefined structure to jumpstart your documentation.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className="w-full text-left bg-card p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/[0.02] hover:shadow-md transition-all duration-200 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-10 scale-150 group-hover:scale-100 transition-all duration-500">
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">{t.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{t.description}</p>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {t.sections.slice(0, 5).map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold uppercase tracking-wider group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {s}
                      </span>
                    ))}
                    {t.sections.length > 5 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                        +{t.sections.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
