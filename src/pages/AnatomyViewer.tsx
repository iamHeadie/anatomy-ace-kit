import { useState, useCallback } from "react";
import { AnatomyScene } from "@/components/anatomy/AnatomyScene";
import { ContextPanel } from "@/components/anatomy/ContextPanel";
import { PartsList } from "@/components/anatomy/PartsList";
import type { BonePart } from "@/data/skeletalSystem";
import { List, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnatomyViewer() {
  // ── Bone state ──────────────────────────────────────────────────────────
  const [selectedBone, setSelectedBone] = useState<BonePart | null>(null);
  const [hoveredBone, setHoveredBone]   = useState<string | null>(null);

  // ── List panel ──────────────────────────────────────────────────────────
  const [showList, setShowList] = useState(false);

  // ── Selection handlers ──────────────────────────────────────────────────
  const handleSelectBone = useCallback((bone: BonePart) => {
    setSelectedBone(bone);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedBone(null);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
      {/* 3D scene */}
      <AnatomyScene
        selectedPart={selectedBone}
        hoveredPart={hoveredBone}
        onSelectPart={handleSelectBone}
        onHoverPart={setHoveredBone}
        onClearSelection={handleClearSelection}
        onOpenDrawer={() => {}}
        drawerOpen={!!selectedBone}
      />

      {/* ── Top-left toolbar ──────────────────────────────────────────── */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setShowList(!showList)}
          className="glass-panel p-2.5 rounded-lg hover:bg-secondary transition-colors"
          title={showList ? "Hide list" : "Show list"}
        >
          {showList
            ? <X size={18} className="text-foreground" />
            : <List size={18} className="text-foreground" />}
        </button>
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
              selectedMuscle={null}
              onSelectPart={(part) => { handleSelectBone(part); setShowList(false); }}
              onSelectMuscle={() => {}}
              onHoverPart={setHoveredBone}
              onHoverMuscle={() => {}}
              listMode="bones"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Context Panel (bone detail) ────────────────────────────────── */}
      <ContextPanel
        part={selectedBone}
        onClose={handleClearSelection}
        onSelectPart={(part) => handleSelectBone(part as BonePart)}
      />

      {/* ── Hover tooltip ────────────────────────────────────────────── */}
      {hoveredBone && !selectedBone && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 glass-panel px-3 py-1.5 text-sm font-mono text-primary pointer-events-none">
          {hoveredBone
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </div>
      )}
    </div>
  );
}
