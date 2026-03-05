import { useState } from "react";
import { AnatomyScene } from "@/components/anatomy/AnatomyScene";
import { ContextPanel } from "@/components/anatomy/ContextPanel";
import { PartsList } from "@/components/anatomy/PartsList";
import type { BonePart } from "@/data/skeletalSystem";
import { List, X, ChevronDown, Move3D, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export type ViewerMode = "moveable" | "labelled";

export default function AnatomyViewer() {
  const [selectedPart, setSelectedPart] = useState<BonePart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [viewerMode, setViewerMode] = useState<ViewerMode>("moveable");
  const isMobile = useIsMobile();

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
      {/* 3D scene */}
      <AnatomyScene
        selectedPart={selectedPart}
        hoveredPart={hoveredPart}
        onSelectPart={setSelectedPart}
        onHoverPart={setHoveredPart}
        onClearSelection={() => setSelectedPart(null)}
        onOpenDrawer={() => {}}
        drawerOpen={!!selectedPart}
        viewerMode={viewerMode}
      />

      {/* Top bar: toggle + mode switch */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
        {/* Bone list toggle */}
        <button
          onClick={() => setShowList(!showList)}
          className="glass-panel p-2.5 rounded-lg hover:bg-secondary transition-colors"
          title={showList ? "Hide bone list" : "Show bone list"}
        >
          {showList ? <X size={18} className="text-foreground" /> : <List size={18} className="text-foreground" />}
        </button>

        {/* View Mode dropdown */}
        <div
          className="glass-panel rounded-lg flex items-center gap-2 px-2.5 py-1.5"
          style={{ position: "relative" }}
        >
          {viewerMode === "moveable" ? (
            <Move3D size={13} className="text-primary shrink-0" />
          ) : (
            <Tag size={13} className="text-primary shrink-0" />
          )}
          <select
            value={viewerMode}
            onChange={(e) => setViewerMode(e.target.value as ViewerMode)}
            aria-label="View mode"
            style={{
              appearance: "none",
              WebkitAppearance: "none",
              background: "transparent",
              color: "inherit",
              border: "none",
              outline: "none",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              paddingRight: "18px",
            }}
          >
            <option value="moveable" style={{ background: "#1e2030" }}>Floating Mode</option>
            <option value="labelled" style={{ background: "#1e2030" }}>Labelled Mode</option>
          </select>
          <ChevronDown
            size={12}
            className="text-muted-foreground shrink-0"
            style={{ position: "absolute", right: "8px", pointerEvents: "none" }}
          />
        </div>
      </div>

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

      {/* Context Panel */}
      <ContextPanel
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
