import { AppLayout } from "@/components/layout/AppLayout";
import { useDocumentStore } from "@/stores/documentStore";
import { useTemplateStore } from "@/stores/templateStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Code, Quote, Table, Image, Minus, AlignLeft,
  AlignCenter, AlignRight, Undo2, Redo2, Save, FileText, ChevronDown,
  Layers, FolderPlus, Monitor, Layout, Type, Baseline, Eraser,
  Highlighter, Palette, Subscript, Superscript, Indent, Outdent,
  Search, Info, Maximize2, Minimize2, Settings, Download, Share2,
  ArrowRight, Video, Check, Globe, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TemplateSelector } from "@/components/TemplateSelector";
import { type Template } from "@/data/mockData";
import { usePortalStore } from "@/stores/portalStore";
import { Building2 } from "lucide-react";

const THEME_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
  "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
  "#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#9fc5e8", "#b4a7d6", "#d5a6bd",
  "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#6fa8dc", "#8e7cc3", "#c27ba0",
  "#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#3d85c6", "#674ea7", "#a64d79",
  "#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#0b5394", "#351c75", "#741b47",
  "#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1c4587", "#073763", "#20124d", "#4c1130"
];

const HIGHLIGHT_COLORS = [
  "#ffff00", "#00ff00", "#00ffff", "#ff00ff", "#0000ff", "#ff0000", "#000080", "#008080", "#008000", "#800080", "#800000", "#808000", "#808080", "#c0c0c0", "#000000"
];

const toolbarGroups = [
  {
    label: "Clipboard",
    tools: [
      { icon: Undo2, label: "Undo (Ctrl+Z)", command: "undo" },
      { icon: Redo2, label: "Redo (Ctrl+Y)", command: "redo" },
    ],
  },
  {
    label: "Font",
    tools: [
      { icon: Bold, label: "Bold (Ctrl+B)", command: "bold" },
      { icon: Italic, label: "Italic (Ctrl+I)", command: "italic" },
      { icon: Underline, label: "Underline (Ctrl+U)", command: "underline" },
      { icon: Strikethrough, label: "Strikethrough", command: "strikeThrough" },
      { icon: Subscript, label: "Subscript", command: "subscript" },
      { icon: Superscript, label: "Superscript", command: "superscript" },
    ],
  },
  {
    label: "Style",
    tools: [
      { icon: Type, label: "Normal Text", command: "p" },
      { icon: Heading1, label: "Heading 1", command: "h1" },
      { icon: Heading2, label: "Heading 2", command: "h2" },
      { icon: Heading3, label: "Heading 3", command: "h3" },
    ],
  },
  {
    label: "Paragraph",
    tools: [
      { icon: AlignLeft, label: "Align Left", command: "justifyLeft" },
      { icon: AlignCenter, label: "Align Center", command: "justifyCenter" },
      { icon: AlignRight, label: "Align Right", command: "justifyRight" },
      { icon: List, label: "Bullet List", command: "insertUnorderedList" },
      { icon: ListOrdered, label: "Numbered List", command: "insertOrderedList" },
      { icon: Outdent, label: "Decrease Indent", command: "outdent" },
      { icon: Indent, label: "Increase Indent", command: "indent" },
    ],
  },
  {
    label: "Code",
    tools: [
      { icon: Code, label: "Inline Code", command: "insertCodeInline" },
      { icon: Monitor, label: "Code Block", command: "insertCodeBlock" },
    ],
  },
  {
    label: "Media & Ingestion",
    tools: [
      { icon: Image, label: "Insert Image", command: "insertImage" },
      { icon: Video, label: "Insert Video", command: "insertVideo" },
      { icon: FileText, label: "Import Document", command: "importDocument" },
    ],
  },
];

