import { AppLayout } from "@/components/layout/AppLayout";
import { usePortalStore, PortalUser, PortalType } from "@/stores/portalStore";
import { useState } from "react";
import { Copy, Plus, Building2, Code2, Link as LinkIcon, Check, Trash2, Edit2, Globe, Shield, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PortalSetupPage() {
  const { portals, addPortal, deletePortal, updatePortal } = usePortalStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [showAdd, setShowAdd] = useState(false);
  const [editingPortal, setEditingPortal] = useState<PortalUser | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "bank" as PortalType,
    bankCode: "",
    logoUrl: ""
  });

  const handleCopy = (id: string) => {
    const url = `${window.location.origin}/portal/${id}`;
    
    const performCopy = () => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(url);
      } else {
        // Fallback for local network testing (non-HTTPS)
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const successful = document.execCommand('copy');
          textArea.remove();
          if (successful) return Promise.resolve();
          return Promise.reject();
        } catch (error) {
          textArea.remove();
          return Promise.reject(error);
        }
      }
    };

    performCopy()
      .then(() => {
        setCopiedId(id);
        toast.success("Portal link copied to clipboard", {
          description: url,
        });
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch((err) => {
        console.error("Copy failed", err);
        toast.error("Failed to copy link. Please select the text manually.");
      });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      addPortal(formData.name.trim(), formData.type, formData.bankCode.trim(), formData.logoUrl.trim());
      setFormData({ name: "", type: "bank", bankCode: "", logoUrl: "" });
      setShowAdd(false);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPortal && formData.name.trim()) {
      updatePortal(editingPortal.id, {
        name: formData.name.trim(),
        bankCode: formData.bankCode.trim(),
        logoUrl: formData.logoUrl.trim()
      });
      setEditingPortal(null);
      setFormData({ name: "", type: "bank", bankCode: "", logoUrl: "" });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const openEdit = (portal: PortalUser) => {
    setEditingPortal(portal);
    setFormData({
      name: portal.name,
      type: portal.type,
      bankCode: portal.bankCode || "",
      logoUrl: portal.logoUrl || ""
    });
  };

  const banks = portals.filter(p => p.type === "bank");
  const devs = portals.filter(p => p.type === "developer");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6 sm:p-10 space-y-12 animate-in fade-in duration-500 pb-32">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Shield className="w-6 h-6 text-primary" />
               <span className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Access Management</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">Client Architecture</h1>
            <p className="text-muted-foreground mt-3 text-lg max-w-2xl leading-relaxed">
              Configure and distribute <span className="text-foreground font-bold italic">Unique Portal Links</span> for financial institutions and internal engineering departments.
            </p>
          </div>
          <button 
            onClick={() => {
              setFormData({ name: "", type: "bank", bankCode: "", logoUrl: "" });
              setShowAdd(true);
            }}
            className="shrink-0 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
          >
             <Plus className="w-5 h-5" /> Register New Portal
          </button>
        </div>

        {/* Form Modal for Add/Edit */}
        <Dialog open={showAdd || !!editingPortal} onOpenChange={(open) => { if(!open) { setShowAdd(false); setEditingPortal(null); } }}>
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
            <form onSubmit={editingPortal ? handleUpdate : handleAdd}>
               <div className="p-8 bg-gradient-to-br from-primary/10 via-background to-background">
                  <DialogHeader className="mb-8">
                    <DialogTitle className="text-2xl font-black tracking-tight">
                      {editingPortal ? `Edit ${editingPortal.name}` : "Portal Registration"}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium">
                      Configure the unique entry point and metadata for this portal.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="grid gap-2">
                       <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Portal Name</Label>
                       <Input 
                         required
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         className="h-12 rounded-xl bg-background border-border/60 focus:ring-primary/20" 
                         placeholder="e.g. Apex Global Bank" 
                       />
                    </div>

                    {!editingPortal && (
                      <div className="grid gap-2">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Access Type</Label>
                        <div className="grid grid-cols-2 gap-2 bg-muted/30 p-1 rounded-xl">
                           <button 
                             type="button"
                             onClick={() => setFormData({...formData, type: 'bank'})}
                             className={cn("h-10 rounded-lg text-xs font-bold transition-all", formData.type === 'bank' ? "bg-card text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground")}
                           >
                              Isolated Client
                           </button>
                           <button 
                             type="button"
                             onClick={() => setFormData({...formData, type: 'developer'})}
                             className={cn("h-10 rounded-lg text-xs font-bold transition-all", formData.type === 'developer' ? "bg-card text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground")}
                           >
                              Internal Dev
                           </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                       <div className="grid gap-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Universal Bank Code</Label>
                          <Input 
                            value={formData.bankCode}
                            onChange={(e) => setFormData({...formData, bankCode: e.target.value})}
                            className="h-12 rounded-xl bg-background border-border/60 focus:ring-primary/20" 
                            placeholder="e.g. ABK-001" 
                          />
                       </div>
                       <div className="grid gap-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Logo Identity</Label>
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-background border border-border/60 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                {formData.logoUrl ? (
                                  <img src={formData.logoUrl} className="w-full h-full object-cover" alt="preview" />
                                ) : (
                                  <Building2 className="w-6 h-6 text-muted-foreground/20" />
                                )}
                             </div>
                             <div className="flex-1 flex gap-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  className="h-12 flex-1 rounded-xl font-bold gap-2 text-xs"
                                  onClick={() => document.getElementById('logo-upload')?.click()}
                                >
                                   <Upload className="w-4 h-4" /> {formData.logoUrl ? "Change Logo" : "Upload Logo"}
                                </Button>
                                {formData.logoUrl && (
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    className="h-12 w-12 rounded-xl text-destructive"
                                    onClick={() => setFormData({...formData, logoUrl: ""})}
                                  >
                                     <X className="w-4 h-4" />
                                  </Button>
                                )}
                             </div>
                             <input 
                               id="logo-upload"
                               type="file" 
                               className="hidden" 
                               accept="image/*"
                               onChange={handleLogoUpload}
                             />
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

               <DialogFooter className="p-6 bg-muted/20 border-t border-border/40 gap-3">
                  <Button type="button" variant="ghost" onClick={() => { setShowAdd(false); setEditingPortal(null); }} className="font-bold rounded-xl h-12 px-6">Cancel</Button>
                  <Button type="submit" className="font-bold rounded-xl h-12 px-8 bg-primary shadow-lg shadow-primary/20">{editingPortal ? "Save Configuration" : "Authorize & Generate Link"}</Button>
               </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Portals List */}
        <div className="space-y-16">
           <PortalSection title="Client Institutions" icon={Building2} users={banks} copiedId={copiedId} onCopy={handleCopy} onDelete={deletePortal} onEdit={openEdit} />
           <PortalSection title="USG Software Developers" icon={Code2} users={devs} copiedId={copiedId} onCopy={handleCopy} onDelete={deletePortal} onEdit={openEdit} accent="indigo" />
        </div>
      </div>
    </AppLayout>
  );
}

function PortalSection({ title, icon: Icon, users, copiedId, onCopy, onDelete, onEdit, accent = "primary" }: any) {
  if (users.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-4 border-b border-border pb-6">
         <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", accent === "primary" ? "bg-primary/10 text-primary" : "bg-indigo-500/10 text-indigo-500")}>
            <Icon className="w-6 h-6" />
         </div>
         <div>
            <h2 className="text-2xl font-black tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground font-medium">Entities with active secure access portals.</p>
         </div>
      </div>

      <div className="grid gap-6">
        {users.map((user: PortalUser) => (
          <div key={user.id} className="relative group overflow-hidden rounded-[2rem] border border-border/60 bg-card p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 hover:border-border">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
               
               {/* Identity Card */}
               <div className="md:w-72 p-6 rounded-2xl bg-muted/30 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                     {user.logoUrl ? (
                       <img src={user.logoUrl} className="w-full h-full object-cover" alt="logo" />
                     ) : (
                       <Building2 className="w-6 h-6 text-muted-foreground/40" />
                     )}
                  </div>
                  <div className="min-w-0 flex-1">
                     <h3 className="font-extrabold text-lg text-foreground break-words">{user.name}</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-0.5">{user.bankCode || "NO CODE SET"}</p>
                  </div>
               </div>

               {/* Link Management */}
               <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Unique Portal Link</span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 group/link">
                     <div className="flex-1 min-h-[3rem] bg-muted/40 rounded-xl px-4 py-3 flex items-center border border-border/40 font-mono text-xs text-muted-foreground break-all select-all">
                        {`${window.location.origin}/portal/${user.id}`}
                     </div>
                     <button 
                       onClick={() => onCopy(user.id)}
                       className={cn(
                         "h-12 px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm",
                         copiedId === user.id ? "bg-emerald-500 text-white" : "bg-card border border-border hover:bg-muted"
                       )}
                     >
                       {copiedId === user.id ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                     </button>
                  </div>
               </div>

               {/* Actions */}
               <div className="flex items-center gap-2 md:pr-4">
                  <button onClick={() => onEdit(user)} className="h-12 w-12 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all group/edit shadow-sm border border-border/50">
                     <Edit2 className="w-4 h-4 transition-transform group-hover/edit:scale-110" />
                  </button>
                  <button onClick={() => { if(confirm('Permanently revoke this portal access?')) onDelete(user.id) }} className="h-12 w-12 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-destructive/10 hover:text-destructive transition-all group/del shadow-sm border border-border/50">
                     <Trash2 className="w-4 h-4 transition-transform group-hover/del:scale-110" />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
