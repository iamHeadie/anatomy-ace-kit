import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";

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
      (b) => b.name.toLowerCase().includes(q) || b.latinName.toLowerCase().includes(q) || b.region.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const groups: Record<string, BonePart[]> = {};
    filtered.forEach((b) => {
      if (!groups[b.region]) groups[b.region] = [];
      groups[b.region].push(b);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="absolute left-4 bottom-4 z-10 glass-panel p-3 w-52 max-h-48 flex flex-col gap-2">
      <div className="relative">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bones..."
          className="w-full bg-secondary text-sm rounded-md pl-7 pr-3 py-1.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="overflow-y-auto scrollbar-thin space-y-2 flex-1">
        {Object.entries(grouped).map(([region, parts]) => (
          <div key={region}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1">{region}</p>
            {parts.map((bone) => (
              <button
                key={bone.id}
                onClick={() => onSelectPart(bone)}
                onMouseEnter={() => onHoverPart(bone.id)}
                onMouseLeave={() => onHoverPart(null)}
                className={`w-full text-left text-xs px-2 py-1 rounded transition-colors ${
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
      </div>
    </div>
  );
}
