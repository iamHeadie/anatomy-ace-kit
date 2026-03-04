import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Bone,
  BookOpen,
  Layers,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { AnatomyScene } from "@/components/anatomy/AnatomyScene";
import { InfoDrawer } from "@/components/anatomy/InfoDrawer";
import type { BonePart } from "@/data/skeletalSystem";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getRank, getRankProgress } from "@/data/rankSystem";
import { ProfileHeaderHUD } from "@/components/layout/ProfileHeaderHUD";
import { InteractiveTour, TourTriggerButton } from "@/components/onboarding/InteractiveTour";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, tourId: "tour-dashboard" },
  { to: "/quiz", label: "Quiz", icon: BookOpen, tourId: "tour-quiz" },
  { to: "/flashcards", label: "Flashcards", icon: Layers, tourId: "tour-flashcards" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CommandCenter — full-height glassmorphism sidebar.
//
// The old "identity widget" (avatar button pinned top-left) has been removed;
// the new ProfileHeaderHUD takes over that role as the open trigger.  This
// component now only owns the backdrop and the slide-in panel.
// ─────────────────────────────────────────────────────────────────────────────
interface CommandCenterProps {
  open: boolean;
  onClose: () => void;
}

function CommandCenter({ open, onClose }: CommandCenterProps) {
  const { profile, signOut } = useAuth();
  const xp = profile?.xp ?? 0;
  const rank = getRank(xp);
  const progress = getRankProgress(xp);
  const displayName = profile?.username || "Explorer";
  const department = profile?.department || "";
  const avatar = profile?.avatar || "💀";

  const handleNav = () => onClose();

  return (
    <>
      {/* ── Backdrop — click outside to close ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30"
            style={{
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
            }}
            onClick={onClose}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* ── Full-height glassmorphism sidebar ── */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[80vw] max-w-72 flex flex-col gap-6 overflow-y-auto p-6"
            style={{
              background: "rgba(8, 14, 26, 0.80)",
              backdropFilter: "blur(28px) saturate(160%)",
              WebkitBackdropFilter: "blur(28px) saturate(160%)",
              borderRight: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close command center"
              className="self-end p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors"
            >
              <X size={17} />
            </button>

            {/* ── Section 1: Profile Header (Identity Block) ── */}
            <div id="tour-profile" className="flex-shrink-0 pt-4 mb-5 border-b border-white/10 pb-6">
              <div className="flex items-start gap-4">
                {/* Large avatar with rank ring */}
                <span
                  className="flex items-center justify-center w-16 h-16 rounded-full flex-shrink-0 mt-1"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    boxShadow: `0 0 0 2.5px ${rank.color}, 0 0 16px ${rank.color}50`,
                  }}
                >
                  <span
                    className={`text-4xl leading-none select-none ${
                      rank.glowing ? "animate-diamond-glow" : ""
                    }`}
                  >
                    {avatar}
                  </span>
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {displayName}
                  </p>
                  {department && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-snug mt-0.5">
                      {department}
                    </p>
                  )}
                  {profile?.occupation && (
                    <p className="text-xs text-muted-foreground/70 truncate">
                      {profile.occupation}
                    </p>
                  )}
                  <p
                    className="text-sm font-semibold mt-1"
                    style={{ color: rank.color }}
                  >
                    {rank.emoji} {rank.name}
                  </p>

                  {/* XP progress bar */}
                  <div
                    className="mt-2 h-1 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${progress}%`, background: rank.color }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {xp.toLocaleString()} XP · {progress}% to next rank
                  </p>
                </div>
              </div>
            </div>

            {/* ── Section 2: Navigation Links (Middle Block) ── */}
            <nav className="relative z-10 flex-shrink-0">
              <p
                className="text-[9px] font-bold uppercase tracking-widest mb-3"
                style={{ color: "rgba(255,255,255,0.30)" }}
              >
                Navigate
              </p>

              <div className="space-y-2">
                <NavLink
                  to="/viewer"
                  end
                  onClick={handleNav}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                  activeClassName="!text-primary !bg-primary/15"
                >
                  <Bone size={15} />
                  3D Systems
                </NavLink>

                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    id={item.tourId}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={handleNav}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                    activeClassName="!text-primary !bg-primary/15"
                  >
                    <item.icon size={15} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* ── Bottom: Settings / Profile + Tour + Sign Out ── */}
            <div className="mt-auto flex-shrink-0 pt-4 border-t border-white/10 space-y-1">
              <NavLink
                to="/profile"
                onClick={handleNav}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                activeClassName="!text-primary !bg-primary/15"
              >
                <Settings size={15} />
                Settings &amp; Profile
              </NavLink>
              <TourTriggerButton />
              <button
                onClick={() => { onClose(); signOut(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AppLayout — root shell: 3D canvas always visible in the background; page
// overlays slide in on top; ProfileHeaderHUD fixed at the very top.
// ─────────────────────────────────────────────────────────────────────────────
export default function AppLayout() {
  const location = useLocation();
  const isViewer = location.pathname === "/viewer";

  // Lifted sidebar open state — shared between ProfileHeaderHUD (trigger) and
  // CommandCenter (sidebar + backdrop).
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedPart, setSelectedPart] = useState<BonePart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelectPart = (part: BonePart) => {
    setSelectedPart(part);
    setDrawerOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedPart(null);
    setDrawerOpen(false);
    setHoveredPart(null);
  };

  const handleOpenDrawer = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-background">
      {/* Interactive spotlight onboarding tour */}
      <InteractiveTour
        onOpenSidebar={() => setSidebarOpen(true)}
        onCloseSidebar={() => setSidebarOpen(false)}
      />
      {/* 3D Canvas — always full background */}
      <div className="absolute inset-0 z-[1]">
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

      {/* Persistent HUD — pinned to the very top of every view */}
      <ProfileHeaderHUD onOpen={() => setSidebarOpen(true)} />

      {/* CommandCenter — backdrop + slide-in sidebar (no identity widget) */}
      <CommandCenter
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Floating page overlays — rendered on top of 3D scene */}
      <AnimatePresence mode="wait">
        {!isViewer && (
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 z-10 overflow-y-auto"
          >
            {/* pt-14 offsets content below the 56px ProfileHeaderHUD */}
            <div className="min-h-full bg-background/85 backdrop-blur-xl pt-14">
              <Outlet />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bone study drawer — slides up from the bottom */}
      <InfoDrawer
        part={selectedPart}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onSelectPart={handleSelectPart}
      />

      {/* Hover tooltip — moved to top-[72px] so it clears the HUD */}
      {hoveredPart && !selectedPart && (
        <div className="absolute top-[72px] left-1/2 -translate-x-1/2 z-20 glass-panel px-3 py-1.5 text-sm font-mono text-primary pointer-events-none">
          {hoveredPart
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </div>
      )}

      {/* Hint pill — shown when a bone is selected but drawer is still closed */}
      {selectedPart && !drawerOpen && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
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
