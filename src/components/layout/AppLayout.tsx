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

// ─────────────────────────────────────────────────────────────────────────────
// CommandCenter
// ─────────────────────────────────────────────────────────────────────────────
//
// CLOSED STATE — "Identity Widget"
//   • Fixed top-left, z-[100] — always floats above the 3D canvas, the
//     floating bone labels (drei Html portal, z 50–90), and every page overlay
//   • Avatar: 48 × 48 px (≥ 44 px touch target recommended by Apple HIG)
//   • The button has an invisible 8 px padding region to extend the tap area
//     so a thumb touching near-but-not-exactly on the avatar still registers
//   • Positioned with env(safe-area-inset-*) so the notch / Dynamic Island
//     on iPhone never clips the widget
//
// OPEN STATE — full-height glassmorphism sidebar
//   • Width: min(80vw, 320px) — covers 80% of the screen on any phone while
//     capping at 320 px on tablets / desktop so it doesn't look too wide
//   • z-[98]: below the identity widget (z-[100]) so the widget can animate
//     out cleanly on top of the expanding sidebar
//   • Three sections: Profile (top), Nav links (middle), Settings (bottom)
//   • Padding honours iOS safe-area insets (notch + home indicator)
//
// ─────────────────────────────────────────────────────────────────────────────
function CommandCenter() {
  const [open, setOpen] = useState(false);
  const { state } = useUserState();
  const rank = getRank(state.xp);
  const progress = getRankProgress(state.xp);

  const close = () => setOpen(false);
  const handleNav = () => close();

  return (
    <>
      {/* ── Identity Widget — visible in the top-left when sidebar is closed ── */}
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
            /**
             * z-[100] sits above:
             *   • absolute z-0  — 3D canvas wrapper
             *   • absolute z-10 — page overlays (Dashboard / Quiz / Flashcards)
             *   • fixed   z-40  — InfoDrawer bottom sheet
             *   • portal  z-90  — drei FloatingBoneLabel (after SkeletonModel fix)
             *
             * p-2 adds invisible padding around the visible avatar circle,
             * expanding the touchable hit-box to ~64 × 64 px on mobile.
             */
            className="fixed z-[100] flex flex-col items-center group p-2"
            style={{
              /* Respect notch / Dynamic Island — requires viewport-fit=cover */
              top: "calc(env(safe-area-inset-top, 0px) + 8px)",
              left: "calc(env(safe-area-inset-left, 0px) + 8px)",
            }}
          >
            {/* Avatar circle — 48 × 48 px (w-12 h-12) */}
            <span
              className="relative flex items-center justify-center w-12 h-12 rounded-full transition-transform active:scale-95 group-hover:scale-105"
              style={{
                background: "rgba(14, 20, 36, 0.82)",
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
              className="mt-1 px-1.5 py-px text-[7px] font-bold rounded-full leading-tight whitespace-nowrap shadow-lg"
              style={{ background: rank.color, color: "#0d1526" }}
            >
              {rank.emoji} {rank.name}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Backdrop — tap to dismiss ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            /**
             * z-[95] — below the identity widget (z-[100]) but above the
             * page overlay (z-10) and InfoDrawer (z-40).
             * blur(2px) lets the student still see the 3D ghost behind the sheet.
             */
            className="fixed inset-0 z-[95] bg-black/40"
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
            /**
             * z-[98] — above the backdrop (z-[95]) but below the identity
             * widget (z-[100]) so the avatar can animate out cleanly on top.
             *
             * Width: min(80vw, 320px)
             *   → on a 375 px iPhone: 300 px  (80 %)
             *   → on a 390 px iPhone 14: 312 px (80 %)
             *   → on tablet / desktop: capped at 320 px
             */
            className="fixed left-0 top-0 bottom-0 z-[98] flex flex-col"
            style={{
              width: "min(80vw, 320px)",
              background: "rgba(8, 14, 26, 0.82)",
              backdropFilter: "blur(28px) saturate(160%)",
              WebkitBackdropFilter: "blur(28px) saturate(160%)",
              borderRight: "1px solid rgba(255,255,255,0.07)",
              /* Safe-area padding so content clears the notch (top),
                 home indicator (bottom), and side bezel (left) */
              paddingTop: "env(safe-area-inset-top, 0px)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
              paddingLeft: "env(safe-area-inset-left, 0px)",
            }}
          >
            {/* Close button */}
            <button
              onClick={close}
              aria-label="Close command center"
              className="absolute top-3 right-3 p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors z-10"
            >
              <X size={17} />
            </button>

            {/* ── Top: User Profile ── */}
            <div className="pt-12 px-5 pb-5 border-b border-white/[0.07]">
              <div className="flex items-center gap-4">
                {/* Large avatar with rank glow ring */}
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
                  {/* Name */}
                  <p className="font-semibold text-foreground truncate leading-tight">
                    {state.profile.name}
                  </p>

                  {/* Department */}
                  {state.profile.department && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {state.profile.department}
                    </p>
                  )}

                  {/* Occupation / Role */}
                  <p className="text-[11px] text-muted-foreground/70 truncate">
                    {state.profile.role}
                  </p>

                  {/* 2go Rank */}
                  <p
                    className="text-sm font-bold mt-1"
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
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                activeClassName="!text-primary !bg-primary/15"
              >
                <Bone size={16} />
                3D Systems
              </NavLink>

              {/* Dashboard / Quiz / Flashcards */}
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={handleNav}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                  activeClassName="!text-primary !bg-primary/15"
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* ── Bottom: Settings / Profile ── */}
            <div className="p-4 border-t border-white/[0.07]">
              <NavLink
                to="/profile"
                onClick={handleNav}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                activeClassName="!text-primary !bg-primary/15"
              >
                <Settings size={16} />
                Settings &amp; Profile
              </NavLink>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AppLayout
// ─────────────────────────────────────────────────────────────────────────────
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
    /**
     * Root container — deliberately uses 100dvh (dynamic viewport height)
     * via h-screen so it adapts when the iOS address bar shows / hides.
     * overflow-hidden prevents any bleed from the 3D canvas.
     */
    <div className="h-screen w-screen overflow-hidden relative bg-background">

      {/* 3D Canvas — pinned to the full viewport behind everything.
          w-full h-full fills the h-screen × w-screen root, so the 3D
          model naturally extends to the very bottom of the screen now
          that the bottom nav bar is gone. */}
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

      {/* Top-left Command Center (works on mobile AND desktop — no hidden / md:block) */}
      <CommandCenter />

      {/* Floating page overlays — Dashboard / Quiz / Flashcards / Profile.
          Inset 0 so they fill the entire screen including the bottom area
          that was previously reserved for the dock. */}
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

      {/* Study Drawer — slides up from the bottom when user taps a
          floating 3D bone label. z-40 keeps it above the page overlay
          (z-10) and below the CommandCenter (z-[95]+). The bottom 20% of
          the screen is intentionally kept clear (see maxHeight: 62vh in
          InfoDrawer) so this panel has room to appear without overlapping
          the top-left identity widget. */}
      <InfoDrawer
        part={selectedPart}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onSelectPart={handleSelectPart}
      />

      {/* Hover tooltip — desktop only (pointer: fine). Shows the bone name
          in a floating pill at the top centre of the canvas. */}
      {hoveredPart && !selectedPart && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 glass-panel px-3 py-1.5 text-sm font-mono text-primary pointer-events-none">
          {hoveredPart
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </div>
      )}

      {/* Hint pill — visible when a bone is selected but the study drawer
          is still closed. Positioned at bottom-6 so it clears the home
          indicator on modern iPhones while staying visible above the 3D grid.
          Does NOT conflict with the top-left identity widget. */}
      {selectedPart && !drawerOpen && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
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
