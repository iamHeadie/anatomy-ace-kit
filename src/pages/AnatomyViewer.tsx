import { useState, useRef, useCallback } from "react";
import { AnatomyScene } from "@/components/anatomy/AnatomyScene";
import { ContextPanel } from "@/components/anatomy/ContextPanel";
import { PartsList } from "@/components/anatomy/PartsList";
import type { BonePart } from "@/data/skeletalSystem";
import type { MusclePart } from "@/data/muscularSystem";
import { List, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ActiveSystem = "skeletal" | "muscular";

export default function AnatomyViewer() {
  // ── System selector ──────────────────────────────────────────────────────
  const [activeSystem, setActiveSystem] = useState<ActiveSystem>("skeletal");

  // ── Bone state ──────────────────────────────────────────────────────────
  const [selectedBone, setSelectedBone] = useState<BonePart | null>(null);
  const [hoveredBone, setHoveredBone]   = useState<string | null>(null);

  // ── Muscle state ────────────────────────────────────────────────────────
  const [selectedMuscle, setSelectedMuscle] = useState<MusclePart | null>(null);
  const [hoveredMuscle, setHoveredMuscle]   = useState<string | null>(null);

  // ── List panel ──────────────────────────────────────────────────────────
  const [showList, setShowList] = useState(false);
  const listMode = activeSystem === "muscular" ? "muscles" : "bones";

  // ── Muscle-priority lock ─────────────────────────────────────────────────
  const muscleJustSelectedRef = useRef(false);

  // ── Selection handlers ──────────────────────────────────────────────────
  const handleSelectBone = useCallback((bone: BonePart) => {
    if (muscleJustSelectedRef.current) return;
    setSelectedMuscle(null);
    setSelectedBone(bone);
  }, []);

  const handleSelectMuscle = useCallback((muscle: MusclePart) => {
    muscleJustSelectedRef.current = true;
    setSelectedBone(null);
    setSelectedMuscle(muscle);
    setTimeout(() => { muscleJustSelectedRef.current = false; }, 80);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedBone(null);
    setSelectedMuscle(null);
    muscleJustSelectedRef.current = false;
  }, []);

  const handleSystemChange = useCallback((value: string) => {
    setActiveSystem(value as ActiveSystem);
    handleClearSelection();
  }, [handleClearSelection]);

  // Unified "selected part" for ContextPanel
  const selectedPart = selectedBone ?? selectedMuscle;

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
        drawerOpen={!!selectedPart}
        activeSystem={activeSystem}
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
          {showList
            ? <X size={18} className="text-foreground" />
            : <List size={18} className="text-foreground" />}
        </button>

        {/* System selector dropdown */}
        <Select value={activeSystem} onValueChange={handleSystemChange}>
          <SelectTrigger className="glass-panel h-9 w-44 border-white/10 bg-background/60 text-sm font-medium backdrop-blur-md focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background/90 backdrop-blur-md border-white/10">
            <SelectItem value="skeletal" className="text-sm cursor-pointer">
              🦴 Skeletal System
            </SelectItem>
            <SelectItem value="muscular" className="text-sm cursor-pointer">
              💪 Muscular System
            </SelectItem>
          </SelectContent>
        </Select>
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
