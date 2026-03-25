import { Search, Bell, Moon, Sun, FileText, FolderOpen, Settings, Activity, LayoutDashboard, FilePlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useDocumentStore } from "@/stores/documentStore";

interface SearchItem {
  label: string;
  description: string;
  icon: typeof FileText;
  route: string;
}

export function TopBar() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const documents = useDocumentStore((s) => s.documents);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Build searchable items
  const allItems = useMemo<SearchItem[]>(() => {
    const pages: SearchItem[] = [
      { label: "Dashboard", description: "Home overview", icon: LayoutDashboard, route: "/" },
      { label: "Documents", description: "Browse all documents", icon: FolderOpen, route: "/documents" },
      { label: "Create New Document", description: "Write a new document", icon: FilePlus, route: "/create-new" },
      { label: "Activity", description: "Recent activity timeline", icon: Activity, route: "/activity" },
      { label: "Templates", description: "Document templates", icon: FileText, route: "/templates" },
      { label: "Settings", description: "Workspace preferences", icon: Settings, route: "/settings" },
      { label: "Profile Settings", description: "Manage your account name, email, team", icon: Settings, route: "/settings" },
      { label: "Notification Settings", description: "Configure update notifications", icon: Settings, route: "/settings" },
    ];

    const docItems: SearchItem[] = documents.map((doc) => ({
      label: doc.title,
      description: `Document · ${doc.author}`,
      icon: FileText,
      route: `/documents`,
    }));

    return [...pages, ...docItems];
  }, [documents]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 6);
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, allItems]);

  const handleSelect = (item: SearchItem) => {
    navigate(item.route);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-30">
      <div ref={containerRef} className="relative flex-1 max-w-md">
        <div className="flex items-center gap-2 h-9 px-3 rounded border border-border bg-background text-sm transition-colors focus-within:border-primary/50">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        {/* Dropdown results */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : (
              <div className="py-1 max-h-72 overflow-auto">
                {filtered.map((item, i) => (
                  <button
                    key={`${item.route}-${item.label}-${i}`}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={() => setDark(!dark)}
          className="h-9 w-9 rounded flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="h-9 w-9 rounded flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
