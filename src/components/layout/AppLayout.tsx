import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Bone,
  BookOpen,
  Layers,
  Settings,
  X,
} from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { AnatomyScene } from "@/components/anatomy/AnatomyScene";
import { InfoDrawer } from "@/components/anatomy/InfoDrawer";
import type { BonePart } from "@/data/skeletalSystem";
import { AnimatePresence, motion } from "framer-motion";
import { useUserState } from "@/hooks/useUserState";
import { getRank, getRankProgress } from "@/data/rankSystem";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/quiz", label: "Quiz", icon: BookOpen },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
];

/**
 * CommandCenter — unified top-left navigation hub.
 *
 * Closed state: a compact "Identity Widget" (avatar + 2go-style rank badge)
 * is pinned to the top-left so it doesn't obscure the skull/neck area.
 *
 * Open state: a full-height glassmorphism sidebar slides in from the left,
 * showing the user's profile at the top, all nav links in the middle, and
 * Settings / Profile at the bottom. The 3D model remains faintly visible
 * behind the translucent panel.
 */
function CommandCenter() {
  const [open, setOpen] = useState(false);
  const { state } = useUserState();
  const rank = getRank(state.xp);
  const progress = getRankProgress(state.xp);

  const close = () => setOpen(false);
  const handleNav = () => close();

  return (
    <>
      {/* ── Identity Widget — always pinned top-left when sidebar is closed ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="identity-widget"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(true)}
            aria-label="Open command center"
            className="fixed top-3 left-3 z-[60] flex flex-col items-center gap-1 group"
          >
            {/* Avatar circle with rank-coloured glow ring */}
            <span
              className="relative flex items-center justify-center w-11 h-11 rounded-full transition-transform active:scale-95 group-hover:scale-105"
              style={{
                background: "rgba(14, 20, 36, 0.80)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                boxShadow: `0 0 0 2.5px ${rank.color}, 0 0 14px ${rank.color}60`,
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

            {/* 2go-style rank badge */}
            <span
              className="px-1.5 py-px text-[7px] font-bold rounded-full leading-tight whitespace-nowrap shadow-lg"
              style={{ background: rank.color, color: "#0d1526" }}
            >
              {rank.emoji} {rank.name}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Backdrop — click to close ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[58] bg-black/30"
            style={{ backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}
            onClick={close}
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
            className="fixed left-0 top-0 bottom-0 z-[65] w-72 flex flex-col"
            style={{
              background: "rgba(8, 14, 26, 0.80)",
              backdropFilter: "blur(28px) saturate(160%)",
              WebkitBackdropFilter: "blur(28px) saturate(160%)",
              borderRight: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Close button */}
            <button
              onClick={close}
              aria-label="Close command center"
              className="absolute top-3 right-3 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors z-10"
            >
              <X size={17} />
            </button>

            {/* ── Top: User Profile ── */}
            <div className="pt-10 px-5 pb-5 border-b border-white/[0.07]">
              <div className="flex items-center gap-4">
                {/* Large avatar with rank ring */}
                <span
                  className="flex items-center justify-center w-16 h-16 rounded-full flex-shrink-0"
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
                    {state.profile.avatar}
                  </span>
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {state.profile.name}
                  </p>
                  {state.profile.department && (
                    <p className="text-xs text-muted-foreground truncate">
                      {state.profile.department}
                    </p>
                  )}
                  <p
                    className="text-sm font-semibold mt-0.5"
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
                    {state.xp.toLocaleString()} XP · {progress}% to next rank
                  </p>
                </div>
              </div>
            </div>

            {/* ── Middle: Navigation Links ── */}
            <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
              <p
                className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2"
                style={{ color: "rgba(255,255,255,0.30)" }}
              >
                Navigate
              </p>

              {/* 3D Systems */}
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

              {/* Dashboard / Quiz / Flashcards */}
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
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
            </nav>

            {/* ── Bottom: Settings / Profile ── */}
            <div className="p-4 border-t border-white/[0.07]">
              <NavLink
                to="/profile"
                onClick={handleNav}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                activeClassName="!text-primary !bg-primary/15"
              >
                <Settings size={15} />
                Settings &amp; Profile
              </NavLink>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const isViewer = location.pathname === "/viewer";

  const [selectedPart, setSelectedPart] = useState<BonePart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  /** drawerOpen — true only after the user taps the floating 3D label */
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

      {/* Top-left Command Center — unified navigation hub (both mobile & desktop) */}
      <CommandCenter />

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
            <div className="min-h-full bg-background/85 backdrop-blur-xl">
              <Outlet />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 2 — "Shutter" Study Drawer
          Slides up from the bottom when user taps a floating 3D bone label.
          The bottom 20 % of the screen is kept clear for this panel. */}
      <InfoDrawer
        part={selectedPart}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onSelectPart={handleSelectPart}
      />

      {/* Hover tooltip — shown when hovering a bone (desktop, no active selection) */}
      {hoveredPart && !selectedPart && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 glass-panel px-3 py-1.5 text-sm font-mono text-primary pointer-events-none">
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
