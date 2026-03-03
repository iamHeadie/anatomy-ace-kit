import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skeletalParts } from "@/data/skeletalSystem";
import { RotateCcw, ChevronLeft, ChevronRight, Bone } from "lucide-react";
import { useUserState } from "@/hooks/useUserState";
import { BoneMiniViewer } from "@/components/anatomy/BoneMiniViewer";
import { BoneAtlasViewer } from "@/components/anatomy/BoneAtlasViewer";

export default function Flashcards() {
  const cards = useMemo(() => [...skeletalParts].sort(() => Math.random() - 0.5), []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { recordFlashcardReview } = useUserState();

  const card = cards[index];

  const handleFlip = () => {
    if (!flipped) {
      recordFlashcardReview(); // +25 XP when revealing answer
    }
    setFlipped(!flipped);
  };

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

      {/* ── Flashcard ── */}
      <div className="perspective-1000 cursor-pointer" onClick={handleFlip}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative h-80"
        >
          {/* ── FRONT ── */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 gap-3 relative"
            style={{
              backfaceVisibility: "hidden",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Atlas image — zoomed into this bone's region */}
            <div className="w-full flex-1 min-h-0 max-h-44 rounded-xl overflow-hidden"
              style={{ background: "rgba(0,0,0,0.25)" }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <BoneAtlasViewer boneId={card.id} boneName={card.name} className="w-full h-full" />
                </motion.div>
              </AnimatePresence>
            </div>
            {/* 3D viewer kept as secondary reference in a smaller pip */}
            <div className="absolute top-3 right-3 w-16 h-16 rounded-lg overflow-hidden opacity-50 hover:opacity-90 transition-opacity"
              style={{ background: "rgba(0,0,0,0.4)" }}
              title="3D model"
            >
              <BoneMiniViewer boneId={card.id} className="w-full h-full" />
            </div>

            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              What is this bone?
            </p>
            <p className="text-sm text-muted-foreground">{card.region}</p>
            <p className="text-xs text-primary animate-pulse">Tap to reveal</p>
          </div>

          {/* ── BACK ── */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 gap-3"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Bone icon as visual reference on back */}
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.3)" }}
            >
              <Bone size={24} className="text-primary" />
            </div>

            <p className="text-xs text-primary uppercase tracking-wider font-semibold">
              Answer
            </p>
            <p className="text-2xl font-bold text-foreground text-center">{card.name}</p>
            <p className="text-xs text-muted-foreground italic">{card.latinName}</p>

            {/* Description */}
            <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-md mt-1 line-clamp-3">
              {card.description}
            </p>

            {/* Facts / Mnemonic fallback */}
            {card.facts.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                {card.facts.slice(0, 2).map((fact, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full text-primary/80"
                    style={{
                      background: "rgba(14,165,233,0.1)",
                      border: "1px solid rgba(14,165,233,0.2)",
                    }}
                  >
                    {fact}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={prev} className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors">
          <ChevronLeft size={20} />
        </button>
        <button onClick={handleFlip} className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors">
          <RotateCcw size={20} />
        </button>
        <button onClick={next} className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
