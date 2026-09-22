import { AppLayout } from "@/components/layout/AppLayout";
import { useDocumentStore, DocumentNode, SavedDocument } from "@/stores/documentStore";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight, FileText, Plus, FolderOpen, Folder, History, Pencil, Trash2, Clock, Building2, ChevronDown, Eye, EyeOff, CheckCircle2, AlertCircle, Settings2, X, Globe, Users, Check, Link2 } from "lucide-react";
import { usePortalStore } from "@/stores/portalStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SidebarSkeleton, ContentSkeleton, ElegantLoader } from "@/components/SkeletonLoaders";

function CategoryHubView({ 
  category, 
  documents, 
  onSelectDoc, 
  onNewDoc,
  publishDocument,
  navigate,
  onOpenDestination
}: { 
  category: SavedDocument, 
  documents: SavedDocument[], 
  onSelectDoc: (id: string) => void, 
  onNewDoc: () => void,
  publishDocument: (id: string, published: boolean) => Promise<void>,
  navigate: (path: string) => void,
  onOpenDestination: (doc: SavedDocument) => void
}) {
  const children = documents.filter(d => d.parentId === category.id).sort((a,b) => {
    if (a.isVersion && b.isVersion) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    return a.title.localeCompare(b.title)
  });

  return (
    <div className="flex-1 overflow-auto bg-muted/10 pb-20 animate-in fade-in duration-500">
      {/* Massive Glowing Header */}
      <div className="relative overflow-hidden bg-card border-b border-border p-12 lg:p-16 mb-8 group shadow-sm z-10">
         <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5" />
         <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors duration-1000" />
         
         <div className="relative z-10 max-w-5xl mx-auto flex items-center gap-6 md:gap-8">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500">
               <FolderOpen className="w-10 h-10 md:w-14 md:h-14" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-3.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest shadow-sm">
                Category Hub
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">{category.title}</h1>
              
              <div className="flex items-center gap-2 mt-6 flex-wrap">
                 <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border/40">
                    <FileText className="w-4 h-4 text-primary opacity-80" /> {children.length} Documents inside
                 </div>
                 {category.isPublished ? (
                    <div className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-500/10 text-emerald-500 uppercase tracking-widest flex items-center gap-2 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Published Category
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-lg text-xs font-black bg-amber-500/10 text-amber-500 uppercase tracking-widest flex items-center gap-2 border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5" /> Draft Category
                    </div>
                  )}
              </div>
            </div>
            
            <div className="flex flex-col gap-2 ml-auto shrink-0">
              <button 
                onClick={() => publishDocument(category.id, !category.isPublished)}
                className={cn(
                  "h-12 px-6 rounded-2xl text-sm font-black transition-all shadow-xl active:scale-95 flex items-center gap-2",
                  category.isPublished 
                    ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20" 
                    : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
                )}
              >
                {category.isPublished ? (
                  <><EyeOff className="w-5 h-5" /> Unpublish Category</>
                ) : (
                  <><Eye className="w-5 h-5" /> Publish Category</>
                )}
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onOpenDestination(category)}
                  className="h-10 flex-1 px-4 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 text-muted-foreground"
                >
                  <Settings2 className="w-4 h-4" /> Destination
                </button>
                <button 
                  onClick={() => navigate(`/create-new?edit=${category.id}`)}
                  className="h-10 flex-1 px-4 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
              </div>
            </div>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <h2 className="text-xl font-bold tracking-tight">Documents in {category.title}</h2>
           <button 
             onClick={onNewDoc}
             className="px-4 py-2 bg-primary/10 text-primary font-bold text-sm rounded-xl hover:bg-primary/20 transition-all flex items-center gap-2 active:scale-95"
           >
              <Plus className="w-4 h-4" /> New Document Here
           </button>
        </div>

        {children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => onSelectDoc(child.id)}
                className="text-left group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10 flex flex-col h-full">
                   <div className="flex items-start justify-between mb-4">
                     <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors shadow-sm">
                        {child.isVersion ? <History className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" /> : <FileText className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />}
                     </div>
                     <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                   </div>
                   
                   <h3 className="font-bold text-lg text-foreground tracking-tight group-hover:text-primary transition-colors line-clamp-1">{child.title}</h3>
                   <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed flex-1">
                     {child.subtitle || (child.content ? child.content.replace(/<[^>]*>?/gm, '').substring(0, 90) + '...' : '')}
                   </p>
                   
                    <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         {child.isPublished ? (
                           <div className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                             <CheckCircle2 className="w-2.5 h-2.5" /> Published
                           </div>
                         ) : (
                           <div className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/10 text-amber-500 uppercase tracking-widest flex items-center gap-1">
                             <Clock className="w-2.5 h-2.5" /> Draft
                           </div>
                         )}
                         {child.isVersion && (
                           <div className="px-2 py-0.5 rounded text-[9px] font-black bg-primary/10 text-primary uppercase tracking-widest">
                             Version
                           </div>
                         )}
                       </div>
                       {child.activityCode && (
                          <div className="text-[10px] font-black text-primary/60 uppercase tracking-tighter bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                            {child.activityCode}
                          </div>
                        )}
                    </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/30 rounded-[2rem] border-2 border-dashed border-border/60">
             <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 shadow-inner cursor-pointer" onClick={onNewDoc}>
                <Plus className="w-10 h-10 text-muted-foreground/50 hover:text-primary transition-colors group-hover:scale-110" />
             </div>
             <h3 className="text-2xl font-extrabold mb-2 tracking-tight">It's empty here!</h3>
             <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">This category is currently empty. Click the big plus icon or the button above to spawn your very first document.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TreeItem({
  node,
  depth,
  activeId,
  onSelect,
  onRename,
  onDelete,
}: {
  node: DocumentNode;
  depth: number;
  activeId: string;
  onSelect: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  
  const hasChildren = node.children.length > 0;
  const isActive = activeId === node.id;
  const isCategory = depth === 0;
  const isVersion = node.isVersion;

  const handleRenameSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (editTitle.trim() && editTitle !== node.title) {
      onRename(node.id, editTitle.trim());
    } else {
      setEditTitle(node.title);
    }
    setIsEditing(false);
  };

  return (
    <div className="mb-0.5">
      <div
        onClick={() => onSelect(node.id)}
        className={cn(
          "flex items-center gap-1.5 py-1.5 px-2 rounded-md text-sm cursor-pointer group transition-all duration-200",
          isActive 
            ? "bg-primary/10 text-primary font-medium shadow-sm" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <div className="flex items-center justify-center w-4 h-4 shrink-0">
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="hover:bg-accent rounded transition-colors"
            >
              <ChevronRight className={cn("h-3.5 w-3.5 transition-transform duration-200", expanded && "rotate-90", isActive ? "text-primary" : "text-muted-foreground/70")} />
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-center w-4 h-4 shrink-0 mx-0.5">
          {isCategory ? (
            <Folder className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground/60", expanded ? "fill-primary/20" : "")} />
          ) : isVersion ? (
            <History className={cn("h-3.5 w-3.5", isActive ? "text-primary bg-primary/10 rounded-sm" : "text-muted-foreground/50")} />
          ) : (
            <FileText className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground/60")} />
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1">
          {isEditing ? (
            <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleRenameSubmit}
                className="w-full bg-background text-foreground text-xs px-1.5 py-0.5 rounded outline-none ring-1 ring-primary/50 font-normal"
              />
            </form>
          ) : (
            <>
              <span className={cn("break-words leading-tight", isCategory ? "font-semibold py-0.5" : isVersion ? "text-xs italic" : "font-medium")}>
                {node.title}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {!isCategory && !isVersion && (
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-tighter px-1 rounded-sm",
                    node.isPublished ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                  )}>
                    {node.isPublished ? "P" : "D"}
                  </span>
                )}
                {node.subtitle && (!isCategory && !isVersion) && (
                  <span className="text-[10px] opacity-60 break-words font-normal leading-tight">
                    {node.subtitle}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded mr-0.5"
              title="Rename"
            >
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (confirm(`Are you sure you want to delete "${node.title}"${hasChildren ? ' and all its contents' : ''}?`)) {
                  onDelete(node.id);
                }
              }}
              className="p-1 hover:bg-red-500/10 rounded"
              title="Delete"
            >
              <Trash2 className="h-3 w-3 text-red-500/70 hover:text-red-600" />
            </button>
          </div>
        )}
      </div>
      {hasChildren && expanded && (
        <div className="mt-0.5 border-l border-border/40 ml-4 pl-1">
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} activeId={activeId} onSelect={onSelect} onRename={onRename} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const navigate = useNavigate();
  const documents = useDocumentStore((s) => s.documents);
  const isLoading = useDocumentStore((s) => s.isLoading);
  const getDocumentTree = useDocumentStore((s) => s.getDocumentTree);
  const getDocument = useDocumentStore((s) => s.getDocument);
  const renameDocument = useDocumentStore((s) => s.renameDocument);
  const deleteDocument = useDocumentStore((s) => s.deleteDocument);
  const publishDocument = useDocumentStore((s) => s.publishDocument);
  const updateDocument = useDocumentStore((s) => s.updateDocument);
  const [activeId, setActiveId] = useState("");
  const [isContentLoading, setIsContentLoading] = useState(false);

  useEffect(() => {
    if (activeId) {
      const doc = getDocument(activeId);
      if (doc && doc.content === undefined) {
        setIsContentLoading(true);
        useDocumentStore.getState().fetchDocumentContent(activeId)
          .finally(() => setIsContentLoading(false));
      }
    }
  }, [activeId, getDocument]);
  const { getBanks, portals } = usePortalStore();
  const banks = getBanks();
  const allPortals = portals;

  // Copy the shareable activity-code URL for the active document
  const copyDocLink = (doc: SavedDocument) => {
    const portal = portals.find(p => p.id === doc.bankId || doc.assignedBanks?.split(',').includes(p.id));
    if (!portal) {
      toast.error("No portal found for this document.");
      return;
    }
    const base = `${window.location.origin}/portal/${portal.id}/docs`;
    const query = doc.activityCode
      ? encodeURIComponent(doc.activityCode)
      : `docId=${doc.id}`;
    const url = `${base}?${query}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied!", { description: url });
    }).catch(() => {
      toast.error("Could not copy — here is the link:", { description: url });
    });
  };
  const [activeBankId, setActiveBankId] = useState<string>("all");

  // Destination Settings Dialog State
  const [destDoc, setDestDoc] = useState<SavedDocument | null>(null);
  const [destVisibility, setDestVisibility] = useState<'all' | 'specific'>('specific');
  const [destSelectedBanks, setDestSelectedBanks] = useState<string[]>([]);

  const openDestination = (doc: SavedDocument) => {
    setDestDoc(doc);
    setDestVisibility(doc.visibility || 'specific');
    const currentBanks = doc.assignedBanks ? doc.assignedBanks.split(',').filter(Boolean) : [];
    setDestSelectedBanks(currentBanks);
  };

  const toggleBank = (bankId: string) => {
    setDestSelectedBanks(prev => 
      prev.includes(bankId) ? prev.filter(id => id !== bankId) : [...prev, bankId]
    );
  };

  const saveDestination = async () => {
    if (!destDoc) return;
    try {
      await updateDocument(destDoc.id, {
        visibility: destVisibility,
        assignedBanks: destVisibility === 'all' ? null : destSelectedBanks.join(',')
      });
      toast.success("Destination settings saved successfully!");
      setDestDoc(null);
    } catch (e) {
      toast.error("Failed to update destination settings.");
    }
  };

  const tree = useMemo(() => {
    return getDocumentTree(activeBankId === "all" ? undefined : activeBankId);
  }, [documents, getDocumentTree, activeBankId]);

  useEffect(() => {
    if (!activeId && tree.length > 0) {
      setActiveId(tree[0].id);
    }
  }, [tree, activeId]);

  const activeDoc = activeId ? getDocument(activeId) : undefined;

  // Determine if active doc is a root-level "Title Container"
  const isRootContainer = activeDoc && (!activeDoc.parentId || !documents.some(d => d.id === activeDoc.parentId));

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Mini sidebar with document tree */}
        <div className="w-72 shrink-0 border-r border-border bg-card/50 backdrop-blur-sm overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-card z-10 sticky top-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">Documents</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Workspace</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/create-new")}
              className="h-8 w-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md active:scale-95"
              title="Create new document"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Bank Filter */}
          <div className="p-3 border-b border-border bg-muted/20">
             <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 mb-1.5 block">Filter by Bank</label>
             <Select value={activeBankId} onValueChange={setActiveBankId}>
                <SelectTrigger className="h-9 text-xs bg-card border-border/50 shadow-none">
                   <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-primary/70" />
                      <SelectValue placeholder="All Banks" />
                   </div>
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="all">All Banks</SelectItem>
                   {banks.map(bank => (
                     <SelectItem key={bank.id} value={bank.id}>{bank.name}</SelectItem>
                   ))}
                </SelectContent>
             </Select>
          </div>
          <div className="flex-1 p-3 space-y-1">
            {isLoading && tree.length === 0 ? (
              <SidebarSkeleton />
            ) : tree.length === 0 ? (
              <div className="text-center py-12 px-4 text-sm text-muted-foreground">
                <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-6 w-6 opacity-40" />
                </div>
                <p className="font-medium">No documents found</p>
                <p className="text-xs mt-1 text-muted-foreground/70">Start by creating your first technical doc.</p>
                <button
                  onClick={() => navigate("/create-new")}
                  className="mt-4 px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-primary text-xs font-semibold transition-colors"
                >
                  Create Document
                </button>
              </div>
            ) : (
              tree.map((node) => (
                <TreeItem 
                  key={node.id} 
                  node={node} 
                  depth={0} 
                  activeId={activeId} 
                  onSelect={setActiveId} 
                  onRename={renameDocument}
                  onDelete={(id) => {
                    deleteDocument(id);
                    if (activeId === id || activeDoc?.parentId === id) {
                      setActiveId("");
                    }
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* Content viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/5 relative">
          {isLoading && !activeDoc ? (
            <ContentSkeleton />
          ) : activeDoc ? (
            // Root-level docs (Title Containers) ALWAYS get the CategoryHubView
            isRootContainer ? (
              <CategoryHubView 
                category={activeDoc} 
                documents={documents} 
                onSelectDoc={setActiveId} 
                onNewDoc={() => navigate("/create-new")} 
                publishDocument={publishDocument}
                navigate={navigate}
                onOpenDestination={openDestination}
              />
            ) : (
              <>
                <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-card shadow-sm z-10 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-foreground">{activeDoc.title}</h1>
                      {activeDoc.subtitle && (
                        <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {activeDoc.subtitle}
                        </span>
                      )}
                      {activeDoc.activityCode && (
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20">
                          {activeDoc.activityCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        By <span className="text-foreground">{activeDoc.author}</span>
                      </span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span>
                        Updated {new Date(activeDoc.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => publishDocument(activeDoc.id, !activeDoc.isPublished)}
                        className={cn(
                          "h-10 px-5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2",
                          activeDoc.isPublished 
                            ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20" 
                            : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20 shadow-lg"
                        )}
                      >
                        {activeDoc.isPublished ? (
                          <><EyeOff className="w-4 h-4" /> Unpublish Content</>
                        ) : (
                          <><Eye className="w-4 h-4" /> Publish to Client</>
                        )}
                      </button>
                      <button 
                        onClick={() => openDestination(activeDoc)}
                        className="h-10 px-5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2 text-muted-foreground"
                      >
                        <Settings2 className="w-4 h-4" /> Destination Settings
                      </button>
                      <button 
                        onClick={() => copyDocLink(activeDoc)}
                        className="h-10 px-5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2 text-muted-foreground"
                        title={activeDoc.activityCode ? `Copy link: ?${activeDoc.activityCode}` : 'Copy link (no activity code set)'}
                      >
                        <Link2 className="w-4 h-4" /> Copy Link
                      </button>
                      <button 
                        onClick={() => navigate(`/create-new?edit=${activeDoc.id}`)}
                        className="h-10 px-5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" /> Edit Document
                      </button>
                    </div>
                </div>
                 <div className="flex-1 overflow-auto py-8 animate-in fade-in duration-700">
                   <div className="max-w-[850px] mx-auto bg-card rounded-2xl shadow-xl shadow-black/5 border border-border/50 min-h-[800px] overflow-hidden">
                     {isContentLoading || activeDoc.content === undefined ? (
                       <div className="p-16">
                         <ContentSkeleton />
                       </div>
                     ) : (
                       <div
                         className="px-16 py-12 text-sm leading-relaxed prose prose-slate max-w-none
                           dark:prose-invert
                           [&>h1]:text-3xl [&>h1]:font-extrabold [&>h1]:mt-10 [&>h1]:mb-6 [&>h1]:tracking-tight
                           [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4
                           [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3
                           [&>p]:mb-5 [&>p]:text-foreground/80 [&>p]:text-[15px]
                           [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-5 [&>ul]:text-foreground/80 [&>ul]:space-y-2
                           [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-5 [&>ol]:text-foreground/80 [&>ol]:space-y-2
                           [&>pre]:bg-slate-900 [&>pre]:text-slate-100 [&>pre]:p-5 [&>pre]:rounded-xl [&>pre]:font-mono [&>pre]:text-[13px] [&>pre]:mb-6 [&>pre]:shadow-inner
                           [&>blockquote]:border-l-4 [&>blockquote]:border-primary/50 [&>blockquote]:bg-primary/5 [&>blockquote]:p-5 [&>blockquote]:rounded-r-xl [&>blockquote]:italic [&>blockquote]:text-foreground/80 [&>blockquote]:mb-6
                           [&>hr]:my-10 [&>hr]:border-border"
                         onClick={(e) => {
                            const target = e.target as HTMLElement;
                            const badge = target.closest(".sub-activity-badge");
                            if (badge && activeDoc) {
                              const code = badge.getAttribute("data-code");
                              if (code) {
                                const portal = allPortals.find(p => p.id === activeDoc.bankId || activeDoc.assignedBanks?.split(',').includes(p.id)) || allPortals[0];
                                if (portal) {
                                  const base = `${window.location.origin}/portal/${portal.id}/docs`;
                                  const url = `${base}?${encodeURIComponent(code)}`;
                                  navigator.clipboard.writeText(url).then(() => {
                                    toast.success("Link copied!", {
                                      description: url,
                                    });
                                  }).catch(() => {
                                    toast.error("Could not copy — here is the link:", {
                                      description: url,
                                    });
                                  });
                                }
                              }
                            }
                          }}
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(activeDoc.content) }}
                       />
                     )}
                   </div>
                 </div>
              </>
            )
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a document to view</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Destination Settings Dialog ─── */}
      <Dialog open={!!destDoc} onOpenChange={(open) => !open && setDestDoc(null)}>
        <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          <div className="p-8 bg-gradient-to-br from-primary/5 via-background to-background">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Settings2 className="w-5 h-5" />
                </div>
                Destination Settings
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                Control which client portals can access <span className="font-bold text-foreground">"{destDoc?.title}"</span>.
              </DialogDescription>
            </DialogHeader>

            {/* Visibility Mode Toggle */}
            <div className="mb-6 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Access Mode</label>
              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-1.5 rounded-xl">
                <button
                  onClick={() => setDestVisibility('all')}
                  className={cn(
                    "h-11 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                    destVisibility === 'all' 
                      ? "bg-card text-foreground shadow-sm ring-1 ring-border/50" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Globe className="w-4 h-4" /> All Clients
                </button>
                <button
                  onClick={() => setDestVisibility('specific')}
                  className={cn(
                    "h-11 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                    destVisibility === 'specific' 
                      ? "bg-card text-foreground shadow-sm ring-1 ring-border/50" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Users className="w-4 h-4" /> Specific Clients
                </button>
              </div>
            </div>

            {/* Client Selection List */}
            {destVisibility === 'specific' && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Select Portals ({destSelectedBanks.length} selected)
                </label>
                <div className="max-h-[280px] overflow-y-auto space-y-2 rounded-xl border border-border/50 bg-card p-3 scrollbar-thin">
                  {allPortals.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      <Building2 className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No portals configured</p>
                      <p className="text-xs mt-1">Create portals in Client Setup first.</p>
                    </div>
                  ) : (
                    allPortals.map(portal => {
                      const isSelected = destSelectedBanks.includes(portal.id);
                      return (
                        <button
                          key={portal.id}
                          onClick={() => toggleBank(portal.id)}
                          className={cn(
                            "w-full flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-200 text-left group",
                            isSelected 
                              ? "bg-primary/5 border-primary/30 shadow-sm" 
                              : "bg-background border-border/50 hover:border-border hover:bg-muted/30"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                            isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            {portal.logoUrl ? (
                              <img src={portal.logoUrl} className="w-full h-full object-cover rounded-xl" alt="" />
                            ) : (
                              <Building2 className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-bold text-sm truncate transition-colors",
                              isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                              {portal.name}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                              {portal.bankCode || portal.type}
                            </p>
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all",
                            isSelected 
                              ? "bg-primary border-primary text-primary-foreground shadow-sm" 
                              : "border-border/60 bg-background"
                          )}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {destVisibility === 'all' && (
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 flex items-start gap-3">
                <Globe className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-foreground">Universal Access Enabled</p>
                  <p className="text-xs text-muted-foreground mt-1">This document will be visible to all configured client portals without restriction.</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-muted/20 border-t border-border/40 gap-3">
            <Button type="button" variant="ghost" onClick={() => setDestDoc(null)} className="font-bold rounded-xl h-12 px-6">
              Cancel
            </Button>
            <Button onClick={saveDestination} className="font-bold rounded-xl h-12 px-8 bg-primary shadow-lg shadow-primary/20">
              Save Destination
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Administrative Loading Overlay */}
      {isLoading && documents.length === 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/10 backdrop-blur-[2px]">
           <ElegantLoader label="Listing Documents" />
        </div>
      )}
    </AppLayout>
  );
}

// Simple markdown-to-HTML renderer for display
function renderMarkdown(md: string): string {
  let html = md;
  if (!md.startsWith("<")) {
    html = md
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/((<li>.*<\/li>\n?)+)/g, '<ul>$&</ul>')
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/^(?!<[hupol]|<li|<bl|<co|<st|<em|<ul|<hr)(.*\S.*)$/gm, '<p>$1</p>')
      .replace(/\n{2,}/g, '\n');
  }

  // Post-process to find parent elements that contain a sub-activity code like (CDB)
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const container = doc.body.firstChild as HTMLElement;
    
    if (container) {
      const elements = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, td"));
      elements.forEach((el) => {
        const htmlContent = el.innerHTML;
        const match = htmlContent.match(/\(([a-zA-Z0-9_-]{2,20})\)/);
        if (match) {
          const code = match[1];
          const badgeHtml = `<span class="sub-activity-badge cursor-pointer inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all select-none ml-2" data-code="${code}" title="Click to copy deep link">(${code})</span>`;
          el.innerHTML = htmlContent.replace(/\(([a-zA-Z0-9_-]{2,20})\)/g, badgeHtml);
        }
      });
      return container.innerHTML;
    }
  } catch (err) {
    console.error("Error decorating sub-activity codes in admin view:", err);
  }

  return html;
}

