import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Link2, Sparkles } from "lucide-react";
import type { BonePart } from "@/data/skeletalSystem";
import { skeletalParts } from "@/data/skeletalSystem";

interface PartDetailPanelProps {
  part: BonePart | null;
  onClose: () => void;
  onSelectPart: (part: BonePart) => void;
}

export function PartDetailPanel({ part, onClose, onSelectPart }: PartDetailPanelProps) {
  return (
    <AnimatePresence>
      {part && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="absolute right-4 top-4 bottom-4 w-80 glass-panel p-5 overflow-y-auto scrollbar-thin z-10 flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{part.name}</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>

          {/* Region badge */}
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary font-medium">
              {part.system}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-medium">
              {part.region}
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <BookOpen size={14} className="text-primary" />
              Description
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{part.description}</p>
          </div>

          {/* Key Facts */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles size={14} className="text-primary" />
              Key Facts
            </div>
            <ul className="space-y-1.5">
              {part.facts.map((fact, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1 text-xs">●</span>
                  {fact}
                </li>
              ))}
            </ul>
          </div>

          {/* Connected Parts */}
          {part.connections.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Link2 size={14} className="text-primary" />
                Connected Parts
              </div>
              <div className="flex flex-wrap gap-1.5">
                {part.connections.map((connId) => {
                  const connPart = skeletalParts.find((p) => p.id === connId);
                  if (!connPart) return null;
                  return (
                    <button
                      key={connId}
                      onClick={() => onSelectPart(connPart)}
                      className="text-xs px-2 py-1 rounded-md bg-secondary hover:bg-primary/20 text-secondary-foreground hover:text-primary transition-colors"
                    >
                      {connPart.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
