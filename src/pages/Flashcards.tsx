import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { skeletalParts } from "@/data/skeletalSystem";
import { getBoneImage } from "@/data/boneImages";
import { RotateCcw, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

export default function Flashcards() {
  const cards = useMemo(() => skeletalParts.sort(() => Math.random() - 0.5), []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[index];
  const imageUrl = getBoneImage(card.id, card.region);

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
            className="absolute inset-0 glass-panel flex flex-col items-center justify-center p-6 backface-hidden gap-3"
            style={{ backfaceVisibility: "hidden" }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={card.name}
                className="h-28 w-auto object-contain rounded-lg opacity-90"
                loading="lazy"
              />
            ) : (
              <div className="h-28 w-28 rounded-lg bg-secondary/50 flex items-center justify-center">
                <ImageOff size={28} className="text-muted-foreground/40" />
              </div>
            )}
            <p className="text-xs text-muted-foreground uppercase tracking-wider">What is this?</p>
            <p className="text-sm text-muted-foreground">{card.region} skeleton</p>
            <p className="text-xs text-primary animate-pulse-glow">Click to flip</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 glass-panel flex flex-col items-center justify-center p-6 gap-2"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            {imageUrl && (
              <img src={imageUrl} alt={card.name} className="h-20 w-auto object-contain rounded-lg opacity-80" />
            )}
            <p className="text-xs text-primary uppercase tracking-wider">Answer</p>
            <p className="text-2xl font-bold text-foreground">{card.name}</p>
            <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-md">
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
