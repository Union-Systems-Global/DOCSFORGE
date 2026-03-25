import { Search, Bell, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export function TopBar() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-6 gap-4 sticky top-0 z-30">
      <button
        onClick={() => navigate("/search")}
        className="flex items-center gap-2 h-9 px-3 rounded border border-border bg-background text-sm text-muted-foreground hover:border-primary/50 transition-colors flex-1 max-w-md"
      >
        <Search className="h-4 w-4" />
        <span>Search documentation...</span>
        <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </button>

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