export default function CreateDocumentPage() {
  const navigate = useNavigate();
  const loadedDocRef = useRef<string | null>(null);
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const templateId = searchParams.get("template");
  const mode = searchParams.get("mode");
  const addDocument = useDocumentStore((s) => s.addDocument);
  const getDocument = useDocumentStore((s) => s.getDocument);
  const updateDocument = useDocumentStore((s) => s.updateDocument);
  const getAllTemplates = useTemplateStore((s) => s.getAllTemplates);
  const addCustomTemplate = useTemplateStore((s) => s.addCustomTemplate);
  const documents = useDocumentStore((s) => s.documents);
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  
  // Setup & Modal State
  const [setupStep, setSetupStep] = useState<"setup" | "editor">("setup");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [docStrategy, setDocStrategy] = useState<"standard" | "version">("standard");
  const [destinationType, setDestinationType] = useState<"existing" | "new_title">("existing");
  const [versionLabel, setVersionLabel] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [newContainerName, setNewContainerName] = useState(""); // Top level title
  const [newContainerPosition, setNewContainerPosition] = useState<number>(1);
  const [pageName, setPageName] = useState(""); // The actual sub-page title
  const [pagePosition, setPagePosition] = useState<number>(1);
  const [formCode, setFormCode] = useState(""); // The activity code
  const [visibility, setVisibility] = useState<"specific" | "all">("specific");
  const [assignedBanks, setAssignedBanks] = useState<string[]>([]);
  
  const [activeCommands, setActiveCommands] = useState<Record<string, boolean | string>>({});
  
  const { getBanks } = usePortalStore();
  const banks = getBanks();
  
  // Selection Toolbar State
  const [showSelectionToolbar, setShowSelectionToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [textColor, setTextColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("transparent");
  const [wordCount, setWordCount] = useState(0);

  const savedRangeRef = useRef<Range | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);


  const updateWordCount = useCallback(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  }, []);

  // Load document on mount if editId exists
  useEffect(() => {
    if (editId) {
      if (loadedDocRef.current === editId) return; // Prevent reset if already loaded

      const openSidebar = searchParams.get("sidebar") === "open";
      setSetupStep("editor"); // Start in editor mode for edits
      setIsSidebarOpen(openSidebar); // Open sidebar if requested, otherwise hide by default for edits
      
      const doc = getDocument(editId);
      if (doc) {
        setTitle(doc.title);
        setPageName(doc.title);
        if (doc.isVersion) {
          setDocStrategy("version");
          setVersionLabel(doc.versionLabel || "");
        } else {
          setDocStrategy("standard");
        }
        setFormCode(doc.activityCode || (doc as any).formCode || "");
        setSelectedBankId(doc.bankId);
        setSelectedParentId(doc.parentId || "");
        if (doc.position !== undefined) setPagePosition(doc.position);

        const populateEditor = (contentVal: string) => {
          if (editorRef.current) {
            editorRef.current.innerHTML = contentVal;
            setTimeout(() => {
              updateWordCount();
            }, 50);
          }
        };

        if (doc.content === undefined) {
          useDocumentStore.getState().fetchDocumentContent(editId).then((freshDoc) => {
            if (freshDoc) {
              populateEditor(freshDoc.content || "");
              loadedDocRef.current = editId; // Mark as loaded
            }
          });
        } else {
          populateEditor(doc.content || "");
          loadedDocRef.current = editId; // Mark as loaded
        }
      }
    } else {
      // Default Bank Selection for Setup
      if (banks.length > 0 && !selectedBankId) {
        setSelectedBankId(banks[0].id);
      }
    }
  }, [editId, getDocument, banks, selectedBankId, updateWordCount]);

  // Load template on mount if templateId exists
  useEffect(() => {
    if (templateId && !editId) {
      setSetupStep("editor");
      if (editorRef.current) {
        const template = getAllTemplates().find(t => t.id === templateId);
        if (template) {
          setTitle(template.name);
          
          let htmlContent = "";
          if (template.content) {
            htmlContent = template.content;
          } else {
            htmlContent = `<h1>${template.name}</h1>\n<p><br></p>\n`;
            template.sections?.forEach(section => {
              htmlContent += `<h2>${section}</h2>\n<p><br></p>\n`;
            });
          }
          
          editorRef.current.innerHTML = htmlContent;
          
          setTimeout(() => {
            updateWordCount();
          }, 50);
        }
      }
    }
  }, [templateId, getAllTemplates, editId, updateWordCount]);


  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0);
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      if (selection) {
        editorRef.current?.focus({ preventScroll: true });
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      }
    } else {
      editorRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const updateActiveStates = useCallback(() => {
    const states: Record<string, boolean | string> = {
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
    };

    // Check for block type
    const blockType = document.queryCommandValue("formatBlock");
    if (blockType) {
      states.formatBlock = blockType;
    }

    // Check for font and size
    const fontName = document.queryCommandValue("fontName");
    if (fontName) states.fontName = fontName.replace(/['"]/g, "");
    
    const fontSize = document.queryCommandValue("fontSize");
    if (fontSize) states.fontSize = fontSize;

    setActiveCommands(states);
  }, []);

  const handleSelectionChange = useCallback(() => {
    saveSelection();
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current?.contains(selection.anchorNode)) {
      setShowSelectionToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setToolbarPosition({
      top: rect.top + window.scrollY - 45,
      left: rect.left + window.scrollX + rect.width / 2,
    });
    setShowSelectionToolbar(true);
    updateActiveStates();
  }, [updateActiveStates, saveSelection]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resp = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await resp.json();
      if (data.url) {
        restoreSelection();
        document.execCommand('insertHTML', false, `
          <div class="my-6 flex flex-col items-center gap-2 group relative">
            <img src="${data.url}" alt="Uploaded Image" class="max-w-full h-auto rounded-xl shadow-2xl border border-border/50 hover:scale-[1.01] transition-transform duration-300" />
            <span class="text-[10px] text-muted-foreground font-medium opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Image: ${file.name}</span>
          </div>
          <p><br></p>
        `);
        toast.success("Image inserted into document");
      }
    } catch (err) {
      toast.error("Failed to upload image");
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resp = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await resp.json();
      if (data.url) {
        restoreSelection();
        document.execCommand('insertHTML', false, `
          <div class="my-6 flex flex-col items-center gap-2 group relative">
            <video src="${data.url}" controls class="max-w-full rounded-xl shadow-2xl border border-border/50 bg-black/5" />
            <span class="text-[10px] text-muted-foreground font-medium opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Video: ${file.name}</span>
          </div>
          <p><br></p>
        `);
        toast.success("Video inserted into document");
      }
    } catch (err) {
      toast.error("Failed to upload video");
    }
  };

  const handleDocumentImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const loadingToast = toast.loading(`Ingesting ${file.name.split('.').pop()?.toUpperCase()} and structuring content...`);
    try {
      const resp = await fetch(`http://${window.location.hostname}:5000/api/media/document-parse`, {
        method: 'POST',
        body: formData,
      });
      const data = await resp.json();
      if (data.html && editorRef.current) {
        restoreSelection();
        document.execCommand("insertHTML", false, data.html);
        toast.dismiss(loadingToast);
        toast.success("Document successfully parsed and imported!");
        updateWordCount();
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Failed to parse document file");
    }
  };

  const execCommand = useCallback((command: string, value?: string) => {
    restoreSelection();
    
    if (["h1", "h2", "h3", "p", "pre", "blockquote"].includes(command)) {
      const currentBlock = document.queryCommandValue("formatBlock")?.toLowerCase();
      const targetTag = command.toLowerCase();
      if (currentBlock === targetTag || (currentBlock === "div" && targetTag === "p")) {
        document.execCommand("formatBlock", false, "p");
      } else {
        document.execCommand("formatBlock", false, targetTag);
      }
    } else if (command === "removeFormat") {
      document.execCommand("removeFormat", false);
      document.execCommand("formatBlock", false, "p");
    } else if (command === "foreColor") {
      document.execCommand("foreColor", false, value);
    } else if (command === "hiliteColor" || command === "backColor") {
      // Use hiliteColor for most, backColor for some legacy/IE
      document.execCommand("hiliteColor", false, value) || document.execCommand("backColor", false, value);
    } else if (command === "fontSize") {
      document.execCommand("fontSize", false, value);
    } else if (command === "fontName") {
      document.execCommand("fontName", false, value);
    } else if (command === "insertImage") {
      imageInputRef.current?.click();
    } else if (command === "insertVideo") {
      videoInputRef.current?.click();
    } else if (command === "importDocument") {
      docInputRef.current?.click();
    } else if (command === "insertCodeInline") {
      // Wrap selected text in <code> or insert an empty code element
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        // Check if we're already inside a <code> — toggle it off
        const parentCode = (sel.anchorNode?.parentElement?.closest('code'));
        if (parentCode && !parentCode.closest('pre')) {
          // Unwrap: replace <code> with its text content
          const text = document.createTextNode(parentCode.textContent || '');
          parentCode.parentNode?.replaceChild(text, parentCode);
          // Place cursor at end of new text node
          const r = document.createRange();
          r.setStartAfter(text);
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
        } else {
          const selectedText = range.toString();
          const code = document.createElement('code');
          code.style.cssText = 'background:#1e293b;color:#e2e8f0;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em;';
          if (selectedText) {
            range.deleteContents();
            code.textContent = selectedText;
          } else {
            code.innerHTML = '&ZeroWidthSpace;';
          }
          range.insertNode(code);
          // Move cursor to end of code element
          const r = document.createRange();
          r.setStartAfter(code);
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
        }
      }
    } else if (command === "insertCodeBlock") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const selectedText = range.toString();
        range.deleteContents();
        const pre = document.createElement('pre');
        pre.style.cssText = 'background:#0f172a;color:#e2e8f0;padding:16px 20px;border-radius:12px;font-family:"Fira Code","Cascadia Code","JetBrains Mono",monospace;font-size:13px;line-height:1.6;overflow-x:auto;margin:12px 0;border:1px solid #1e293b;white-space:pre-wrap;word-break:break-word;';
        const code = document.createElement('code');
        code.textContent = selectedText || 'Type your code here...';
        pre.appendChild(code);
        range.insertNode(pre);
        // Insert a paragraph after the code block so the user can continue typing
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        pre.parentNode?.insertBefore(p, pre.nextSibling);
        // Place cursor inside the code block
        const r = document.createRange();
        r.selectNodeContents(code);
        if (!selectedText) r.selectNodeContents(code);
        else { r.setStartAfter(code); r.collapse(true); }
        sel.removeAllRanges();
        sel.addRange(r);
      }
    } else {
      document.execCommand(command, false, value);
    }
    
    updateActiveStates();
    saveSelection();
  }, [updateActiveStates, restoreSelection, saveSelection]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b": e.preventDefault(); execCommand("bold"); break;
        case "i": e.preventDefault(); execCommand("italic"); break;
        case "u": e.preventDefault(); execCommand("underline"); break;
        case "z": e.preventDefault(); execCommand("undo"); break;
        case "y": e.preventDefault(); execCommand("redo"); break;
      }
    }
  }, [execCommand]);

  const handleStartWriting = () => {
    if (mode === "template") {
      setSetupStep("editor");
      return;
    }
    
    if (!selectedBankId) {
      toast.error("Please select a client to assign this document to.");
      return;
    }
    
    if (destinationType === "existing" && !selectedParentId) {
      toast.error("Please select an existing Title Container.");
      return;
    }
    
    if (destinationType === "new_title" && !newContainerName.trim()) {
      toast.error("Please provide a name for the new Title Container.");
      return;
    }
    
    if (!pageName.trim()) {
      toast.error("Please provide a Page Name for this specific document.");
      return;
    }

    if (!formCode.trim()) {
      toast.error("Please provide an Activity Code for administrative tracking.");
      return;
    }
    
    // Set the overall editor title to the Page Name
    setTitle(pageName);
    setSetupStep("editor");
    setIsSidebarOpen(false); // Maximize editor space
    toast.success("Document structure locked. Writing surface enabled.", {
      description: `Target: ${pageName}`,
      icon: <Check className="h-4 w-4 text-primary" />,
    });
  };

  const handleSelectTemplate = (template: Template) => {
    setTitle(template.name);
    
    // Generate boilerplate HTML
    let boilerplate = `<h1>${template.name}</h1><p>${template.description}</p>`;
    template.sections.forEach(section => {
      boilerplate += `<h2>${section}</h2><p>Start typing your ${section.toLowerCase()} details here...</p>`;
    });

    if (editorRef.current) {
      editorRef.current.innerHTML = boilerplate;
    }
    
    setIsTemplateSelectorOpen(false);
    toast.success(`Template "${template.name}" applied!`);
  };

  const confirmSave = async () => {
    const finalTitle = title.trim() || "Untitled Document";
    const content = editorRef.current?.innerHTML || "";
    
    if (mode === "template") {
      await addCustomTemplate({
        name: finalTitle,
        description: "Custom template", 
        sections: [],
        category: "Custom",
        content: content,
      });
      toast.success("Template saved successfully!");
      navigate("/templates");
      return;
    }
    
    if (editId) {
      const existingDoc = getDocument(editId);
      // In-place update (per user request: no more versions)
      await updateDocument(editId, {
        title: finalTitle,
        subtitle: "",
        bankId: selectedBankId,
        parentId: existingDoc?.parentId || null, // Keep the same parent/container
        activityCode: formCode,
        position: pagePosition,
        content,
        visibility,
        assignedBanks: assignedBanks.length > 0 ? assignedBanks.join(",") : null,
        isPublished: existingDoc?.isPublished ?? false, 
        isVersion: docStrategy === "version",
        versionLabel: docStrategy === "version" ? versionLabel.trim() : null,
      });
      toast.success("Document updated successfully!");
      navigate("/documents");
      return;
    }

    let finalParentId = selectedParentId;

    if (destinationType === "new_title") {
      // Instantly create the parent category container in the backend
      finalParentId = await addDocument({
        title: newContainerName.trim(),
        subtitle: "",
        bankId: selectedBankId,
        parentId: null,
        position: newContainerPosition,
        visibility,
        assignedBanks: assignedBanks.length > 0 ? assignedBanks.join(",") : null,
        content: `<h1>${newContainerName.trim()}</h1><p>Title Container for ${finalTitle}</p>`,
        author: "System Admin",
        isPublished: true, // Title containers are usually always visible
      });
    }

    // Save the actual page document
    await addDocument({
      title: finalTitle,
      subtitle: "",
      position: pagePosition,
      bankId: selectedBankId,
      parentId: finalParentId,
      activityCode: formCode,
      visibility,
      assignedBanks: assignedBanks.length > 0 ? assignedBanks.join(",") : null,
      content,
      author: "System Admin",
      isPublished: false, // Always save as draft by default
      isVersion: docStrategy === "version",
      versionLabel: docStrategy === "version" ? versionLabel.trim() : null,
    });

    toast.success("Document saved as draft!");
    navigate("/documents");
  };

  // Derivative Position Calculations
  const calcAvailablePositions = (parentId: string | null) => {
    const occupied = documents
      .filter(d => d.parentId === parentId && d.bankId === selectedBankId && d.id !== editId)
      .map(d => d.position)
      .filter(p => p !== undefined) as number[];
    
    // As per user requirement: no limit logically, generate enough padding ahead of occupied max.
    const maxPossibility = Math.max(0, ...occupied) + 20;
    
    const available = Array.from({length: maxPossibility}, (_, i) => i + 1)
      .filter(p => !occupied.includes(p));

    // Ensure the current selection (or the document's original position) is always an option if valid
    return available;
  };

  const availableContainerPositions = calcAvailablePositions(null);
  const availablePagePositions = calcAvailablePositions(destinationType === "new_title" ? null : selectedParentId);

  return (
    <AppLayout>
      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
      <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoUpload} />
      <input type="file" ref={docInputRef} className="hidden" accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleDocumentImport} />
      <div className="flex flex-col h-[calc(100vh-3.5rem)] relative overflow-hidden bg-background">
        {/* Top toolbar area */}
        <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-colors", mode === "template" ? "bg-indigo-500/10 text-indigo-500" : "bg-primary/10 text-primary")}>
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">{mode === "template" ? "Project Builder" : editId ? "Editing Document" : "Drafting Document"}</span>
              <span className="text-sm font-bold tracking-tight leading-none">{title || "Untitled Document"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!mode && (
              <button
                onClick={() => setIsTemplateSelectorOpen(true)}
                className="h-9 px-4 rounded-xl border border-border bg-card text-foreground text-xs font-bold flex items-center gap-2 hover:bg-muted transition-all active:scale-95 shadow-sm"
              >
                <Layout className="h-4 w-4 text-primary" /> Template Library
              </button>
            )}
            <div className="h-6 w-px bg-border mx-1" />
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "h-9 w-9 rounded-xl border border-border flex items-center justify-center transition-all active:scale-95 group",
                isSidebarOpen ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-card text-muted-foreground hover:bg-muted"
              )}
              title={isSidebarOpen ? "Collapse Sidebar" : "Configure Layout"}
            >
              {isSidebarOpen ? <ChevronRight className="h-4.5 w-4.5" /> : <Settings className="h-4.5 w-4.5 group-hover:rotate-45 transition-transform" />}
            </button>
            <button
              onClick={confirmSave}
              disabled={setupStep === "setup"}
              className={cn(
                "h-9 px-5 rounded-xl text-primary-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed", 
                mode === "template" ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20" : "bg-primary hover:opacity-95 shadow-primary/20"
              )}
            >
              <Save className="h-4 w-4" /> {mode === "template" ? "Save Template" : editId ? "Update Document" : "Publish to Portal"}
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* LEFT SIDE: Editor & Formatting */}
          <div className="flex-1 flex flex-col min-w-0 relative bg-muted/20">
            {/* Formatting ribbon */}
            <div className={cn(
              "border-b border-border bg-card/80 backdrop-blur-md px-6 py-2 flex items-center gap-4 flex-nowrap shadow-sm overflow-x-auto no-scrollbar sticky top-0 z-20 transition-all duration-500",
              setupStep === "setup" && "opacity-50 grayscale pointer-events-none"
            )}>
              <div className="flex items-center gap-2 pr-4 border-r border-border/50">
                <Select onValueChange={(v) => execCommand("fontName", v)} disabled={setupStep === "setup"}>
                  <SelectTrigger className="h-8 w-[130px] text-[11px] font-bold bg-muted/40 border-none shadow-none focus:ring-1 ring-primary/20">
                    <SelectValue placeholder="Font Family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="'Courier New'">Courier New</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="'Times New Roman'">Times New Roman</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                    <SelectItem value="Inter">Inter (System)</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(v) => execCommand("fontSize", v)} disabled={setupStep === "setup"}>
                  <SelectTrigger className="h-8 w-[65px] text-[11px] font-bold bg-muted/40 border-none shadow-none focus:ring-1 ring-primary/20 text-center">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">8pt</SelectItem>
                    <SelectItem value="2">10pt</SelectItem>
                    <SelectItem value="3">12pt</SelectItem>
                    <SelectItem value="4">14pt</SelectItem>
                    <SelectItem value="5">18pt</SelectItem>
                    <SelectItem value="6">24pt</SelectItem>
                    <SelectItem value="7">36pt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-0.5 pr-4 border-r border-border/50">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="h-8 w-10 flex flex-col items-center justify-center rounded hover:bg-muted cursor-pointer transition-colors" title="Text Color">
                        <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="w-4 h-[2px] rounded-full mt-0.5" style={{ backgroundColor: textColor }} />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2 shadow-xl border-border" align="start">
                    <div className="grid grid-cols-10 gap-1">
                      {THEME_COLORS.map(c => (
                        <button
                          key={c}
                          className="w-5 h-5 rounded hover:scale-110 transition-transform focus:outline-none ring-1 ring-inset ring-black/10"
                          style={{ backgroundColor: c }}
                          onClick={() => { setTextColor(c); execCommand("foreColor", c); }}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <div className="h-8 w-10 flex flex-col items-center justify-center rounded hover:bg-muted cursor-pointer transition-colors" title="Highlight Color">
                        <Highlighter className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="w-4 h-[2px] rounded-full mt-0.5" style={{ backgroundColor: highlightColor === "transparent" ? "transparent" : highlightColor }} />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2 shadow-xl border-border" align="start">
                    <button 
                      className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded text-xs mb-2 font-bold"
                      onClick={() => { setHighlightColor("transparent"); document.execCommand("backColor", false, "transparent"); }}
                    >
                      <Eraser className="h-3 w-3" /> No Highlight
                    </button>
                    <div className="grid grid-cols-5 gap-1">
                      {HIGHLIGHT_COLORS.map(c => (
                        <button
                          key={c}
                          className="w-8 h-6 rounded hover:scale-105 transition-transform focus:outline-none ring-1 ring-inset ring-black/10"
                          style={{ backgroundColor: c }}
                          onClick={() => { setHighlightColor(c); execCommand("hiliteColor", c); }}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {toolbarGroups.map((group, gi) => (
                <div key={gi} className="flex items-center gap-0.5 border-r border-border/50 last:border-none pr-3 last:pr-0 shrink-0">
                    {group.tools.map((tool) => (
                      <button
                        key={tool.label}
                        onClick={() => execCommand(tool.command)}
                        className={cn(
                          "h-8 w-8 rounded flex items-center justify-center transition-all duration-200",
                          (activeCommands[tool.command] === true || tool.command === activeCommands.formatBlock)
                            ? "bg-primary text-primary-foreground shadow-sm scale-110"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        title={tool.label}
                      >
                        <tool.icon className="h-3.5 w-3.5" />
                      </button>
                    ))}
                </div>
              ))}
            </div>

            {/* Document Body Area */}
            <div className="flex-1 overflow-auto py-12 px-6 relative">
              <div className="max-w-[850px] mx-auto bg-card shadow-2xl shadow-black/5 border border-border/60 rounded-xl min-h-[calc(100vh-14rem)] relative flex flex-col transition-all duration-500 overflow-hidden">
                {/* Editor Content */}
                <div 
                  ref={contentWrapperRef} 
                  className={cn(
                    "flex-1 flex flex-col relative z-0 w-full transition-all duration-1000",
                    setupStep === "setup" && "blur-[8px] saturate-50 opacity-40 grayscale pointer-events-none"
                  )}
                  onClick={(e) => e.target === e.currentTarget && editorRef.current?.focus()}
                >
                  <div className="px-16 pt-16 pb-4 border-b border-border/30 space-y-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/60 px-2 py-0.5 rounded-full bg-primary/5 w-fit">
                      <Baseline className="h-3 w-3" />
                      <span>{mode === "template" ? "Structural Layout" : "Live Document Surface"}</span>
                    </div>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Untitled Document"
                      className="w-full text-4xl font-black bg-transparent focus:outline-none placeholder:text-muted-foreground/20 tracking-tighter"
                    />
                  </div>

                  <div
                    ref={editorRef}
                    contentEditable={setupStep === "editor"}
                    suppressContentEditableWarning
                    onKeyUp={handleSelectionChange}
                    onMouseUp={handleSelectionChange}
                    onInput={() => { saveSelection(); updateWordCount(); }}
                    onFocus={updateActiveStates}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-16 py-10 pb-40 focus:outline-none text-[15px] leading-relaxed prose prose-slate max-w-none min-h-full
                      dark:prose-invert
                      [&_h1]:text-3xl [&_h1]:font-black [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:tracking-tight
                      [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4
                      [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3
                      [&_p]:mb-5 [&_p]:text-foreground/80
                      [&_span[style*='background-color']]:px-1 [&_span[style*='background-color']]:rounded-sm
                      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5
                      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5
                      [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-5 [&_pre]:rounded-xl [&_pre]:font-mono [&_pre]:text-xs [&_pre]:mb-6
                      [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-6 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:mb-6 [&_blockquote]:bg-primary/5 [&_blockquote]:rounded-r-lg
                      [&_hr]:my-10 [&_hr]:border-border select-text
                      [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:rounded-lg [&_table]:overflow-hidden
                      [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold
                      [&_td]:border [&_td]:border-border [&_td]:p-3 [&_td]:align-top"
                    data-placeholder="Start typing your document..."
                    tabIndex={0}
                  />
                </div>

                {setupStep === "setup" && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/5 p-12 backdrop-blur-[2px] animate-in fade-in duration-500">
                     <div className="w-20 h-20 rounded-[2rem] bg-card border border-border shadow-2xl flex items-center justify-center mb-6 animate-bounce">
                        <Settings className="w-10 h-10 text-primary opacity-20" />
                     </div>
                     <h3 className="text-2xl font-black tracking-tight text-foreground/40 mb-2">Editor Offline</h3>
                     <p className="text-muted-foreground/60 text-center max-w-sm text-sm font-medium">Please finalize the document configuration in the right sidebar to unlock the writing surface.</p>
                     
                     <div className="mt-8 flex items-center gap-4">
                        <div className="h-px w-8 bg-border" />
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Secure Setup Mode</div>
                        <div className="h-px w-8 bg-border" />
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Status Bar */}
            {setupStep === "editor" && (
              <div className="h-8 bg-card border-t border-border flex items-center justify-between px-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest shrink-0 z-30">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-primary">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span>Real-time Draft Mode</span>
                  </div>
                  <div className="w-px h-3 bg-border" />
                  <span>{wordCount} Statistics</span>
                </div>
                <div className="flex items-center gap-4 opacity-60">
                   <div className="flex items-center gap-1.5">
                      <Monitor className="w-3 h-3" /> Full Desktop View
                   </div>
                   <div className="flex items-center gap-1.5">
                      <Globe className="w-3 h-3" /> Accessible to Portal
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Configuration Sidebar */}
          <aside className={cn(
            "h-full bg-card border-l border-border transition-all duration-500 ease-in-out flex flex-col shrink-0 relative z-40 shadow-2xl",
            isSidebarOpen ? "w-[400px]" : "w-0 overflow-hidden opacity-0 invisible"
          )}>
            <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col gap-10 no-scrollbar relative">
              {/* Internal Collapse Button */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-6 right-6 h-8 w-8 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-muted transition-all active:scale-95 z-50 group shadow-sm"
                title="Collapse Sidebar"
              >
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="flex flex-col gap-2 pr-8">
                 <h2 className="text-2xl font-black tracking-tight text-foreground uppercase italic px-1">Infrastructure</h2>
                 <p className="text-muted-foreground text-xs font-semibold px-1 leading-relaxed">Map this document to its structural destination within the DocsForge ecosystem.</p>
              </div>

              <div className="space-y-8">
                 {/* Step 1: Portal Visibility */}
                 <div className="space-y-4 animate-in slide-in-from-right-4 duration-500 delay-100">
                    <div className="flex items-center justify-between">
                       <Label className="uppercase tracking-widest text-[9px] font-black text-primary px-1">1. Portal Access Control</Label>
                       <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">01</div>
                    </div>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-14 bg-muted/40 border-border/60 text-left rounded-xl hover:bg-muted/60 transition-all shadow-sm" disabled={!!editId}>
                        {visibility === "all" ? (
                            <div className="flex items-center gap-3">
                               <Globe className="w-5 h-5 text-indigo-500" />
                               <div className="flex flex-col">
                                  <span className="text-xs font-black uppercase tracking-tight text-foreground">Global Visibility</span>
                                  <span className="text-[10px] text-muted-foreground font-medium">Available to all {banks.length} Clients</span>
                               </div>
                            </div>
                          ) : selectedBankId ? (
                            <div className="flex items-center gap-3">
                               {banks.find(b => b.id === selectedBankId)?.logoUrl ? (
                                 <div className="w-6 h-6 rounded border border-border overflow-hidden bg-white flex items-center justify-center shrink-0">
                                   <img src={banks.find(b => b.id === selectedBankId)?.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                 </div>
                               ) : (
                                 <Building2 className="w-5 h-5 text-primary" />
                               )}
                               <div className="flex flex-col">
                                  <span className="text-xs font-black uppercase tracking-tight text-foreground">{banks.find(b => b.id === selectedBankId)?.name}</span>
                                  <span className="text-[10px] text-muted-foreground font-medium">{assignedBanks.length > 0 ? `+ ${assignedBanks.length} Shared Access` : "Exclusive Access"}</span>
                               </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Designate target portal...</span>
                          )}
                          <ChevronDown className="h-4 w-4 opacity-30" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[340px] p-0 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-border rounded-2xl flex flex-col max-h-[400px]" align="end">
                         <div className="p-4 border-b border-border bg-muted/20">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-1">Global Permissions</h4>
                            <label className="flex items-center gap-4 bg-card border border-border p-3 rounded-xl cursor-pointer group hover:border-primary/40 transition-colors">
                               <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", visibility === "all" ? "bg-primary text-white shadow-lg" : "bg-muted text-muted-foreground")}>
                                  <Globe className="w-5 h-5" />
                               </div>
                               <div className="flex flex-col flex-1">
                                  <span className="text-xs font-black uppercase">Publish to All Banks</span>
                                  <span className="text-[10px] text-muted-foreground font-medium leading-tight">Master documentation visible to everyone</span>
                               </div>
                               <input 
                                 type="checkbox" 
                                 className="sr-only"
                                 checked={visibility === "all"}
                                 onChange={(e) => setVisibility(e.target.checked ? "all" : "specific")}
                               />
                               <div className={cn("w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center", visibility === "all" ? "bg-primary border-primary" : "border-border")}>
                                  {visibility === "all" && <Check className="w-3 h-3 text-white" />}
                                </div>
                            </label>
                         </div>
                         <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 no-scrollbar">
                           {visibility !== "all" && <div className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Client Specific</div>}
                           {banks.map(b => {
                              const isChecked = visibility === "all" || selectedBankId === b.id || assignedBanks.includes(b.id);
                              return (
                               <label key={b.id} className={cn("flex items-center gap-3 p-2.5 rounded-xl transition-all", visibility === "all" ? "opacity-30 pointer-events-none" : "cursor-pointer hover:bg-muted/80")}>
                                   <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold overflow-hidden", isChecked ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground")}>
                                      {b.logoUrl ? (
                                        <img src={b.logoUrl} alt={b.name} className="w-full h-full object-contain bg-white" />
                                      ) : (
                                        b.name.substring(0,2).toUpperCase()
                                      )}
                                   </div>
                                   <div className="flex flex-col flex-1 min-w-0">
                                      <span className={cn("text-xs font-black uppercase line-clamp-1", isChecked ? "text-foreground" : "text-muted-foreground")}>{b.name}</span>
                                      <span className="text-[9px] font-bold text-muted-foreground leading-none">{b.type} Portal</span>
                                   </div>
                                   <input 
                                     type="checkbox" 
                                     className="sr-only"
                                     checked={isChecked}
                                     onChange={(e) => {
                                        const checked = e.target.checked;
                                        if (checked) {
                                          if (!selectedBankId) setSelectedBankId(b.id);
                                          else setAssignedBanks(prev => [...prev, b.id]);
                                        } else {
                                          if (selectedBankId === b.id) {
                                            if (assignedBanks.length > 0) {
                                              setSelectedBankId(assignedBanks[0]);
                                              setAssignedBanks(prev => prev.filter(id => id !== assignedBanks[0]));
                                            } else setSelectedBankId("");
                                          } else setAssignedBanks(prev => prev.filter(id => id !== b.id));
                                        }
                                     }}
                                   />
                                   <div className={cn("w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center", isChecked ? "bg-primary border-primary" : "border-border")}>
                                      {isChecked && <Check className="w-3 h-3 text-white" />}
                                   </div>
                                </label>
                              );
                           })}
                         </div>
                      </PopoverContent>
                    </Popover>
                 </div>
                  {/* Step 2: Document Strategy */}
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-500 delay-200">
                     <div className="flex items-center justify-between">
                        <Label className="uppercase tracking-widest text-[9px] font-black text-primary px-1">2. Document Strategy</Label>
                        <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">02</div>
                     </div>
                     <div className="flex bg-muted/40 p-1 rounded-xl border border-border/60">
                        <button 
                          onClick={() => setDocStrategy("standard")}
                          className={cn("flex-1 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", docStrategy === "standard" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-card/50")}
                        >
                           Standard
                        </button>
                        <button 
                           onClick={() => setDocStrategy("version")}
                           className={cn("flex-1 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", docStrategy === "version" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-card/50")}
                        >
                           Version
                        </button>
                     </div>
                  </div>

                  {/* Step 3: Structural Placement (Conditional) */}
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-500 delay-300">
                     {docStrategy === "standard" ? (
                       <>
                         <div className="flex items-center justify-between">
                            <Label className="uppercase tracking-widest text-[9px] font-black text-primary px-1">3. Title Container Slot</Label>
                            <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">03</div>
                         </div>
                         <div className="flex flex-col gap-3">
                            <div className="flex bg-muted/40 p-1 rounded-xl border border-border/60">
                               <button 
                                 onClick={() => setDestinationType("existing")}
                                 className={cn("flex-1 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", destinationType === "existing" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-card/50")}
                               >
                                  Slot
                               </button>
                               <button 
                                  onClick={() => setDestinationType("new_title")}
                                  className={cn("flex-1 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", destinationType === "new_title" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-card/50")}
                               >
                                  Deploy
                               </button>
                            </div>
                            {destinationType === "existing" && (
                               <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                  <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                                    <SelectTrigger className="h-14 bg-card border-border/60 rounded-xl font-bold text-xs px-4">
                                      <SelectValue placeholder="Locate container slot..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-2xl border-border">
                                      {documents
                                        .filter(d => !d.parentId && (visibility === "all" || d.bankId === selectedBankId))
                                        .map((doc) => (
                                          <SelectItem key={doc.id} value={doc.id} className="font-bold text-xs">{doc.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                               </div>
                            )}
                            {destinationType === "new_title" && (
                               <div className="animate-in fade-in slide-in-from-top-2 duration-300 grid grid-cols-[1fr_80px] gap-2">
                                  <Input 
                                    value={newContainerName}
                                    onChange={(e) => { setNewContainerName(e.target.value); if (!pageName) setTitle(e.target.value); }}
                                    placeholder="Structural Title Name"
                                    className="h-14 rounded-xl border-border/60 bg-card font-bold text-xs"
                                  />
                                  <div className="relative">
                                    <span className="absolute left-3 top-1 text-[8px] font-black text-primary/60 uppercase z-10 pointer-events-none">Position</span>
                                    <Select value={newContainerPosition.toString()} onValueChange={(v) => setNewContainerPosition(parseInt(v))}>
                                      <SelectTrigger className="h-14 rounded-xl border-border/60 bg-card pt-4 font-black">
                                        <SelectValue placeholder="Position" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {!availableContainerPositions.includes(newContainerPosition) && newContainerPosition && (
                                          <SelectItem value={newContainerPosition.toString()}>{newContainerPosition}</SelectItem>
                                        )}
                                        {availableContainerPositions.map(p => (
                                          <SelectItem key={p} value={p.toString()}>{p}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                               </div>
                            )}
                         </div>
                       </>
                     ) : (
                       <>
                         <div className="flex items-center justify-between">
                            <Label className="uppercase tracking-widest text-[9px] font-black text-primary px-1">3. Version Configuration</Label>
                            <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">03</div>
                         </div>
                         <div className="flex flex-col gap-3">
                           <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                             <SelectTrigger className="h-14 bg-card border-border/60 rounded-xl font-bold text-xs px-4 text-left">
                               <SelectValue placeholder="Target document..." />
                             </SelectTrigger>
                             <SelectContent className="rounded-xl shadow-2xl border-border">
                               {documents
                                 .filter(d => !d.isVersion && (visibility === "all" || d.bankId === selectedBankId))
                                 .map((doc) => (
                                   <SelectItem key={doc.id} value={doc.id} className="font-bold text-xs">{doc.title}</SelectItem>
                                 ))}
                             </SelectContent>
                           </Select>
                           <div className="relative">
                              <span className="absolute left-4 top-1.5 text-[8px] font-black text-primary/60 uppercase tracking-widest">Version Label</span>
                              <Input 
                                value={versionLabel}
                                onChange={(e) => setVersionLabel(e.target.value)}
                                placeholder="e.g. v2.1 or Rev. B"
                                className="h-14 rounded-xl border-border/60 bg-card pt-4 px-4 font-black text-xs"
                              />
                           </div>
                         </div>
                       </>
                     )}
                  </div>

                  {/* Step 4: Page Definition */}
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-500 delay-[400ms]">
                     <div className="flex items-center justify-between">
                        <Label className="uppercase tracking-widest text-[9px] font-black text-primary px-1">4. Document Signature</Label>
                        <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">04</div>
                     </div>
                     <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-[1fr_80px] gap-2">
                           <div className="relative">
                              <span className="absolute left-4 top-1.5 text-[8px] font-black text-primary/60 uppercase tracking-widest">Document Name</span>
                              <Input 
                                value={pageName}
                                onChange={(e) => { setPageName(e.target.value); setTitle(e.target.value); }}
                                placeholder="e.g. Master API Contract"
                                className="h-14 rounded-xl border-border/60 bg-card pt-4 px-4 font-black text-xs"
                              />
                           </div>
                           <div className="relative">
                                <span className="absolute left-3 top-1.5 text-[8px] font-black text-primary/60 uppercase z-10 pointer-events-none">Position</span>
                                <Select value={pagePosition.toString()} onValueChange={(v) => setPagePosition(parseInt(v))}>
                                  <SelectTrigger className="h-14 rounded-xl border-border/60 bg-card pt-4 font-black">
                                    <SelectValue placeholder="Position" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {!availablePagePositions.includes(pagePosition) && pagePosition && (
                                      <SelectItem value={pagePosition.toString()}>{pagePosition}</SelectItem>
                                    )}
                                    {availablePagePositions.map(p => (
                                      <SelectItem key={p} value={p.toString()}>{p}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                           </div>
                        </div>
                        <div className="relative">
                           <span className="absolute left-4 top-1.5 text-[8px] font-black text-indigo-500/60 uppercase tracking-widest">Activity Code</span>
                           <Input 
                             value={formCode}
                             onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                             placeholder="e.g. F-USG-REV-001"
                             className="h-14 rounded-xl border-indigo-500/20 bg-card pt-4 px-4 font-black text-xs"
                           />
                           <Settings className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 opacity-20" />
                        </div>
                     </div>
                  </div>
              </div>
              
              <div className="mt-auto pt-10 border-t border-border/50">
                 <button
                   onClick={() => {
                      if (setupStep === "setup") handleStartWriting();
                      else setSetupStep("setup");
                   }}
                   className={cn(
                     "w-full h-14 rounded-[1.25rem] font-black uppercase tracking-[0.15em] text-xs transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]",
                     setupStep === "setup" 
                        ? "bg-primary text-primary-foreground shadow-primary/20" 
                        : "bg-amber-500 text-white shadow-amber-500/20"
                   )}
                 >
                    {setupStep === "setup" ? (
                       <><Settings className="h-4 w-4" /> Finalize Setup</>
                    ) : (
                       <><Baseline className="h-4 w-4" /> Config Mode</>
                    )}
                 </button>
                 <p className="text-[10px] text-center text-muted-foreground font-semibold mt-4 italic opacity-60">
                    {setupStep === "setup" ? "Click to lock settings and enable editor" : "Click to pause editor and adjust architecture"}
                 </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

 
      {setupStep === "editor" && showSelectionToolbar && (
        <div 
          className="fixed z-50 flex items-center gap-1 p-1 bg-card border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            top: toolbarPosition.top, 
            left: toolbarPosition.left,
            transform: "translateX(-50%)"
          }}
        >
          <button type="button" onClick={() => execCommand("bold")} className={cn("p-1.5 rounded hover:bg-muted transition-colors", activeCommands.bold && "text-primary bg-primary/10")}><Bold className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => execCommand("italic")} className={cn("p-1.5 rounded hover:bg-muted transition-colors", activeCommands.italic && "text-primary bg-primary/10")}><Italic className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={() => execCommand("underline")} className={cn("p-1.5 rounded hover:bg-muted transition-colors", activeCommands.underline && "text-primary bg-primary/10")}><Underline className="h-3.5 w-3.5" /></button>
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" title="Highlight Color" className="p-1.5 rounded hover:bg-muted flex items-center flex-col gap-[2px]">
                <Highlighter className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: highlightColor === "transparent" ? "transparent" : highlightColor }} />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-56 p-2 shadow-xl border-border" 
              align="center" side="top"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <button 
                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded text-xs mb-2 transition-colors focus:outline-none"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setHighlightColor("transparent");
                  document.execCommand("backColor", false, "transparent");
                  document.execCommand("hiliteColor", false, "transparent");
                }}
              >
                <Eraser className="h-3 w-3 text-muted-foreground" /> No Color
              </button>
              <div className="grid grid-cols-5 gap-1">
                {HIGHLIGHT_COLORS.map(c => (
                  <button
                    key={c}
                    className="w-8 h-6 rounded-sm hover:scale-105 transition-transform focus:outline-none ring-1 ring-inset ring-black/10"
                    style={{ backgroundColor: c }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setHighlightColor(c);
                      execCommand("hiliteColor", c);
                    }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button title="Text Color" className="p-1.5 rounded hover:bg-muted flex items-center flex-col gap-[2px]">
                <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: textColor }} />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-64 p-2 shadow-xl border-border" 
              align="center" side="top"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="grid grid-cols-10 gap-1">
                {THEME_COLORS.map(c => (
                  <button
                    key={c}
                    className="w-5 h-5 rounded-sm hover:scale-110 transition-transform focus:outline-none ring-1 ring-inset ring-black/10"
                    style={{ backgroundColor: c }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setTextColor(c);
                      execCommand("foreColor", c);
                    }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <TemplateSelector 
        open={isTemplateSelectorOpen} 
        onClose={() => setIsTemplateSelectorOpen(false)} 
        onSelect={handleSelectTemplate}
      />

      {setupStep === "editor" && (
        <div className="absolute bottom-0 left-0 right-0 h-7 bg-card border-t border-border flex items-center justify-between px-4 text-[10px] text-muted-foreground font-medium shrink-0 z-50">
          <div className="flex items-center gap-3">
            <span className="cursor-pointer hover:text-foreground transition-colors font-bold text-primary">Live Draft</span>
            <div className="w-px h-3 bg-border" />
            <span className="cursor-pointer hover:text-foreground transition-colors">{wordCount} Words</span>
          </div>
          <div className="flex items-center gap-3 hidden sm:flex">
            <div className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
              <Monitor className="w-3 h-3" /> Print Layout
            </div>
            <span className="cursor-pointer hover:text-foreground transition-colors uppercase tracking-widest text-[9px] font-black opacity-60">Continuous Flow Mode</span>
            <span className="cursor-pointer hover:text-foreground transition-colors">100%</span>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
