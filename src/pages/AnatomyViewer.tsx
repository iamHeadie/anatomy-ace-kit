import { useState, useRef, useCallback } from "react";
import { AnatomyScene } from "@/components/anatomy/AnatomyScene";
import { ContextPanel } from "@/components/anatomy/ContextPanel";
import { PartsList } from "@/components/anatomy/PartsList";
import type { BonePart } from "@/data/skeletalSystem";
import type { MusclePart } from "@/data/muscularSystem";
import { List, X, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnatomyViewer() {
  // ── Bone state ──────────────────────────────────────────────────────────
  const [selectedBone, setSelectedBone] = useState<BonePart | null>(null);
  const [hoveredBone, setHoveredBone]   = useState<string | null>(null);

  // ── Muscle state ────────────────────────────────────────────────────────
  const [selectedMuscle, setSelectedMuscle] = useState<MusclePart | null>(null);
  const [hoveredMuscle, setHoveredMuscle]   = useState<string | null>(null);
  const [showMuscles, setShowMuscles]       = useState(true); // both systems on by default

  // ── List panel ──────────────────────────────────────────────────────────
  const [showList, setShowList]   = useState(false);
  const [listMode, setListMode]   = useState<"bones" | "muscles">("bones");

  // ── Muscle-priority lock ─────────────────────────────────────────────────
  // When a muscle is clicked via R3F events, this ref prevents SkeletonViewer's
  // DOM-level pointerup from overwriting the muscle selection with a bone.
  const muscleJustSelectedRef = useRef(false);

  // ── Selection handlers ──────────────────────────────────────────────────
  const handleSelectBone = useCallback((bone: BonePart) => {
    if (muscleJustSelectedRef.current) return; // muscle click took priority
    setSelectedMuscle(null);
    setSelectedBone(bone);
  }, []);

  const handleSelectMuscle = useCallback((muscle: MusclePart) => {
    muscleJustSelectedRef.current = true;
    setSelectedBone(null);
    setSelectedMuscle(muscle);
    // Reset flag after one event loop turn so future bone clicks work normally
    setTimeout(() => { muscleJustSelectedRef.current = false; }, 80);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedBone(null);
    setSelectedMuscle(null);
    muscleJustSelectedRef.current = false;
  }, []);

  // Unified "selected part" for ContextPanel (bone or muscle, whichever is set)
  const selectedPart = selectedBone ?? selectedMuscle;

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
      {/* 3D scene — skeletal + muscular overlay share the same canvas */}
      <AnatomyScene
        selectedPart={selectedBone}
        hoveredPart={hoveredBone}
        onSelectPart={handleSelectBone}
        onHoverPart={setHoveredBone}
        onClearSelection={handleClearSelection}
        onOpenDrawer={() => {}}
        drawerOpen={!!selectedPart}
        showMuscles={showMuscles}
        selectedMuscle={selectedMuscle}
        hoveredMuscle={hoveredMuscle}
        onSelectMuscle={handleSelectMuscle}
        onHoverMuscle={setHoveredMuscle}
      />

      {/* ── Top-left toolbar ──────────────────────────────────────────── */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
        {/* Parts list toggle */}
        <button
          onClick={() => setShowList(!showList)}
          className="glass-panel p-2.5 rounded-lg hover:bg-secondary transition-colors"
          title={showList ? "Hide list" : "Show list"}
        >
          {showList ? <X size={18} className="text-foreground" /> : <List size={18} className="text-foreground" />}
        </button>

        {/* Muscle overlay toggle */}
        <button
          onClick={() => setShowMuscles((v) => !v)}
          className={`glass-panel p-2.5 rounded-lg transition-colors ${
            showMuscles
              ? "bg-red-900/40 border border-red-500/40 hover:bg-red-900/60"
              : "hover:bg-secondary"
          }`}
          title={showMuscles ? "Hide muscular system" : "Show muscular system"}
        >
          {showMuscles
            ? <Eye size={18} className="text-red-400" />
            : <EyeOff size={18} className="text-muted-foreground" />}
        </button>

        {/* System mode chip when list is open */}
        {showList && (
          <div className="glass-panel flex rounded-lg overflow-hidden">
            <button
              onClick={() => setListMode("bones")}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                listMode === "bones"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              🦴 Bones
            </button>
            <button
              onClick={() => setListMode("muscles")}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                listMode === "muscles"
                  ? "bg-red-700/30 text-red-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              💪 Muscles
            </button>
          </div>
        )}
      </div>

      {/* ── Sliding parts list panel ──────────────────────────────────── */}
      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute left-0 top-0 bottom-0 z-10 w-72 max-w-[80vw]"
          >
            <PartsList
              selectedPart={selectedBone}
              selectedMuscle={selectedMuscle}
              onSelectPart={(part) => {
                handleSelectBone(part);
                setShowList(false);
              }}
              onSelectMuscle={(muscle) => {
                handleSelectMuscle(muscle);
                setShowList(false);
              }}
              onHoverPart={setHoveredBone}
              onHoverMuscle={setHoveredMuscle}
              listMode={listMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Context Panel (bone or muscle detail) ────────────────────── */}
      <ContextPanel
        part={selectedPart}
        onClose={handleClearSelection}
        onSelectPart={(part) => {
          if ((part as MusclePart).system === "Muscular") {
            handleSelectMuscle(part as MusclePart);
          } else {
            handleSelectBone(part as BonePart);
          }
        }}
      />

      {/* ── Hover tooltip ────────────────────────────────────────────── */}
      {(hoveredBone || hoveredMuscle) && !selectedPart && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 glass-panel px-3 py-1.5 text-sm font-mono text-primary pointer-events-none">
          {(hoveredBone ?? hoveredMuscle ?? "")
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </div>
      )}
    </div>
  );
}
