import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";
import { muscularParts, type MusclePart } from "@/data/muscularSystem";

interface PartsListProps {
  selectedPart: BonePart | null;
  selectedMuscle: MusclePart | null;
  onSelectPart: (part: BonePart) => void;
  onSelectMuscle: (muscle: MusclePart) => void;
  onHoverPart: (id: string | null) => void;
  onHoverMuscle: (id: string | null) => void;
  listMode: "bones" | "muscles";
}

export function PartsList({
  selectedPart,
  selectedMuscle,
  onSelectPart,
  onSelectMuscle,
  onHoverPart,
  onHoverMuscle,
  listMode,
}: PartsListProps) {
  const [search, setSearch] = useState("");

  // ── Bone list ──────────────────────────────────────────────────────────
  const filteredBones = useMemo(() => {
    if (!search) return skeletalParts;
    const q = search.toLowerCase();
    return skeletalParts.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.region.toLowerCase().includes(q) ||
        b.subregion.toLowerCase().includes(q)
    );
  }, [search]);

  const groupedBones = useMemo(() => {
    const groups: Record<string, BonePart[]> = {};
    filteredBones.forEach((b) => {
      const key = `${b.region} › ${b.subregion}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });
    return groups;
  }, [filteredBones]);

  // ── Muscle list ────────────────────────────────────────────────────────
  const filteredMuscles = useMemo(() => {
    if (!search) return muscularParts;
    const q = search.toLowerCase();
    return muscularParts.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.region.toLowerCase().includes(q) ||
        m.subregion.toLowerCase().includes(q) ||
        m.action.toLowerCase().includes(q)
    );
  }, [search]);

  const groupedMuscles = useMemo(() => {
    const groups: Record<string, MusclePart[]> = {};
    filteredMuscles.forEach((m) => {
      const key = `${m.region} › ${m.subregion}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return groups;
  }, [filteredMuscles]);

  const isBoneMode   = listMode === "bones";
  const totalShown   = isBoneMode ? skeletalParts.length : muscularParts.length;
  const systemLabel  = isBoneMode ? "Skeletal System" : "Muscular System";
  const unitLabel    = isBoneMode ? "bones" : "muscles";
  const placeholder  = isBoneMode ? "Search bones, region…" : "Search muscles, action…";
  const emptyText    = isBoneMode ? "No bones found" : "No muscles found";

  return (
    <div className="h-full glass-panel flex flex-col border-r border-border/40 overflow-hidden">
      {/* Header */}
      <div className="p-4 pt-14 border-b border-border/30 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{systemLabel}</h2>
            <p className="text-xs text-muted-foreground">{totalShown} {unitLabel}</p>
          </div>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-secondary text-sm rounded-md pl-8 pr-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* List body */}
      <div className="overflow-y-auto scrollbar-thin flex-1 p-3 space-y-3">
        {isBoneMode ? (
          <>
            {Object.entries(groupedBones).map(([groupKey, parts]) => (
              <div key={groupKey}>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1.5 sticky top-0 bg-card/80 backdrop-blur-sm py-1 z-[1]">
                  {groupKey} <span className="text-muted-foreground/50">({parts.length})</span>
                </p>
                {parts.map((bone) => (
                  <button
                    key={bone.id}
                    onClick={() => onSelectPart(bone)}
                    onMouseEnter={() => onHoverPart(bone.id)}
                    onMouseLeave={() => onHoverPart(null)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                      selectedPart?.id === bone.id
                        ? "bg-primary/20 text-primary"
                        : "text-secondary-foreground hover:bg-secondary"
                    }`}
                  >
                    {bone.name}
                  </button>
                ))}
              </div>
            ))}
            {Object.keys(groupedBones).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">{emptyText}</p>
            )}
          </>
        ) : (
          <>
            {Object.entries(groupedMuscles).map(([groupKey, muscles]) => (
              <div key={groupKey}>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1.5 sticky top-0 bg-card/80 backdrop-blur-sm py-1 z-[1]">
                  {groupKey} <span className="text-muted-foreground/50">({muscles.length})</span>
                </p>
                {muscles.map((muscle) => (
                  <button
                    key={muscle.id}
                    onClick={() => onSelectMuscle(muscle)}
                    onMouseEnter={() => onHoverMuscle(muscle.id)}
                    onMouseLeave={() => onHoverMuscle(null)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors ${
                      selectedMuscle?.id === muscle.id
                        ? "bg-red-700/30 text-red-400"
                        : "text-secondary-foreground hover:bg-secondary"
                    }`}
                  >
                    <span className="block">{muscle.name}</span>
                    <span className="block text-[10px] text-muted-foreground/60 mt-0.5 truncate">
                      {muscle.action.split(";")[0].split(",")[0].trim()}
                    </span>
                  </button>
                ))}
              </div>
            ))}
            {Object.keys(groupedMuscles).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">{emptyText}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
