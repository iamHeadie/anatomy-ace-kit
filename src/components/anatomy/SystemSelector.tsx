import { bodySystems } from "@/data/skeletalSystem";
import { motion } from "framer-motion";

interface SystemSelectorProps {
  activeSystem: string;
  onSelectSystem: (system: string) => void;
}

export function SystemSelector({ activeSystem, onSelectSystem }: SystemSelectorProps) {
  return (
    <div className="absolute left-4 top-4 z-10 glass-panel p-3 space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">Body Systems</p>
      {bodySystems.map((sys) => (
        <button
          key={sys.id}
          onClick={() => onSelectSystem(sys.id)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all relative ${
            activeSystem === sys.id
              ? "text-primary"
              : sys.partCount === 0
              ? "text-muted-foreground/50 cursor-not-allowed"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
          disabled={sys.partCount === 0}
        >
          {activeSystem === sys.id && (
            <motion.div
              layoutId="activeSystem"
              className="absolute inset-0 bg-primary/10 rounded-md border border-primary/30"
            />
          )}
          <span className="text-base relative z-10">{sys.icon}</span>
          <span className="relative z-10 font-medium">{sys.name}</span>
          {sys.partCount === 0 && (
            <span className="ml-auto text-xs relative z-10 bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
              Soon
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
