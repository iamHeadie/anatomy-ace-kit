import { useState } from "react";
import { AnatomyScene } from "@/components/anatomy/AnatomyScene";
import { PartDetailPanel } from "@/components/anatomy/PartDetailPanel";
import { PartsList } from "@/components/anatomy/PartsList";
import type { BonePart } from "@/data/skeletalSystem";
import { List, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AnatomyViewer() {
  const [selectedPart, setSelectedPart] = useState<BonePart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
      {/* 3D scene — always full size */}
      <AnatomyScene
        selectedPart={selectedPart}
        hoveredPart={hoveredPart}
        onSelectPart={setSelectedPart}
        onHoverPart={setHoveredPart}
      />

      {/* Toggle button for bones list */}
      <button
        onClick={() => setShowList(!showList)}
        className="absolute left-4 top-4 z-20 glass-panel p-2.5 rounded-lg hover:bg-secondary transition-colors"
        title={showList ? "Hide bone list" : "Show bone list"}
      >
        {showList ? <X size={18} className="text-foreground" /> : <List size={18} className="text-foreground" />}
      </button>

      {/* Sliding bone list panel */}
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
              selectedPart={selectedPart}
              onSelectPart={(part) => {
                setSelectedPart(part);
                setShowList(false);
              }}
              onHoverPart={setHoveredPart}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail panel (right side) */}
      <PartDetailPanel
        part={selectedPart}
        onClose={() => setSelectedPart(null)}
        onSelectPart={setSelectedPart}
      />

      {/* Hover tooltip */}
      {hoveredPart && !selectedPart && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 glass-panel px-3 py-1.5 text-sm font-mono text-primary pointer-events-none">
          {hoveredPart.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </div>
      )}
    </div>
  );
}
