import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { skeletalParts, bodySystems, type BonePart } from "@/data/skeletalSystem";

interface PartsListProps {
  selectedPart: BonePart | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
}

export function PartsList({ selectedPart, onSelectPart, onHoverPart }: PartsListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return skeletalParts;
    const q = search.toLowerCase();
    return skeletalParts.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.latinName.toLowerCase().includes(q) ||
        b.region.toLowerCase().includes(q) ||
        b.subregion.toLowerCase().includes(q) ||
        b.ta98Id.toLowerCase().includes(q)
    );
  }, [search]);

  // Group by subregion for better TA98 organization
  const grouped = useMemo(() => {
    const groups: Record<string, BonePart[]> = {};
    filtered.forEach((b) => {
      const key = `${b.region} › ${b.subregion}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="h-full glass-panel flex flex-col border-r border-border/40 overflow-hidden">
      {/* Header */}
      <div className="p-4 pt-14 border-b border-border/30 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Skeletal System</h2>
            <p className="text-xs text-muted-foreground">{skeletalParts.length} bones · TA98</p>
          </div>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bones, Latin, TA98…"
            className="w-full bg-secondary text-sm rounded-md pl-8 pr-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Bone list grouped by subregion */}
      <div className="overflow-y-auto scrollbar-thin flex-1 p-3 space-y-3">
        {Object.entries(grouped).map(([groupKey, parts]) => (
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
                <span className="block">{bone.name}</span>
              </button>
            ))}
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No bones found</p>
        )}
      </div>

      {/* Other systems (coming soon) */}
      <div className="p-3 border-t border-border/30 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1">Other Systems</p>
        {bodySystems.filter(s => s.partCount === 0).map((sys) => (
          <div key={sys.id} className="flex items-center gap-2.5 px-2.5 py-1.5 text-muted-foreground/50 text-xs">
            <span>{sys.icon}</span>
            <span>{sys.name}</span>
            <span className="ml-auto text-[10px] bg-secondary px-1.5 py-0.5 rounded">Soon</span>
          </div>
        ))}
      </div>
    </div>
  );
}
