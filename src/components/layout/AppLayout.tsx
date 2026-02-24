import { NavLink } from "@/components/NavLink";
import { Bone, LayoutDashboard, BookOpen, Layers, GraduationCap } from "lucide-react";
import { Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/viewer", label: "3D Viewer", icon: Bone },
  { to: "/quiz", label: "Quiz", icon: BookOpen },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="h-14 border-b border-border flex items-center px-6 gap-6 shrink-0">
        <div className="flex items-center gap-2 mr-6">
          <GraduationCap size={22} className="text-primary" />
          <span className="font-semibold text-foreground text-sm tracking-tight">My Anatomy Tutor</span>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              activeClassName="!text-primary bg-primary/10"
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
