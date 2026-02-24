import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { skeletalParts } from "@/data/skeletalSystem";
import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

export default function Flashcards() {
  const cards = useMemo(() => skeletalParts.sort(() => Math.random() - 0.5), []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];

  const next = () => { setFlipped(false); setIndex((i) => (i + 1) % cards.length); };
  const prev = () => { setFlipped(false); setIndex((i) => (i - 1 + cards.length) % cards.length); };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Flashcards</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Card {index + 1} of {cards.length}
        </p>
      </div>

      <div className="perspective-1000 cursor-pointer" onClick={() => setFlipped(!flipped)}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative h-72"
        >
          {/* Front */}
          <div
            className="absolute inset-0 glass-panel flex flex-col items-center justify-center p-8 backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">What is this?</p>
            <p className="text-3xl font-bold text-foreground">{card.latinName}</p>
            <p className="text-sm text-muted-foreground mt-2">{card.region} skeleton</p>
            <p className="text-xs text-primary mt-6 animate-pulse-glow">Click to flip</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 glass-panel flex flex-col items-center justify-center p-8"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-xs text-primary uppercase tracking-wider mb-2">Answer</p>
            <p className="text-2xl font-bold text-foreground">{card.name}</p>
            <p className="text-sm text-muted-foreground mt-4 text-center leading-relaxed max-w-md">
              {card.description}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button onClick={prev} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => setFlipped(!flipped)} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors">
          <RotateCcw size={20} />
        </button>
        <button onClick={next} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
