import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ta98Muscles, muscleRegions, type TA98Muscle } from "@/data/muscularSystem";
import { RotateCcw, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useUserState } from "@/hooks/useUserState";

export default function MuscleFlashcards() {
  const [regionFilter, setRegionFilter] = useState<string>("All");
  const { recordFlashcardReview } = useUserState();

  const cards = useMemo(() => {
    const filtered = regionFilter === "All"
      ? ta98Muscles
      : ta98Muscles.filter((m) => m.region === regionFilter);
    return [...filtered].sort(() => Math.random() - 0.5);
  }, [regionFilter]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useMemo(() => { setIndex(0); setFlipped(false); }, [regionFilter]);

  const card = cards[index];

  const handleFlip = () => {
    if (!flipped) recordFlashcardReview();
    setFlipped(!flipped);
  };

  const next = () => { setFlipped(false); setIndex((i) => (i + 1) % cards.length); };
  const prev = () => { setFlipped(false); setIndex((i) => (i - 1 + cards.length) % cards.length); };

  if (!card) return (
    <div className="p-6 max-w-2xl mx-auto text-center text-muted-foreground">
      No muscles found for this region.
    </div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Muscle Flashcards</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Card {index + 1} of {cards.length} · {regionFilter}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-secondary text-foreground text-sm rounded-lg px-3 py-1.5 border border-border/30 outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Regions</option>
            {muscleRegions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Flashcard */}
      <div className="perspective-1000 cursor-pointer" onClick={handleFlip}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative h-80"
        >
          {/* FRONT — English name + hint */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 gap-4"
            style={{
              backfaceVisibility: "hidden",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={card.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-3"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Identify this muscle
                </p>
                <p className="text-2xl font-bold text-foreground">{card.name_en}</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                    {card.region}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {card.subregion}
                  </span>
                  {card.bilateral && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      Bilateral
                    </span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
            <p className="text-xs text-primary animate-pulse mt-2">Tap to reveal details</p>
          </div>

          {/* BACK — Latin name, action, nerve, origin/insertion */}
          <div
            className="absolute inset-0 rounded-2xl flex flex-col justify-center p-6 gap-3"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p className="text-xs text-primary uppercase tracking-wider font-semibold text-center">Details</p>
            <p className="text-xl font-bold text-foreground text-center">{card.name_en}</p>
            <p className="text-xs text-muted-foreground italic text-center">{card.name_la}</p>
            <div className="mt-2 space-y-2 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Action: </span>{card.action}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Nerve: </span>{card.nerve}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Origin: </span>{card.origin}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Insertion: </span>{card.insertion}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls */}
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
