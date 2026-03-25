import { AppLayout } from "@/components/layout/AppLayout";
import { useDocumentStore, DocumentNode } from "@/stores/documentStore";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronRight, FileText, Plus, FolderOpen } from "lucide-react";

function TreeItem({
  node,
  depth,
  activeId,
  onSelect,
}: {
  node: DocumentNode;
  depth: number;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        onClick={() => onSelect(node.id)}
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md text-sm cursor-pointer group hover:bg-muted transition-colors",
          activeId === node.id && "bg-primary/10 text-primary font-medium"
        )}
        style={{ paddingLeft: `${depth * 14 + 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="h-4 w-4 shrink-0 flex items-center justify-center"
          >
            <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform duration-200", expanded && "rotate-90")} />
          </button>
        ) : (
          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="truncate">{node.title}</span>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} activeId={activeId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const navigate = useNavigate();
  const tree = useDocumentStore((s) => s.getDocumentTree());
  const getDocument = useDocumentStore((s) => s.getDocument);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!activeId && tree.length > 0) {
      setActiveId(tree[0].id);
    }
  }, [tree, activeId]);

  const activeDoc = activeId ? getDocument(activeId) : undefined;

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Mini sidebar with document tree */}
        <div className="w-64 shrink-0 border-r border-border bg-card overflow-y-auto flex flex-col">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Documents</span>
            </div>
            <button
              onClick={() => navigate("/create-new")}
              className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
              title="Create new document"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 p-2 space-y-0.5">
            {tree.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No documents yet</p>
                <button
                  onClick={() => navigate("/create-new")}
                  className="mt-2 text-primary hover:underline text-xs"
                >
                  Create your first document
                </button>
              </div>
            ) : (
              tree.map((node) => (
                <TreeItem key={node.id} node={node} depth={0} activeId={activeId} onSelect={setActiveId} />
              ))
            )}
          </div>
        </div>

        {/* Content viewer */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeDoc ? (
            <>
              <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">{activeDoc.title}</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Last updated {new Date(activeDoc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {activeDoc.author}
                  </p>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-muted/20">
                <div className="max-w-[816px] mx-auto my-6 bg-card rounded-lg shadow-sm border border-border min-h-[600px]">
                  <div
                    className="px-12 py-10 text-sm leading-relaxed prose prose-sm max-w-none
                      [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-6 [&>h1]:mb-3
                      [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-5 [&>h2]:mb-2
                      [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mt-4 [&>h3]:mb-2
                      [&>p]:mb-3
                      [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-3
                      [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-3
                      [&>pre]:bg-muted [&>pre]:p-3 [&>pre]:rounded [&>pre]:font-mono [&>pre]:text-xs [&>pre]:mb-3
                      [&>blockquote]:border-l-4 [&>blockquote]:border-primary/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>blockquote]:mb-3"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(activeDoc.content) }}
                  />
                </div>
              </div>
            </>
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
    </AppLayout>
  );
}

// Simple markdown-to-HTML renderer for display
function renderMarkdown(md: string): string {
  if (md.startsWith("<")) return md; // already HTML from editor
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^(?!<[hupol]|<li|<bl|<co|<st|<em|<ul|<hr)(.*\S.*)$/gm, '<p>$1</p>')
    .replace(/\n{2,}/g, '\n');
}
