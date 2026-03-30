import { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTemplateStore } from "@/stores/templateStore";
import { FileText, Plus, Sparkles, LayoutTemplate, Layers, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDocumentStore } from "@/stores/documentStore";

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { getAllTemplates, fetchTemplates, addCustomTemplate, deleteCustomTemplate } = useTemplateStore();
  const { fetchDocuments } = useDocumentStore();
  
  const allTemplates = getAllTemplates();
  const [filter, setFilter] = useState("All");
  
  // Custom Template Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSections, setNewSections] = useState("");
  const [newCategory, setNewCategory] = useState("Engineering");
  
  // Preview Modal State
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  useEffect(() => {
    fetchTemplates();
    fetchDocuments();
  }, [fetchTemplates, fetchDocuments]);

  const categories = useMemo(() => {
    const cats = ["All", "Standard"];
    allTemplates.forEach(t => {
      if (t.category && !cats.includes(t.category)) {
        cats.push(t.category);
      }
    });
    return cats;
  }, [allTemplates]);

  const filteredTemplates = useMemo(() => {
    if (filter === "All") return allTemplates;
    return allTemplates.filter(t => t.category === filter || (filter === "Standard" && !t.isCustom));
  }, [allTemplates, filter]);

  const handleCreateCustom = async () => {
    if (!newTitle.trim()) {
      toast.error("Template name is required.");
      return;
    }
    const sectionsArray = newSections.split(",").map(s => s.trim()).filter(Boolean);
    
    await addCustomTemplate({
      name: newTitle.trim(),
      description: newDesc.trim() || "A custom user-defined template.",
      sections: sectionsArray.length > 0 ? sectionsArray : ["Draft"],
      category: newCategory
    });
    
    toast.success("Custom template created successfully!");
    setIsModalOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewSections("");
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this custom template?")) {
      await deleteCustomTemplate(id);
      toast.success("Template deleted.");
      if (previewTemplate?.id === id) setPreviewTemplate(null);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen bg-background pb-20">
        {/* Animated Hero Section */}
        <div className="relative overflow-hidden border-b border-border bg-card/40 pb-16 pt-24 text-center">
          <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 flex justify-center pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[100px]" />
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[100px]" />
          </div>
          <div className="relative z-10 mx-auto max-w-3xl px-6">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur-md shadow-sm">
              <Sparkles className="h-4 w-4" />
              <span>Accelerate your documentation</span>
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl drop-shadow-sm">
              Start brilliant ideas with <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">Templates</span>
            </h1>
            <p className="text-lg text-muted-foreground mx-auto max-w-2xl leading-relaxed">
              Choose from our professionally structured blueprints or build your own high-fidelity custom templates to ensure standardization across your entire team.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-6 pt-12">
          {/* Filters & Actions */}
          <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 bg-card p-1.5 rounded-xl border border-border shadow-sm">
              {categories.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                    filter === f 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Blank Canvas for Templates */}
            <div 
              onClick={() => navigate('/create-new?mode=template')} 
              className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-border/60 bg-transparent p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-primary/5 hover:shadow-xl cursor-pointer flex flex-col items-center justify-center text-center min-h-[240px]"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20">
                <Plus className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-extrabold text-foreground tracking-tight">Blank Canvas</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-[200px]">Start an entirely new custom template from scratch in the rich editor.</p>
            </div>

            {/* Create Custom Template Card */}
            <div 
              onClick={() => setIsModalOpen(true)} 
              className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 cursor-pointer flex flex-col justify-center min-h-[240px]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20">
                <LayoutTemplate className="h-24 w-24 text-primary" />
              </div>
              <div className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-extrabold text-foreground tracking-tight mb-2">Build Custom</h3>
                <p className="text-sm text-muted-foreground">Design your own reusable boilerplate specifically tailored for your team's workflow.</p>
              </div>
            </div>

            {/* Template Cards */}
            {filteredTemplates.map((t) => (
              <div 
                key={t.id}
                onClick={() => setPreviewTemplate(t)}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/40 cursor-pointer flex flex-col justify-between min-h-[240px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-inner group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      {t.isCustom && (
                        <span className="px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wider">
                          Custom
                        </span>
                      )}
                      {t.isCustom && (
                        <button 
                          onClick={(e) => handleDelete(e, t.id)}
                          className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{t.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{t.description}</p>
                </div>
                
                <div className="relative z-10 mt-6 flex flex-wrap gap-1.5">
                  {t.sections.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-md bg-muted/80 px-2 py-1 text-[10px] font-medium text-muted-foreground border border-border/50">
                      {s}
                    </span>
                  ))}
                  {t.sections.length > 3 && (
                    <span className="rounded-md bg-muted/80 px-2 py-1 text-[10px] font-medium text-muted-foreground border border-border/50">
                      +{t.sections.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Custom Template Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">New Custom Template</DialogTitle>
            <DialogDescription>
              Define the structure and metadata for your new reusable template.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="t-name">Template Name</Label>
              <Input
                id="t-name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Weekly Status Report"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="t-desc">Description (Optional)</Label>
              <Textarea
                id="t-desc"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Briefly describe what this template is used for..."
                className="resize-none h-20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="t-sec">Required Sections (Comma Separated)</Label>
              <Input
                id="t-sec"
                value={newSections}
                onChange={(e) => setNewSections(e.target.value)}
                placeholder="e.g. Summary, Updates, Blockers"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="t-cat">Category</Label>
              <div className="flex gap-2">
                {["Engineering", "Product", "HR"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNewCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-md border transition-all",
                      newCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:bg-muted border-border"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCustom}>Save Template Quick</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-border/60">
          <div className="bg-muted/30 p-8 border-b border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <LayoutTemplate className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <FileText className="h-6 w-6" />
                 </div>
                 {previewTemplate?.isCustom && (
                   <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-wider border border-indigo-500/20">
                     Custom Template
                   </span>
                 )}
              </div>
              <DialogTitle className="text-3xl font-extrabold tracking-tight mb-2">{previewTemplate?.name}</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">{previewTemplate?.description}</DialogDescription>
            </div>
          </div>
          
          <div className="p-8">
            <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Template Structure</h4>
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin">
               {previewTemplate?.sections?.map((s: string, i: number) => (
                 <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary/40" />
                    <span className="font-medium text-foreground">{s}</span>
                 </div>
               ))}
               {!previewTemplate?.sections?.length && (
                 <div className="text-sm text-muted-foreground italic">This template has freeform rich-text content without explicitly defined sections.</div>
               )}
            </div>
          </div>
          
          <DialogFooter className="p-6 pt-0 border-t-0">
             <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Cancel</Button>
             <Button onClick={() => navigate(`/create-new?template=${previewTemplate?.id}`)} className="gap-2 font-bold shadow-md">
                Use This Template <Plus className="h-4 w-4" />
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
