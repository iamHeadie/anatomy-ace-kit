import { useState } from "react";
import { AnatomyScene } from "@/components/anatomy/AnatomyScene";
import { ContextPanel } from "@/components/anatomy/ContextPanel";
import { PartsList } from "@/components/anatomy/PartsList";
import type { BonePart } from "@/data/skeletalSystem";
import { List, X, Move3D, Tag } from "lucide-react";
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

        {/* Mode toggle */}
        <div className="glass-panel rounded-lg flex overflow-hidden">
          <button
            onClick={() => setViewerMode("moveable")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
              viewerMode === "moveable"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Moveable Mode — Explore with rotation & zoom"
          >
            <Move3D size={14} />
            {!isMobile && "Explore"}
          </button>
          <button
            onClick={() => setViewerMode("labelled")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
              viewerMode === "labelled"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Labelled Mode — Static atlas view with labels"
          >
            <Tag size={14} />
            {!isMobile && "Atlas"}
          </button>
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
