import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Bone,
  BookOpen,
  Layers,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { AnatomyScene } from "@/components/anatomy/AnatomyScene";
import { ContextPanel } from "@/components/anatomy/ContextPanel";
import type { BonePart } from "@/data/skeletalSystem";
import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/quiz", label: "Quiz", icon: BookOpen },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
];

export default function AppLayout() {
  const location = useLocation();
  const isViewer = location.pathname === "/viewer";
  const isHome = location.pathname === "/";
  const showScene = true; // always show 3D background

  const [selectedPart, setSelectedPart] = useState<BonePart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [navExpanded, setNavExpanded] = useState(false);

  // When navigating to a non-viewer page, deselect
  const handleNav = () => {
    setNavExpanded(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-background">
      {/* 3D Canvas — always full background */}
      {showScene && (
        <div className="absolute inset-0 z-0">
          <AnatomyScene
            selectedPart={selectedPart}
            hoveredPart={hoveredPart}
            onSelectPart={setSelectedPart}
            onHoverPart={setHoveredPart}
          />
        </div>
      )}

      {/* Slim side navigation — desktop left, mobile bottom dock */}
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 z-30 w-14 flex-col items-center py-5 gap-2">
        <div className="glass-panel p-2 rounded-xl flex flex-col items-center gap-1 mb-4">
          <GraduationCap size={20} className="text-primary" />
        </div>

        <div className="glass-panel p-1.5 rounded-xl flex flex-col items-center gap-1 flex-1">
          {/* Viewer toggle (bone icon) — always present */}
          <NavLink
            to="/viewer"
            end
            onClick={handleNav}
            className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            activeClassName="!text-primary !bg-primary/15"
          >
            <Bone size={18} />
          </NavLink>

          <div className="w-6 h-px bg-border/40 my-1" />

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={handleNav}
              className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              activeClassName="!text-primary !bg-primary/15"
            >
              <item.icon size={18} />
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile bottom dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-2 px-4">
        <div className="glass-panel px-2 py-1.5 rounded-2xl flex items-center gap-1">
          <NavLink
            to="/viewer"
            end
            onClick={handleNav}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
            activeClassName="!text-primary !bg-primary/15"
          >
            <Bone size={18} />
          </NavLink>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={handleNav}
              className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
              activeClassName="!text-primary !bg-primary/15"
            >
              <item.icon size={18} />
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Floating page overlays — rendered on top of 3D scene */}
      <AnimatePresence mode="wait">
        {!isViewer && (
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 z-10 md:pl-16 pb-16 md:pb-0 overflow-y-auto"
          >
            <div className="min-h-full bg-background/85 backdrop-blur-xl">
              <Outlet />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Touch-to-Action Context Panel — slides from right */}
      <ContextPanel
        part={selectedPart}
        onClose={() => setSelectedPart(null)}
        onSelectPart={setSelectedPart}
      />

      {/* Hover tooltip — centered top */}
      {hoveredPart && !selectedPart && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 glass-panel px-3 py-1.5 text-sm font-mono text-primary pointer-events-none">
          {hoveredPart
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </div>
      )}
    </div>
  );
}
