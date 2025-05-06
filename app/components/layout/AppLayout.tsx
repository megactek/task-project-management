import { Link, NavLink } from "@remix-run/react";
import { LucideIcon, Home, List, FolderKanban, FileText, BarChart } from "lucide-react";
import { cn } from "~/utils";

type NavItemProps = {
  to: string;
  icon: LucideIcon;
  label: string;
  emoji?: string;
};

const NavItem = ({ to, icon: Icon, label, emoji }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
          isActive
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground"
        )
      }
    >
      {emoji ? (
        <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{emoji}</span>
      ) : (
        <Icon className="h-4 w-4" />
      )}
      <span>{label}</span>
    </NavLink>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="text-primary text-xl">✅ TaskMaster</span>
          </Link>
        </div>
      </header>

      <div className="container flex-1 flex flex-col md:flex-row gap-4 py-4">
        <aside className="md:w-64 flex-shrink-0 md:h-[calc(100vh-4rem)] sticky top-14">
          <nav className="flex flex-col gap-1 py-2">
            <NavItem to="/" icon={Home} label="Dashboard" emoji="🏠" />
            <NavItem to="/tasks" icon={List} label="Tasks" emoji="✅" />
            <NavItem to="/projects" icon={FolderKanban} label="Projects" emoji="📂" />
            <NavItem to="/notes" icon={FileText} label="Notes" emoji="📝" />
            <NavItem to="/analytics" icon={BarChart} label="Analytics" emoji="📊" />
          </nav>

          <div className="mt-8 border-t pt-4">
            <h3 className="px-3 text-xs font-medium text-muted-foreground mb-2">Quick Actions</h3>
            <div className="flex flex-col gap-1">
              <Link 
                to="/tasks/new"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent text-muted-foreground"
              >
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">➕</span>
                <span>New Task</span>
              </Link>
              <Link 
                to="/projects/new"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent text-muted-foreground"
              >
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">➕</span>
                <span>New Project</span>
              </Link>
              <Link 
                to="/notes/new"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent text-muted-foreground"
              >
                <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">➕</span>
                <span>New Note</span>
              </Link>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
} 