import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { usePortalStore } from "@/stores/portalStore";
import { useDocumentStore, DocumentNode, SavedDocument } from "@/stores/documentStore";
import { useEffect, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { 
  ChevronRight, 
  Search, 
  FileText, 
  Menu, 
  X, 
  Building2, 
  ChevronDown, 
  Globe,
  ExternalLink,
  Github,
  Moon,
  Sun,
  Layout,
  Layers,
  Check
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AIAssistant } from "@/components/AIAssistant";
import { GlobalSearch } from "@/components/GlobalSearch";
import { 
  SidebarSkeleton, 
  ContentSkeleton, 
  TocSkeleton, 
  HeaderSkeleton,
  Skeleton,
  ElegantLoader
} from "@/components/SkeletonLoaders";
import { motion, AnimatePresence } from "framer-motion";

import { toast } from "sonner";
import { api } from "@/lib/api";

// --- Simple Markdown/HTML Parser Helper ---
const slugify = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

const renderDocHtml = (content?: string) => {
  if (!content) return "";
  
  let html = content;
  
  // 1. If it's Markdown, convert to HTML first with placeholders
  if (!content.trim().startsWith("<")) {
    html = html
      .replace(/^### (.+)$/gm, (match, text) => `<h3 id="${slugify(text)}" class="text-xl font-bold mt-8 mb-4">${text}</h3>`)
      .replace(/^## (.+)$/gm, (match, text) => `<h2 id="${slugify(text)}" class="text-2xl font-bold mt-10 mb-6 pb-2 border-b">${text}</h2>`)
      .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-extrabold mt-12 mb-8 tracking-tight">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 mb-2">$1</li>')
      .replace(/\n\n/g, '<p class="mb-5 leading-relaxed text-muted-foreground"></p>');
  } else {
    // 2. If it's already HTML, ensure h1, h2 and h3 have IDs
    html = html.replace(/<h1([^>]*)>(.*?)<\/h1>/gi, (match, attrs, text) => {
      if (attrs.includes('id=')) return match;
      const strippedText = text.replace(/<[^>]*>?/gm, ''); // Strip inner HTML for slug
      return `<h1 id="${slugify(strippedText)}" ${attrs}>${text}</h1>`;
    });

    html = html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attrs, text) => {
      if (attrs.includes('id=')) return match;
      const strippedText = text.replace(/<[^>]*>?/gm, ''); // Strip inner HTML for slug
      return `<h2 id="${slugify(strippedText)}" ${attrs}>${text}</h2>`;
    });
    
    html = html.replace(/<h3([^>]*)>(.*?)<\/h3>/gi, (match, attrs, text) => {
      if (attrs.includes('id=')) return match;
      const strippedText = text.replace(/<[^>]*>?/gm, ''); // Strip inner HTML for slug
      return `<h3 id="${slugify(strippedText)}" ${attrs}>${text}</h3>`;
    });
  }
  
  // 3. Post-process to find parent elements that contain a sub-activity code like (CDB)
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
    const container = doc.body.firstChild as HTMLElement;
    
    if (container) {
      const elements = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6, p, li, td"));
      elements.forEach((el) => {
        const htmlContent = el.innerHTML;
        // Regex to find (CODE) where CODE is 2 to 20 alphanumeric characters
        const match = htmlContent.match(/\(([a-zA-Z0-9_-]{2,20})\)/);
        if (match) {
          const code = match[1];
          const codeLower = code.toLowerCase();
          
          if (!el.id) {
            el.setAttribute("id", codeLower);
          }
          
          const badgeHtml = `<span class="sub-activity-badge cursor-pointer inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all select-none ml-2" data-code="${code}" title="Click to copy deep link">(${code})</span>`;
          el.innerHTML = htmlContent.replace(/\(([a-zA-Z0-9_-]{2,20})\)/g, badgeHtml);
        }
      });
      
      return container.innerHTML;
    }
  } catch (err) {
    console.error("Error decorating sub-activity codes:", err);
  }

  return html;
};

