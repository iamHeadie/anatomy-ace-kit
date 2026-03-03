import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Bone,
  BookOpen,
  Layers,
  User,
} from "lucide-react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { AnatomyScene } from "@/components/anatomy/AnatomyScene";
import { InfoDrawer } from "@/components/anatomy/InfoDrawer";
import type { BonePart } from "@/data/skeletalSystem";
import { AnimatePresence, motion } from "framer-motion";
import { useUserState } from "@/hooks/useUserState";
import { getRank, getRankProgress } from "@/data/rankSystem";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/quiz", label: "Quiz", icon: BookOpen },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/profile", label: "Profile", icon: User },
];

// Mobile dock excludes Profile — the top-right HUD handles profile access on mobile
const mobileNavItems = navItems.filter((item) => item.to !== "/profile");

/** Desktop sidebar: compact avatar + rank label, links to /profile */
function SidebarProfileCard() {
  const { state } = useUserState();
  const rank = getRank(state.xp);
  return (
    <NavLink
      to="/profile"
      end
      className="glass-panel p-2 rounded-xl flex flex-col items-center gap-1 mb-4 hover:bg-secondary/40 transition-colors"
      activeClassName="!ring-1 !ring-primary/30"
    >
      <span className={`text-lg ${rank.glowing ? "animate-diamond-glow" : ""}`}>
        {state.profile.avatar}
      </span>
      <span
        className="text-[8px] font-medium truncate max-w-[40px]"
        style={{ color: rank.color }}
      >
        {rank.name}
      </span>
    </NavLink>
  );
}

/**
 * Mobile HUD — floating avatar button pinned to the top-right corner.
 * Sits above the 3D viewport (z-[60]) and opens a right-side profile sheet.
 * Hidden on md+ screens where the sidebar profile card is used instead.
 */
function MobileProfileHUD() {
  const { state } = useUserState();
  const rank = getRank(state.xp);
  const progress = getRankProgress(state.xp);
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating avatar — top-right HUD button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open profile"
        className="md:hidden fixed top-3 right-3 z-[60] flex flex-col items-center"
      >
        <span
          className="relative flex items-center justify-center w-11 h-11 rounded-full transition-transform active:scale-95"
          style={{
            background: "rgba(14, 20, 36, 0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: `0 0 0 2.5px ${rank.color}, 0 0 12px ${rank.color}60`,
          }}
        >
          <span
            className={`text-2xl leading-none select-none ${
              rank.glowing ? "animate-diamond-glow" : ""
            }`}
          >
            {state.profile.avatar}
          </span>
        </span>
        {/* Rank chip below the avatar */}
        <span
          className="mt-1 px-1.5 py-px text-[7px] font-bold rounded-full leading-tight whitespace-nowrap"
          style={{
            background: rank.color,
            color: "#0d1526",
          }}
        >
          {rank.name}
        </span>
      </button>

      {/* Profile sheet — slides in from the right on tap */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-72 sm:w-80 p-0 flex flex-col gap-0"
        >
          {/* Accessibility title (visually hidden) */}
          <SheetTitle className="sr-only">User Profile</SheetTitle>

          {/* ── Profile header ── */}
          <div className="pt-10 px-5 pb-5 border-b border-border/50">
            <div className="flex items-center gap-4">
              {/* Large avatar with rank ring */}
              <span
                className="flex items-center justify-center w-16 h-16 rounded-full flex-shrink-0"
                style={{
                  background: "hsl(var(--secondary))",
                  boxShadow: `0 0 0 2.5px ${rank.color}, 0 0 14px ${rank.color}50`,
                }}
              >
                <span
                  className={`text-4xl leading-none select-none ${
                    rank.glowing ? "animate-diamond-glow" : ""
                  }`}
                >
                  {state.profile.avatar}
                </span>
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {state.profile.name}
                </p>
                <p className="text-sm font-medium mt-0.5" style={{ color: rank.color }}>
                  {rank.emoji} {rank.name}
                </p>

                {/* XP progress bar */}
                <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${progress}%`, background: rank.color }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {state.xp.toLocaleString()} XP · {progress}% to next rank
                </p>
              </div>
            </div>
          </div>

          {/* ── Quick stats ── */}
          <div className="grid grid-cols-2 gap-2.5 px-4 py-4 border-b border-border/50">
            {[
              { label: "Day Streak", value: state.streak, icon: "🔥" },
              { label: "Bones Found", value: state.bonesIdentified, icon: "🦴" },
              { label: "Quizzes Done", value: state.quizzesTaken, icon: "📝" },
              { label: "Flashcards", value: state.flashcardsReviewed, icon: "🃏" },
            ].map((s) => (
              <div key={s.label} className="glass-panel p-3 text-center">
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">
                  {s.icon} {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* ── Navigation ── */}
          <nav className="flex-1 p-4 space-y-0.5">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <User size={15} />
              Full Profile &amp; Settings
            </Link>
            <div className="my-2 h-px bg-border/40" />
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                activeClassName="!text-primary !bg-primary/15"
              >
                <item.icon size={15} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const isViewer = location.pathname === "/viewer";

  const [selectedPart, setSelectedPart] = useState<BonePart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  /** drawerOpen — true only after the user taps the floating 3D label (Step 2) */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navExpanded, setNavExpanded] = useState(false);

  // Selecting a new bone resets the drawer so only the floating label shows (Step 1)
  const handleSelectPart = (part: BonePart) => {
    setSelectedPart(part);
    setDrawerOpen(false);
  };

  // Tapping void clears highlight and hides all labels/drawers
  const handleClearSelection = () => {
    setSelectedPart(null);
    setDrawerOpen(false);
    setHoveredPart(null);
  };

  // Tapping the floating 3D label opens the study drawer (Step 2)
  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleNav = () => {
    setNavExpanded(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-background">
      {/* 3D Canvas — always full background */}
      <div className="absolute inset-0 z-0">
        <AnatomyScene
          selectedPart={selectedPart}
          hoveredPart={hoveredPart}
          onSelectPart={handleSelectPart}
          onHoverPart={setHoveredPart}
          onClearSelection={handleClearSelection}
          onOpenDrawer={handleOpenDrawer}
          drawerOpen={drawerOpen}
        />
      </div>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 z-30 w-14 flex-col items-center py-5 gap-2">
        <SidebarProfileCard />

        <div className="glass-panel p-1.5 rounded-xl flex flex-col items-center gap-1 flex-1">
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

      {/* Mobile top-right Profile HUD */}
      <MobileProfileHUD />

      {/* Mobile bottom dock — Profile removed; accessible via HUD instead */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-2 px-4">
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
          {mobileNavItems.map((item) => (
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

      {/* Step 2 — "Shutter" Study Drawer
          Only visible after tapping the floating 3D label */}
      <InfoDrawer
        part={selectedPart}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onSelectPart={handleSelectPart}
      />

      {/* Hover tooltip — shown when hovering a bone (desktop, no selection) */}
      {hoveredPart && !selectedPart && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 glass-panel px-3 py-1.5 text-sm font-mono text-primary pointer-events-none">
          {hoveredPart
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </div>
      )}

      {/* Hint pill — shown when a bone is selected but drawer is closed */}
      {selectedPart && !drawerOpen && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        >
          <div
            className="px-3 py-1.5 rounded-full text-[11px] font-medium text-white/60"
            style={{
              background: "rgba(14,165,233,0.12)",
              border: "1px solid rgba(14,165,233,0.25)",
              backdropFilter: "blur(8px)",
            }}
          >
            Tap the label to study
          </div>
        </motion.div>
      )}
    </div>
  );
}
