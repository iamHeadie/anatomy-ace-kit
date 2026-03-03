import { motion } from "framer-motion";
import { useUserState } from "@/hooks/useUserState";
import { getRank } from "@/data/rankSystem";

interface ProfileHeaderHUDProps {
  onOpen: () => void;
}

/**
 * ProfileHeaderHUD — a persistent glassmorphism strip pinned to the very top
 * of every view (Dashboard, Study modes, etc.).
 *
 * Layout (justify-between):
 *   LEFT   — 40px avatar circle + Name (bold) + Department (muted, desktop only)
 *   CENTER — "206 Bones" thin mastery progress bar (desktop only)
 *   RIGHT  — Streak 🔥 counter + 2go-style Rank badge
 *
 * Clicking anywhere on the strip opens the full Profile / CommandCenter sidebar.
 *
 * Mobile adaptations (below sm breakpoint):
 *   • Department label is hidden
 *   • Center mastery bar is hidden
 *   • Shows: Avatar + Rank Badge + Streak flame
 */
export function ProfileHeaderHUD({ onOpen }: ProfileHeaderHUDProps) {
  const { state } = useUserState();
  const rank = getRank(state.xp);
  const bonesPercent = Math.min(
    100,
    state.bonesIdentified > 0
      ? Math.round((state.bonesIdentified / 206) * 100)
      : 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label="Open profile sidebar"
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className="fixed top-0 left-0 right-0 z-[90] flex items-center justify-between px-4 h-14 cursor-pointer select-none touch-manipulation"
      style={{
        background: "rgba(8, 14, 26, 0.65)",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* ── LEFT: Avatar + Name + Department ────────────────────────── */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* 40px avatar circle with rank-glow ring */}
        <span
          className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0"
          style={{
            background: "rgba(14, 20, 36, 0.85)",
            boxShadow: `0 0 0 2px ${rank.color}, 0 0 10px ${rank.color}55`,
          }}
        >
          <span
            className={`text-xl leading-none select-none ${
              rank.glowing ? "animate-diamond-glow" : ""
            }`}
          >
            {state.profile.avatar}
          </span>
        </span>

        <div className="flex flex-col min-w-0 leading-tight">
          <span className="font-bold text-sm text-foreground truncate">
            {state.profile.name}
          </span>
          {/* Department — hidden on mobile */}
          {state.profile.department && (
            <span className="hidden sm:block text-[11px] text-muted-foreground/80 truncate">
              {state.profile.department}
            </span>
          )}
        </div>
      </div>

      {/* ── CENTER: 206 Bones mastery bar — hidden on mobile ─────────── */}
      <div className="hidden sm:flex flex-col items-center flex-1 max-w-[280px] mx-6 gap-1.5">
        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            206 Bones
          </span>
          <span
            className="text-[10px] font-bold tabular-nums"
            style={{ color: rank.color }}
          >
            {state.bonesIdentified}&thinsp;/&thinsp;206
          </span>
        </div>

        {/* Thin progress bar */}
        <div
          className="w-full h-1 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${bonesPercent}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{
              background: `linear-gradient(90deg, ${rank.color}, hsl(168,76%,62%))`,
            }}
          />
        </div>
      </div>

      {/* ── RIGHT: Streak 🔥 + 2go Rank Badge ───────────────────────── */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Streak flame */}
        <div className="flex items-center gap-0.5">
          <span className="text-base leading-none">🔥</span>
          <span className="text-xs font-bold text-orange-400 tabular-nums">
            {state.streak}
          </span>
        </div>

        {/* 2go-style Rank Badge with high-contrast background */}
        <span
          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold leading-tight whitespace-nowrap shadow-lg"
          style={{
            background: rank.color,
            color: "#090f1d",
          }}
        >
          {rank.emoji}&nbsp;{rank.name}
        </span>
      </div>
    </motion.div>
  );
}