export default function DocsViewer() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const urlDocId = searchParams.get("docId");
  const { getPortal, getBanks, isLoading: isPortalLoading } = usePortalStore();
  const { getDocumentTree, getDocument, documents, fetchDocuments, isLoading: isDocsLoading } = useDocumentStore();
  const { theme, setTheme } = useTheme();
  
  const portal = getPortal(linkId || "");
  const banks = getBanks();
  
  const [activeId, setActiveId] = useState("");
  const activeDoc = activeId ? getDocument(activeId) : null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeHeading, setActiveHeading] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Fetch documents for this portal on mount
  useEffect(() => {
    if (portal) {
      fetchDocuments(portal.id);
    }
  }, [portal, fetchDocuments]);

  const [isContentLoading, setIsContentLoading] = useState(false);

  // Fetch content on-demand when activeId changes
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

  const [scrollToCode, setScrollToCode] = useState<string | null>(null);

  // Synchronize activeId with URL query (docId or Activity Code or Sub-Activity Code)
  useEffect(() => {
    if (urlDocId) {
      setActiveId(urlDocId);
      setScrollToCode(null);
    } else {
      const searchStr = location.search;
      if (searchStr && searchStr.startsWith("?")) {
        const decoded = decodeURIComponent(searchStr.substring(1)).trim();
        if (decoded && !decoded.includes("=")) {
          // Clean Activity Code or Sub-Activity Code: ?ADB or ?CDB
          const resolveCode = async () => {
            try {
              const res = await api.get(`/documents/resolve-activity/${encodeURIComponent(decoded)}` + (portal ? `?bankId=${portal.id}` : ''));
              if (res && res.docId) {
                setActiveId(res.docId);
                if (res.type === "sub") {
                  setScrollToCode(decoded.toLowerCase());
                } else {
                  setScrollToCode(null);
                }
              }
            } catch (err) {
              console.error("Failed to resolve activity code:", err);
            }
          };
          
          if (portal) {
            resolveCode();
          }
        } else {
          // Standard query param: ?activityCode=Form 1
          const actCode = searchParams.get("activityCode");
          if (actCode) {
            const match = documents.find(d => d.activityCode?.toLowerCase().trim() === actCode.toLowerCase().trim());
            if (match) {
              setActiveId(match.id);
              setScrollToCode(null);
            }
          }
        }
      }
    }
  }, [urlDocId, location.search, searchParams, documents, portal]);

  // Scroll to sub-activity code once content is loaded and rendered
  useEffect(() => {
    if (activeDoc && !isContentLoading && scrollToCode) {
      const timer = setTimeout(() => {
        const el = document.getElementById(scrollToCode);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          el.classList.add("bg-primary/10", "transition-colors", "duration-1000");
          setTimeout(() => {
            el.classList.remove("bg-primary/10");
          }, 2000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeDoc, isContentLoading, scrollToCode]);
  
  // For Developers: They see all banks. For Banks: Only their own.
  const tree = useMemo(() => {
    if (!portal) return [];
    if (portal.type === "developer") {
      // Return a "Master Tree" where root nodes are Banks
      return banks.map(bank => ({
        id: bank.id,
        bankId: bank.id,
        title: bank.name,
        subtitle: "Bank Segment",
        children: getDocumentTree(bank.id)
      }));
    } else {
      // Return only this bank's tree
      return getDocumentTree(portal.id);
    }
  }, [portal, banks, getDocumentTree]);

  const activeVersions = useMemo(() => {
    if (!activeDoc) return [];
    const parentId = activeDoc.isVersion ? activeDoc.parentId : activeDoc.id;
    if (!parentId) return [];
    
    // The main document
    const mainDoc = documents.find(d => d.id === parentId);
    // All specific versions
    const versions = documents.filter(d => d.parentId === parentId && d.isVersion);
    
    const all = [];
    if (mainDoc) all.push({ id: mainDoc.id, label: "Current (Latest)", isMain: true, activityCode: mainDoc.activityCode });
    versions.forEach(v => {
      all.push({ id: v.id, label: v.versionLabel || v.title, isMain: false, activityCode: v.activityCode });
    });
    return all.sort((a,b) => a.isMain ? -1 : 1);
  }, [activeDoc, documents]);

  const [tocItems, setTocItems] = useState<{ id: string, text: string, level: number }[]>([]);

  // Effect to parse headings and sub-activity code elements for TOC
  useEffect(() => {
    if (activeDoc) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(renderDocHtml(activeDoc.content), "text/html");
      const targetElements = Array.from(doc.querySelectorAll("h1, h2, h3, p, li, td"));
      const items: { id: string, text: string, level: number }[] = [];

      targetElements.forEach(el => {
        const isHeading = ["H1", "H2", "H3"].includes(el.tagName);
        const badge = el.querySelector(".sub-activity-badge");
        
        if (isHeading || badge) {
          const id = el.id || (badge ? badge.getAttribute("data-code")?.toLowerCase() : "") || "item";
          if (!id) return;
          
          let text = el.textContent || "";
          let level = 3;
          if (el.tagName === "H1") level = 1;
          else if (el.tagName === "H2") level = 2;
          else if (el.tagName === "H3") level = 3;
          
          if (text.trim()) {
            items.push({ id, text: text.trim(), level });
          }
        }
      });
      
      // Always prepend the document title as the first item for the top of the page
      setTocItems([{ id: "intro", text: activeDoc.title, level: 2 }, ...items]);
    }
  }, [activeDoc]);

  // Scroll Spy logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -70% 0px" }
    );

    const headings = document.querySelectorAll("article h1, article h2, article h3");
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [activeDoc, tocItems]);

  useEffect(() => {
    const hasQuery = searchParams.get("docId") || searchParams.get("activityCode") || (location.search && location.search.startsWith("?") && !location.search.includes("="));
    if (tree.length > 0 && !activeId && !hasQuery) {
      // Find the first actual document (leaf node) if possible
      const findFirstDocId = (nodes: any[]): string => {
        if (!nodes.length) return "";
        if (nodes[0] && nodes[0].children && nodes[0].children.length > 0) return findFirstDocId(nodes[0].children);
        return nodes[0]?.id || "";
      };
      
      const firstId = findFirstDocId(tree);
      if (firstId) setActiveId(firstId);
      else if (tree[0]) setActiveId(tree[0].id);
    }
  }, [tree, activeId, location.search, searchParams]);

  if (isPortalLoading || !portal) {
    return (
      <div className="flex flex-col h-screen bg-background overflow-hidden relative">
        <HeaderSkeleton />
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden lg:block w-72 border-r border-border/50">
            <SidebarSkeleton />
          </div>
          <main className="flex-1 overflow-y-auto">
            <ContentSkeleton />
          </main>
          <div className="hidden xl:block w-64 p-8 border-l border-border/50 space-y-6">
            <Skeleton className="h-6 w-32" />
            <TocSkeleton />
          </div>
        </div>


      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20"
    >
      
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-muted rounded-lg md:hidden">
               <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/portal/${linkId}`)}>
               <div className="h-8 w-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center overflow-hidden">
                  {portal.logoUrl ? (
                    <img src={portal.logoUrl} className="w-full h-full object-cover" alt="logo" />
                  ) : (
                    <Globe className="w-4 h-4 text-primary" />
                  )}
               </div>
               <span className="font-bold tracking-tight hidden sm:inline text-sm">USG Docs</span>
            </div>
            <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <span className="font-medium">{portal.name}</span>
               <div className={cn("px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter", portal.type === "developer" ? "bg-indigo-500/10 text-indigo-500" : "bg-emerald-500/10 text-emerald-500")}>
                  {portal.type}
               </div>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <div className="relative hidden lg:flex items-center">
                <GlobalSearch linkId={linkId || ""} />
            </div>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>
         </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Nav */}
        {/* Navigation - Enhanced Scroll Area */}
        <aside 
          className={cn(
            "w-72 border-r border-border bg-background/50 flex flex-col transition-all duration-300",
            !isSidebarOpen && "-ml-72 opacity-0"
          )}
        >
          <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            {isDocsLoading && tree.length === 0 ? (
              <div className="-mt-6 -ml-6">
                 <SidebarSkeleton />
              </div>
            ) : tree.length > 0 ? (
              <div className="space-y-8">
                {tree.map((node: any) => (
                  <div key={node.id} className="space-y-4">
                    <SidebarCategory 
                      node={node} 
                      activeId={activeId} 
                      onSelect={(id: string, activityCode?: string | null) => {
                        setActiveId(id);
                        const queryVal = activityCode ? encodeURIComponent(activityCode) : `docId=${id}`;
                        navigate(`/portal/${linkId}/docs?${queryVal}`);
                      }} 
                      depth={0}
                      type={portal.type}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 px-4 translate-y-10 group">
                <div className="h-16 w-16 bg-muted rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <FileText className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Empty Vault</p>
                  <p className="text-[10px] text-muted-foreground/60 leading-relaxed">No published documents were found for this bank segment.</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background/30 custom-scrollbar relative">
          {/* Progress Indicator */}
          <div className="fixed top-14 left-0 right-0 h-[2px] bg-primary/10 z-[100]">
             <motion.div 
               className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 0.5 }}
             />
          </div>

          <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 md:py-20 relative min-h-[50vh]">
            {isDocsLoading && !activeDoc ? (
              <div className="relative">
                <ContentSkeleton />
                <div className="absolute inset-0 flex items-center justify-center pt-24">
                   <ElegantLoader label="Opening Vault" />
                </div>
              </div>
            ) : activeDoc ? (
              <article className="prose prose-zinc dark:prose-invert max-w-none prose-headings:tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-12 space-y-4">
                  <h1 id="intro" className="text-4xl md:text-5xl font-black tracking-tighter mb-4 !mt-0 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                    {activeDoc.title}
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                    {activeDoc.subtitle}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                       <Layout className="w-3 h-3" />
                       Ref: {activeDoc.activityCode || "N/A"}
                    </div>

                    {activeVersions.length > 1 && (
                      <Popover>
                         <PopoverTrigger asChild>
                           <button className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:bg-indigo-500/20 transition-all">
                              <Layers className="w-3 h-3" />
                              {activeDoc.isVersion ? (activeDoc.versionLabel || "Version") : "Current (Latest)"}
                              <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                           </button>
                         </PopoverTrigger>
                         <PopoverContent className="w-56 p-2 rounded-xl border-border shadow-2xl" align="start">
                            <div className="text-[9px] font-black tracking-widest text-muted-foreground uppercase mb-2 px-2">Version Selector</div>
                            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto no-scrollbar">
                               {activeVersions.map(v => (
                                 <button
                                   key={v.id}
                                   onClick={() => {
                                      setActiveId(v.id);
                                      const queryVal = v.activityCode ? encodeURIComponent(v.activityCode) : `docId=${v.id}`;
                                      navigate(`/portal/${linkId}/docs?${queryVal}`);
                                   }}
                                   className={cn(
                                     "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all",
                                     v.id === activeDoc.id ? "bg-indigo-500/10 text-indigo-500" : "hover:bg-muted text-muted-foreground"
                                   )}
                                 >
                                   <span>{v.label}</span>
                                   {v.id === activeDoc.id && <Check className="w-3 h-3" />}
                                 </button>
                               ))}
                            </div>
                         </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>

                {isContentLoading || activeDoc.content === undefined ? (
                  <ContentSkeleton />
                ) : (
                  <div 
                     onClick={(e) => {
                       const target = e.target as HTMLElement;
                       const badge = target.closest(".sub-activity-badge");
                       if (badge && portal) {
                         const code = badge.getAttribute("data-code");
                         if (code) {
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
                     }}
                     className="prose prose-zinc dark:prose-invert max-w-none pb-[50vh]
                     [&>h1]:text-3xl [&>h1]:font-extrabold [&>h1]:mt-10 [&>h1]:mb-6 [&>h1]:tracking-tight [&>h1]:scroll-mt-24
                     [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:scroll-mt-24
                     [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:scroll-mt-24
                     [&>p]:text-[16px] [&>p]:leading-[1.8] [&>p]:mb-6 [&>p]:text-muted-foreground
                     [&>ul]:list-none [&>ul]:space-y-3 [&>ul]:mb-8
                     [&>ul>li]:before:content-['→'] [&>ul>li]:before:mr-3 [&>ul>li]:before:text-primary [&>ul>li]:before:font-bold
                     [&>pre]:bg-zinc-950 [&>pre]:text-zinc-100 [&>pre]:p-6 [&>pre]:rounded-2xl [&>pre]:my-10 [&>pre]:shadow-2xl [&>pre]:font-mono [&>pre]:text-sm
                     [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:rounded-lg [&_table]:overflow-hidden
                     [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold
                     [&_td]:border [&_td]:border-border [&_td]:p-3 [&_td]:align-top"
                     dangerouslySetInnerHTML={{ __html: renderDocHtml(activeDoc.content) }}
                  />
                )}

                <div className="mt-20 pt-10 border-t border-border flex items-center justify-between">
                   <div className="text-xs text-muted-foreground">© 2026 Union Systems Global. All rights reserved.</div>
                </div>
              </article>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground italic">
                 Select a document to begin reading.
              </div>
            )}
          </div>
        </main>

        {/* Right Nav (TOC) - The modern Docs look */}
        <aside className="hidden xl:block w-72 border-l border-border bg-background/30 px-6 pt-2 pb-6 overflow-y-auto no-scrollbar">
           <div className="sticky top-16">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Table of Contents</h4>
              <div className="space-y-1">
                 {tocItems.map(item => (
                   <div 
                      key={item.id}
                      onClick={() => {
                        const el = document.getElementById(item.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={cn(
                        "group relative flex items-center gap-2 py-1 cursor-pointer transition-all duration-300",
                        item.level === 3 ? "ml-9" : item.level === 2 ? "ml-5" : "ml-0",
                        activeHeading === item.id || (item.id === 'intro' && !activeHeading)
                          ? "text-primary translate-x-1" 
                          : "text-muted-foreground hover:text-foreground hover:translate-x-0.5"
                      )}
                   >
                     {/* Indicator Dot */}
                     <div className={cn(
                        "w-1 h-1 rounded-full transition-all duration-500",
                        activeHeading === item.id || (item.id === 'intro' && !activeHeading)
                          ? "bg-primary scale-150 shadow-[0_0_8px_hsl(var(--primary)/0.5)]" 
                          : "bg-border group-hover:bg-muted-foreground/40"
                     )} />
                     
                     <span className={cn(
                        "text-[13px] transition-colors leading-tight",
                        item.level === 1 ? "font-bold text-sm tracking-tight" : "font-medium",
                        (activeHeading === item.id || (item.id === 'intro' && !activeHeading)) ? "text-primary" : ""
                     )}>
                       {item.text}
                     </span>

                     {/* Subtle Left Border for hierarchy */}
                     {item.level === 1 && (
                        <div className="absolute -left-4 top-0 bottom-0 w-[1px] bg-border/30" />
                     )}
                   </div>
                 ))}
              </div>
              
              <div className="mt-12 pt-8 border-t border-border/50">
                 <div className="flex flex-col gap-4">
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.1em]">Help & Feedback</div>
                    <div className="text-xs text-muted-foreground/60 leading-relaxed italic">Technical support is provided by USG developers to authorized bank personnel.</div>
                 </div>
              </div>
           </div>
        </aside>

      </div>

      <AIAssistant activeDoc={activeDoc} />
    </motion.div>
  );
}

function SidebarCategory({ node, activeId, onSelect, depth, type }: any) {
  const [open, setOpen] = useState(depth === 0);
  const isActive = activeId === node.id;
  const hasChildren = node.children.length > 0;
  
  // Custom icons for depth 0 developer view (Bank Segments)
  const isBankSegment = type === 'developer' && depth === 0;

  return (
    <div className="space-y-1">
       <div 
         className={cn(
           "group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer relative",
           isActive 
            ? "text-primary bg-transparent font-bold" 
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
         )}
         style={{ marginLeft: `${depth * 12}px` }}
         onClick={() => {
           if (hasChildren) setOpen(!open);
           else onSelect(node.id, node.activityCode);
         }}
       >
         {isBankSegment ? (
           <Building2 className={cn("w-4 h-4", isActive ? "text-primary" : "text-primary/70")} />
         ) : hasChildren ? (
           <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", !open && "-rotate-90", isActive ? "text-primary" : "")} />
         ) : (
           <FileText className={cn("w-3.5 h-3.5 shrink-0 transition-colors", isActive ? "text-primary" : "text-primary/40")} />
         )}
         <div className="flex flex-col min-w-0 flex-1">
            <span className={cn("truncate tracking-tight", isBankSegment ? "font-black uppercase text-xs tracking-widest" : "font-semibold")}>
               {node.title}
            </span>
            {node.subtitle && !hasChildren && !isBankSegment && (
              <span className={cn("text-[10px] truncate opacity-60 font-medium tracking-tight", isActive ? "text-primary/70" : "text-muted-foreground")}>
                {node.subtitle}
              </span>
            )}
         </div>
       </div>
       
       {hasChildren && open && (
         <div className="mt-1 space-y-1">
            {node.children.filter((c: any) => !c.isVersion).map((child: any) => (
              <SidebarCategory 
                key={child.id} 
                node={child} 
                activeId={activeId} 
                onSelect={onSelect} 
                depth={depth + 1}
                type={type}
              />
            ))}
         </div>
       )}
    </div>
  );
}
