import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ta98Bones, boneRegions } from "@/data/skeletalSystem";
import { ta98Muscles, muscleRegions } from "@/data/muscularSystem";
import { RotateCcw, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useUserState } from "@/hooks/useUserState";

type System = "skeletal" | "muscular";

function SkeletalFlashcards() {
  const [regionFilter, setRegionFilter] = useState<string>("All");
  const { recordFlashcardReview } = useUserState();

  const cards = useMemo(() => {
    const filtered = regionFilter === "All"
      ? ta98Bones
      : ta98Bones.filter((b) => b.region === regionFilter);
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
    <div className="text-center text-muted-foreground py-8">
      No bones found for this region.
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <p className="text-muted-foreground text-sm">
          Card {index + 1} of {cards.length} · {regionFilter}
        </p>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-secondary text-foreground text-sm rounded-lg px-3 py-1.5 border border-border/30 outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Regions</option>
            {boneRegions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="perspective-1000 cursor-pointer" onClick={handleFlip}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative h-72"
        >
          {/* FRONT — English name */}
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
                  Identify this bone
                </p>
                <p className="text-2xl font-bold text-foreground">{card.name_en}</p>
                <div className="flex gap-2 justify-center">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                    {card.region}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {card.subregion}
                  </span>
                </div>
                {card.bilateral && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                    Bilateral (paired)
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
            <p className="text-xs text-primary animate-pulse mt-2">Tap to reveal details</p>
          </div>

          {/* BACK — Region & details */}
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
            <p className="text-xs text-primary uppercase tracking-wider font-semibold">Details</p>
            <p className="text-2xl font-bold text-foreground text-center">{card.name_en}</p>
            <div className="mt-3 space-y-2 text-center">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Region:</span> {card.region}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Subregion:</span> {card.subregion}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Bilateral:</span> {card.bilateral ? "Yes (paired)" : "No (unpaired)"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

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

function MuscularFlashcards() {
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
    <div className="text-center text-muted-foreground py-8">
      No muscles found for this region.
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <p className="text-muted-foreground text-sm">
          Card {index + 1} of {cards.length} · {regionFilter}
        </p>

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

export default function Flashcards() {
  const [system, setSystem] = useState<System>("skeletal");

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Flashcards</h1>

        {/* System tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-secondary/50">
          <button
            onClick={() => setSystem("skeletal")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              system === "skeletal"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🦴 Skeletal System
          </button>
          <button
            onClick={() => setSystem("muscular")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              system === "muscular"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            💪 Muscular System
          </button>
        </div>
      </div>

      {system === "skeletal" ? <SkeletalFlashcards /> : <MuscularFlashcards />}
    </div>
  );
}
