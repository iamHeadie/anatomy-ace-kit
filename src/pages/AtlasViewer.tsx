import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Lock, ZoomIn, ZoomOut, RefreshCw, Search, ChevronRight } from "lucide-react";
import { useUserState } from "@/hooks/useUserState";
import { getRank } from "@/data/rankSystem";
import { skeletalParts } from "@/data/skeletalSystem";
import { getBoneAtlasStyle } from "@/data/boneStyles";

const MASTER_IMAGE = "/images/master_skeleton.jpg";
const HD_IMAGE = "/images/master_skeleton_hd.jpg";

// Ranks that unlock the atlas (Senior = 2001+ XP, Black Diamond = 10001+ XP)
const UNLOCKED_RANKS = ["Senior", "Professional", "Black Diamond"];
const UNLOCK_XP = 2001;

export default function AtlasViewer() {
  const { state } = useUserState();
  const rank = getRank(state.xp);
  const isUnlocked = UNLOCKED_RANKS.includes(rank.name);
  const isBlackDiamond = rank.name === "Black Diamond";

  const [zoom, setZoom] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const imageUrl = isBlackDiamond ? HD_IMAGE : MASTER_IMAGE;

  const xpToUnlock = UNLOCK_XP - state.xp;
  const progressPct = Math.min(100, Math.round((state.xp / UNLOCK_XP) * 100));

  const filteredBones = search.trim()
    ? skeletalParts.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.region.toLowerCase().includes(search.toLowerCase())
      )
    : skeletalParts;

  const selectedBone = selected ? skeletalParts.find((b) => b.id === selected) : null;
  const selectedStyle = selected ? getBoneAtlasStyle(selected) : null;

  // ── Locked state ────────────────────────────────────────────────────────────
  if (!isUnlocked) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-8">
        {/* Locked hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 text-center space-y-6 w-full"
        >
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.3)" }}
          >
            <Lock size={32} className="text-red-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Atlas Locked</h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Reach <span className="text-yellow-400 font-semibold">Senior rank</span> (2,001 XP) to
              unlock full browsing of the High-Resolution Master Skeleton Atlas.
            </p>
            <p className="text-xs text-muted-foreground">
              Black Diamond members get access to the{" "}
              <span className="text-purple-400 font-semibold">HD version</span>.
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Your XP: <span className="text-primary font-semibold">{state.xp.toLocaleString()}</span></span>
              <span>Goal: <span className="text-yellow-400 font-semibold">{UNLOCK_XP.toLocaleString()} XP</span></span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(45,90%,60%), hsl(45,90%,40%))" }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {xpToUnlock > 0 && (
              <p className="text-xs text-muted-foreground">
                {xpToUnlock.toLocaleString()} XP to go
              </p>
            )}
          </div>

          {/* How to earn XP */}
          <div className="text-left space-y-2 text-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Earn XP by:</p>
            {[
              { label: "Correct quiz answers", xp: "+10 XP each" },
              { label: "Flashcard reviews", xp: "+25 XP each" },
              { label: "Daily login streak", xp: "+50 XP/day" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/60">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="text-primary font-semibold text-xs">{item.xp}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Blurred preview teaser */}
        <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: 200 }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${MASTER_IMAGE}')`,
              backgroundSize: "cover",
              backgroundPosition: "center 20%",
              filter: "blur(12px) brightness(0.4)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-muted-foreground">
            <Lock size={16} />
            <span className="text-sm font-medium">Unlock at Senior rank to browse</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Unlocked state ───────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Master Skeleton Atlas
            {isBlackDiamond && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(168,85,247,0.2)", color: "hsl(280,100%,80%)", border: "1px solid rgba(168,85,247,0.4)" }}
              >
                HD 💎
              </span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Browse all 206 bones — click a bone in the list to highlight it
          </p>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
            title="Reset zoom"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Left: bone list ─────────────────────────────────── */}
        <div className="glass-panel p-4 space-y-3 lg:col-span-1 overflow-y-auto max-h-[70vh]">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bones…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:border-primary/40 focus:outline-none"
            />
          </div>

          {/* Bone list */}
          <div className="space-y-1">
            {filteredBones.map((bone) => {
              const hasCoords = !!getBoneAtlasStyle(bone.id);
              return (
                <button
                  key={bone.id}
                  onClick={() => setSelected(selected === bone.id ? null : bone.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between gap-2 ${
                    selected === bone.id
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "hover:bg-secondary/80 text-secondary-foreground"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{bone.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{bone.region}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!hasCoords && (
                      <span className="text-[9px] text-muted-foreground/50">●</span>
                    )}
                    <ChevronRight size={12} className="text-muted-foreground/50" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: atlas image viewer ────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main atlas image */}
          <div
            ref={containerRef}
            className="glass-panel overflow-auto rounded-2xl"
            style={{ maxHeight: "65vh" }}
          >
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
                transition: "transform 0.2s ease",
              }}
            >
              {selectedStyle ? (
                /* Zoomed into selected bone */
                <div
                  className="w-full rounded-xl"
                  style={{
                    height: 480,
                    backgroundImage: `url('${imageUrl}')`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${selectedStyle.zoom * 100}%`,
                    backgroundPosition: `${selectedStyle.x}% ${selectedStyle.y}%`,
                    backgroundColor: "rgba(0,0,0,0.4)",
                  }}
                />
              ) : (
                /* Full atlas view */
                <img
                  src={imageUrl}
                  alt="Master Skeleton Atlas"
                  className="w-full object-contain rounded-xl select-none"
                  draggable={false}
                  onError={(e) => {
                    // If HD image fails, fall back to standard
                    if ((e.target as HTMLImageElement).src.includes("_hd")) {
                      (e.target as HTMLImageElement).src = MASTER_IMAGE;
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Selected bone info panel */}
          {selectedBone && (
            <motion.div
              key={selectedBone.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selectedBone.name}</h2>
                  <p className="text-xs text-muted-foreground italic">{selectedBone.latinName}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground shrink-0">
                  {selectedBone.region}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedBone.description}</p>
              {selectedBone.facts.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedBone.facts.map((fact, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full text-primary/80"
                      style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)" }}
                    >
                      {fact}
                    </span>
                  ))}
                </div>
              )}
              {!selectedStyle && (
                <p className="text-[10px] text-muted-foreground/60 italic">
                  Atlas coordinates for this bone are pending calibration.
                </p>
              )}
            </motion.div>
          )}

          {/* No bone selected hint */}
          {!selectedBone && (
            <p className="text-xs text-muted-foreground text-center">
              Select a bone from the list to zoom in and view its details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
