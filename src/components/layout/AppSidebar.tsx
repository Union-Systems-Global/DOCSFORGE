import { LayoutDashboard, FolderOpen, Search, Activity, Settings, FileText, ChevronLeft, FilePlus } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Projects", url: "/projects", icon: FolderOpen },
  { title: "Search", url: "/search", icon: Search },
  { title: "Activity", url: "/activity", icon: Activity },
  { title: "Templates", url: "/templates", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("flex items-center h-14 border-b border-border px-4", collapsed && "justify-center px-2")}>
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1">
            <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight">DocHub</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "h-7 w-7 rounded flex items-center justify-center hover:bg-muted transition-colors",
            collapsed && "rotate-180"
          )}
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
              collapsed && "justify-center px-2"
            )}
            activeClassName="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              SC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Sarah Chen</p>
              <p className="text-xs text-muted-foreground truncate">Engineering</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
