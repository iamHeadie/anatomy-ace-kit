import { useState } from "react";
import { AnatomyScene } from "@/components/anatomy/AnatomyScene";
import { PartDetailPanel } from "@/components/anatomy/PartDetailPanel";
import { SystemSelector } from "@/components/anatomy/SystemSelector";
import { PartsList } from "@/components/anatomy/PartsList";
import type { BonePart } from "@/data/skeletalSystem";

export default function AnatomyViewer() {
  const [selectedPart, setSelectedPart] = useState<BonePart | null>(null);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [activeSystem, setActiveSystem] = useState("skeletal");

  return (
    <div className="relative w-full h-full bg-background">
      <AnatomyScene
        selectedPart={selectedPart}
        hoveredPart={hoveredPart}
        onSelectPart={setSelectedPart}
        onHoverPart={setHoveredPart}
      />
      <SystemSelector activeSystem={activeSystem} onSelectSystem={setActiveSystem} />
      <PartsList
        selectedPart={selectedPart}
        onSelectPart={setSelectedPart}
        onHoverPart={setHoveredPart}
      />
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
