import { AppLayout } from "@/components/layout/AppLayout";
import { useDocumentStore, SavedDocument } from "@/stores/documentStore";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Code, Quote, Table, Image, Minus, AlignLeft,
  AlignCenter, AlignRight, Undo2, Redo2, Save, FileText, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

const toolbarGroups = [
  {
    label: "History",
    tools: [
      { icon: Undo2, label: "Undo", command: "undo" },
      { icon: Redo2, label: "Redo", command: "redo" },
    ],
  },
  {
    label: "Text",
    tools: [
      { icon: Bold, label: "Bold", command: "bold" },
      { icon: Italic, label: "Italic", command: "italic" },
      { icon: Underline, label: "Underline", command: "underline" },
      { icon: Strikethrough, label: "Strikethrough", command: "strikeThrough" },
    ],
  },
  {
    label: "Headings",
    tools: [
      { icon: Heading1, label: "Heading 1", command: "h1" },
      { icon: Heading2, label: "Heading 2", command: "h2" },
      { icon: Heading3, label: "Heading 3", command: "h3" },
    ],
  },
  {
    label: "Lists",
    tools: [
      { icon: List, label: "Bullet List", command: "insertUnorderedList" },
      { icon: ListOrdered, label: "Numbered List", command: "insertOrderedList" },
    ],
  },
  {
    label: "Alignment",
    tools: [
      { icon: AlignLeft, label: "Align Left", command: "justifyLeft" },
      { icon: AlignCenter, label: "Align Center", command: "justifyCenter" },
      { icon: AlignRight, label: "Align Right", command: "justifyRight" },
    ],
  },
  {
    label: "Insert",
    tools: [
      { icon: Code, label: "Code", command: "code" },
      { icon: Quote, label: "Quote", command: "quote" },
      { icon: Minus, label: "Divider", command: "insertHorizontalRule" },
    ],
  },
];

export default function CreateDocumentPage() {
  const navigate = useNavigate();
  const addDocument = useDocumentStore((s) => s.addDocument);
  const documents = useDocumentStore((s) => s.documents);
  const editorRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  // Only show top-level docs and their children as possible parents
  const parentOptions = documents.filter((d) => !d.parentId || documents.some((p) => p.id === d.parentId && !p.parentId));

  const execCommand = useCallback((command: string) => {
    editorRef.current?.focus();
    if (command === "h1") {
      document.execCommand("formatBlock", false, "h1");
    } else if (command === "h2") {
      document.execCommand("formatBlock", false, "h2");
    } else if (command === "h3") {
      document.execCommand("formatBlock", false, "h3");
    } else if (command === "code") {
      document.execCommand("formatBlock", false, "pre");
    } else if (command === "quote") {
      document.execCommand("formatBlock", false, "blockquote");
    } else {
      document.execCommand(command, false);
    }
  }, []);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a document title.");
      return;
    }
    const content = editorRef.current?.innerHTML || "";
    addDocument({
      title: title.trim(),
      subtitle: "",
      parentId,
      content,
      author: "Sarah Chen",
    });
    toast.success("Document saved successfully!");
    navigate("/documents");
  };

  const selectedParent = parentId ? documents.find((d) => d.id === parentId) : null;

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Top toolbar area */}
        <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">New Document</span>
          </div>
          <button
            onClick={handleSave}
            className="h-9 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
          >
            <Save className="h-4 w-4" /> Save Document
          </button>
        </div>

        {/* Formatting toolbar */}
        <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-1.5 flex items-center gap-0.5 flex-wrap">
          {toolbarGroups.map((group, gi) => (
            <div key={gi} className="flex items-center gap-0.5">
              {gi > 0 && <div className="w-px h-5 bg-border mx-1.5" />}
              {group.tools.map((tool) => (
                <button
                  key={tool.label}
                  title={tool.label}
                  onClick={() => execCommand(tool.command)}
                  className="h-8 w-8 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <tool.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Document body — Word-like feel */}
        <div className="flex-1 overflow-auto bg-muted/30">
          <div className="max-w-[816px] mx-auto my-8 bg-card rounded-lg shadow-md border border-border min-h-[1056px] flex flex-col">
            {/* Title & parent selection area */}
            <div className="px-12 pt-10 pb-4 border-b border-border/50 space-y-3">
              {/* Parent selector */}
              <div className="relative">
                <button
                  onClick={() => setShowParentDropdown(!showParentDropdown)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
                >
                  <span>
                    {selectedParent ? `Filed under: ${selectedParent.title}` : "Top-level document (click to nest under a parent)"}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showParentDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-md shadow-lg z-20 py-1 max-h-48 overflow-auto">
                    <button
                      onClick={() => { setParentId(null); setShowParentDropdown(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors",
                        !parentId && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      None (Top-level)
                    </button>
                    {parentOptions.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => { setParentId(doc.id); setShowParentDropdown(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors",
                          doc.parentId && "pl-6",
                          parentId === doc.id && "bg-primary/10 text-primary font-medium"
                        )}
                      >
                        {doc.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Title input */}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Document"
                className="w-full text-3xl font-bold bg-transparent focus:outline-none placeholder:text-muted-foreground/40 tracking-tight"
              />
            </div>

            {/* Editable content area */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="flex-1 px-12 py-8 focus:outline-none text-sm leading-relaxed prose prose-sm max-w-none
                [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-6 [&>h1]:mb-3
                [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-5 [&>h2]:mb-2
                [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mt-4 [&>h3]:mb-2
                [&>p]:mb-3
                [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-3
                [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-3
                [&>pre]:bg-muted [&>pre]:p-3 [&>pre]:rounded [&>pre]:font-mono [&>pre]:text-xs [&>pre]:mb-3
                [&>blockquote]:border-l-4 [&>blockquote]:border-primary/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>blockquote]:mb-3
                [&>hr]:my-6 [&>hr]:border-border"
              data-placeholder="Start typing your document..."
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
