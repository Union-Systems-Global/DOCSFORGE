import { useParams, useNavigate } from "react-router-dom";
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
  Layout
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Simple Markdown/HTML Parser Helper ---
const slugify = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

const renderDocHtml = (content: string) => {
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
  
  return html;
};

export default function DocsViewer() {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const { getPortal, getBanks } = usePortalStore();
  const { getDocumentTree, getDocument, documents, fetchDocuments } = useDocumentStore();
  const { theme, setTheme } = useTheme();
  
  const portal = getPortal(linkId || "");
  const banks = getBanks();
  
  const [activeId, setActiveId] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch documents for this portal on mount
  useEffect(() => {
    if (portal) {
      fetchDocuments(portal.id);
    }
  }, [portal, fetchDocuments]);
  
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

  const activeDoc = activeId ? getDocument(activeId) : null;
  const [activeHeading, setActiveHeading] = useState("");
  const [tocItems, setTocItems] = useState<{ id: string, text: string, level: number }[]>([]);

  // Effect to parse headings for TOC
  useEffect(() => {
    if (activeDoc) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(renderDocHtml(activeDoc.content), "text/html");
      const headings = Array.from(doc.querySelectorAll("h1, h2, h3"));
      const items = headings.map(h => ({
        id: h.id || h.textContent?.toLowerCase().replace(/\s+/g, '-') || "",
        text: h.textContent || "",
        level: h.tagName === "H1" ? 1 : h.tagName === "H2" ? 2 : 3
      })).filter(item => item.id !== "");
      
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
    if (tree.length > 0 && !activeId) {
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
  }, [tree, activeId]);

  if (!portal) return null; // Handled by landing page logic usually

  return (
    <div className="flex flex-col h-screen bg-background text-foreground selection:bg-primary/20">
      
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
               <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
               <input 
                 placeholder="Search docs..." 
                 className="h-9 w-64 bg-muted/40 border-none rounded-full pl-9 pr-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none"
               />
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
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-background border-r border-border transition-transform duration-300 md:relative md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full pt-6 pb-20 px-4 overflow-y-auto no-scrollbar">
             <div className="space-y-6">
                {tree.map(node => (
                  <SidebarCategory 
                    key={node.id} 
                    node={node} 
                    activeId={activeId} 
                    onSelect={setActiveId} 
                    depth={0} 
                    type={portal.type}
                  />
                ))}
             </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-background/50 relative px-6 md:px-16 pt-12 pb-32 no-scrollbar">
           {activeDoc ? (
             <article id="intro" className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-10 font-medium">
                   <span className="hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate(`/portal/${linkId}`)}>Home</span>
                   <ChevronRight className="w-3 h-3" />
                   <span className="text-foreground">Documentation</span>
                   <ChevronRight className="w-3 h-3" />
                   <span className="text-foreground truncate">{activeDoc.title}</span>
                </nav>

                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-foreground leading-[1.1]">{activeDoc.title}</h1>
                <div className="flex items-center gap-3 mb-8">
                   <p className="text-xl text-muted-foreground leading-relaxed font-medium">{activeDoc.subtitle}</p>
                   {activeDoc.formCode && (
                     <div className="px-3 py-1 rounded-lg bg-primary/10 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20 shrink-0">
                       Ref: {activeDoc.formCode}
                     </div>
                   )}
                </div>
                
                <div className="flex items-center gap-4 text-sm mb-12 border-b border-border pb-8">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-foreground">USG</div>
                      Written by <span className="font-bold text-foreground">USG Software Developers</span>
                   </div>
                   <div className="h-4 w-px bg-border" />
                   <div className="text-muted-foreground">Updated {new Date(activeDoc.updatedAt).toLocaleDateString()}</div>
                </div>

                <div 
                   className="prose prose-zinc dark:prose-invert max-w-none pb-[50vh]
                   [&>h1]:text-3xl [&>h1]:font-extrabold [&>h1]:mt-10 [&>h1]:mb-6 [&>h1]:tracking-tight [&>h1]:scroll-mt-24
                   [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:scroll-mt-24
                   [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:scroll-mt-24
                   [&>p]:text-[16px] [&>p]:leading-[1.8] [&>p]:mb-6 [&>p]:text-muted-foreground
                   [&>ul]:list-none [&>ul]:space-y-3 [&>ul]:mb-8
                   [&>ul>li]:before:content-['→'] [&>ul>li]:before:mr-3 [&>ul>li]:before:text-primary [&>ul>li]:before:font-bold
                   [&>pre]:bg-zinc-950 [&>pre]:text-zinc-100 [&>pre]:p-6 [&>pre]:rounded-2xl [&>pre]:my-10 [&>pre]:shadow-2xl [&>pre]:font-mono [&>pre]:text-sm"
                   dangerouslySetInnerHTML={{ __html: renderDocHtml(activeDoc.content) }}
                />

                <div className="mt-20 pt-10 border-t border-border flex items-center justify-between">
                   <div className="text-xs text-muted-foreground">© 2026 Union Systems Global. All rights reserved.</div>
                </div>
             </article>
           ) : (
             <div className="h-full flex items-center justify-center text-muted-foreground italic">
                Select a document to begin reading.
             </div>
           )}
        </main>

        {/* Right Nav (TOC) - The modern Docs look */}
        <aside className="hidden xl:block w-72 border-l border-border bg-background/30 px-6 pt-2 pb-6 overflow-y-auto no-scrollbar">
           <div className="sticky top-16">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">On this page</h4>
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
                          ? "bg-primary scale-150 shadow-[0_0_8px_rgba(var(--primary),0.5)]" 
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
    </div>
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
           "group flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-200 cursor-pointer",
           isActive 
            ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
         )}
         style={{ marginLeft: `${depth * 12}px` }}
         onClick={() => {
           if (hasChildren) setOpen(!open);
           else onSelect(node.id);
         }}
       >
         {isBankSegment ? (
           <Building2 className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-primary/70")} />
         ) : hasChildren ? (
           <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", !open && "-rotate-90")} />
         ) : (
           <FileText className={cn("w-3.5 h-3.5 shrink-0 transition-colors", isActive ? "text-primary-foreground" : "text-primary/40")} />
         )}
         <div className="flex flex-col min-w-0 flex-1">
            <span className={cn("truncate tracking-tight", isBankSegment ? "font-black uppercase text-xs tracking-widest" : "font-semibold")}>
               {node.title}
            </span>
            {node.subtitle && !hasChildren && !isBankSegment && (
              <span className={cn("text-[10px] truncate opacity-60 font-medium tracking-tight", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {node.subtitle}
              </span>
            )}
         </div>
       </div>
       
       {hasChildren && open && (
         <div className="mt-1 space-y-1">
            {node.children.map((child: any) => (
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
