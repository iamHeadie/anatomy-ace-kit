import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Link2, Sparkles, Brain, ArrowRight, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import type { BonePart } from "@/data/skeletalSystem";
import { skeletalParts } from "@/data/skeletalSystem";

interface ContextPanelProps {
  part: BonePart | null;
  onClose: () => void;
  onSelectPart: (part: BonePart) => void;
}

// ─── Mnemonics for regions ───────────────────────────────
const regionMnemonics: Record<string, { mnemonic: string; hint: string }> = {
  "Wrist (Carpals)": { mnemonic: "Some Lovers Try Positions That They Can't Handle", hint: "Scaphoid, Lunate, Triquetrum, Pisiform, Trapezium, Trapezoid, Capitate, Hamate" },
  "Cranium": { mnemonic: "STEP OF 6", hint: "Sphenoid, Temporal, Ethmoid, Parietal, Occipital, Frontal" },
  "Face": { mnemonic: "My Mom's Zurich Pal Liked Nachos In Venice", hint: "Mandible, Maxilla, Zygomatic, Palatine, Lacrimal, Nasal, Inferior concha, Vomer" },
  "Vertebral Column": { mnemonic: "Breakfast at 7, Lunch at 12, Dinner at 5", hint: "7 Cervical, 12 Thoracic, 5 Lumbar vertebrae" },
  "Ankle (Tarsals)": { mnemonic: "Tiger Cubs Need MILC", hint: "Talus, Calcaneus, Navicular, Medial/Intermediate/Lateral cuneiforms, Cuboid" },
};

// ─── Spotter Quiz Generator ─────────────────────────────
function generateSpotterQuestions(targetBone: BonePart) {
  const regionBones = skeletalParts.filter((b) => b.region === targetBone.region && b.id !== targetBone.id);
  const allBones = skeletalParts.filter((b) => b.id !== targetBone.id);

  const questions = [
    // Q1: Identify the Latin name
    (() => {
      const distractors = allBones.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...distractors.map((d) => d.latinName), targetBone.latinName].sort(() => Math.random() - 0.5);
      return { question: `What is the Latin name of the ${targetBone.name}?`, options, answer: targetBone.latinName };
    })(),
    // Q2: Region question
    (() => {
      const regions = [...new Set(skeletalParts.map((b) => b.region))].filter((r) => r !== targetBone.region);
      const wrongRegions = regions.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...wrongRegions, targetBone.region].sort(() => Math.random() - 0.5);
      return { question: `Which region does the ${targetBone.name} belong to?`, options, answer: targetBone.region };
    })(),
    // Q3: Fact-based
    (() => {
      if (targetBone.facts.length === 0) {
        const distractors = allBones.sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [...distractors.map((d) => d.name), targetBone.name].sort(() => Math.random() - 0.5);
        return { question: `Which bone is located in the ${targetBone.region}?`, options, answer: targetBone.name };
      }
      const fact = targetBone.facts[Math.floor(Math.random() * targetBone.facts.length)];
      const distractors = allBones.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...distractors.map((d) => d.name), targetBone.name].sort(() => Math.random() - 0.5);
      return { question: `Which bone: "${fact}"?`, options, answer: targetBone.name };
    })(),
  ];
  return questions;
}

type SpotterQuestion = { question: string; options: string[]; answer: string };

// ─── Spotter Quiz Component ─────────────────────────────
function SpotterQuiz({ bone, onFinish }: { bone: BonePart; onFinish: () => void }) {
  const questions = useMemo(() => generateSpotterQuestions(bone), [bone]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[qIndex];
  const answered = selected !== null;
  const correct = selected === q?.answer;

  const next = () => {
    if (correct) setScore((s) => s + 1);
    if (qIndex >= questions.length - 1) {
      setFinished(true);
    } else {
      setQIndex((i) => i + 1);
      setSelected(null);
    }
  };

  if (finished) {
    const finalScore = score + (correct ? 1 : 0);
    return (
      <div className="space-y-3 text-center py-4">
        <p className="text-2xl font-bold text-foreground">{finalScore}/{questions.length}</p>
        <p className="text-sm text-muted-foreground">
          {finalScore === questions.length ? "Perfect!" : finalScore >= 2 ? "Great job!" : "Keep studying!"}
        </p>
        <button onClick={onFinish} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Question {qIndex + 1}/3</p>
        <p className="text-xs font-mono text-primary">{score}/{qIndex}</p>
      </div>
      <p className="text-sm font-medium text-foreground leading-snug">{q.question}</p>
      <div className="grid gap-1.5">
        {q.options.map((opt) => {
          let style = "bg-secondary/70 hover:bg-secondary text-secondary-foreground";
          if (answered && opt === q.answer) style = "bg-primary/20 text-primary border-primary/40";
          else if (answered && opt === selected && !correct) style = "bg-destructive/20 text-destructive border-destructive/40";

          return (
            <button
              key={opt}
              onClick={() => !answered && setSelected(opt)}
              disabled={answered}
              className={`text-left px-3 py-2 rounded-md border border-transparent text-xs font-medium transition-all ${style}`}
            >
              <span className="flex items-center justify-between">
                {opt}
                {answered && opt === q.answer && <CheckCircle size={14} />}
                {answered && opt === selected && !correct && <XCircle size={14} />}
              </span>
            </button>
          );
        })}
      </div>
      {answered && (
        <button
          onClick={next}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
        >
          {qIndex >= questions.length - 1 ? "Finish" : "Next"} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Main Context Panel ─────────────────────────────────
export function ContextPanel({ part, onClose, onSelectPart }: ContextPanelProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // Reset quiz/flashcard state when bone changes
  const partId = part?.id;
  const [lastPartId, setLastPartId] = useState<string | undefined>();
  if (partId !== lastPartId) {
    setLastPartId(partId);
    setShowQuiz(false);
    setFlipped(false);
  }

  const mnemonic = part ? regionMnemonics[part.region] : null;

  return (
    <AnimatePresence>
      {part && (
        <motion.div
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="fixed right-3 top-3 bottom-3 w-80 max-w-[85vw] z-30 glass-panel overflow-y-auto scrollbar-thin flex flex-col"
        >
          {/* Header */}
          <div className="p-4 pb-3 border-b border-border/30">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground truncate">{part.name}</h2>
                <p className="text-xs font-mono text-primary italic truncate">{part.latinName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Region badges */}
            <div className="flex gap-1.5 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{part.system}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">{part.region}</span>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Flashcard Mini-View */}
            {mnemonic && (
              <div
                onClick={() => setFlipped(!flipped)}
                className="cursor-pointer rounded-lg bg-secondary/50 border border-border/30 p-3 transition-all hover:border-primary/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw size={12} className="text-primary" />
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Mnemonic — tap to flip</p>
                </div>
                {!flipped ? (
                  <p className="text-sm font-medium text-primary leading-relaxed">"{mnemonic.mnemonic}"</p>
                ) : (
                  <p className="text-xs text-muted-foreground leading-relaxed">{mnemonic.hint}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <BookOpen size={12} className="text-primary" />
                Description
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{part.description}</p>
            </div>

            {/* Key Facts */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Sparkles size={12} className="text-primary" />
                Key Facts
              </div>
              <ul className="space-y-1">
                {part.facts.map((fact, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5 text-[8px]">●</span>
                    {fact}
                  </li>
                ))}
              </ul>
            </div>

            {/* Connected Parts */}
            {part.connections.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Link2 size={12} className="text-primary" />
                  Connected Parts
                </div>
                <div className="flex flex-wrap gap-1">
                  {part.connections.slice(0, 8).map((connId) => {
                    const connPart = skeletalParts.find((p) => p.id === connId);
                    if (!connPart) return null;
                    return (
                      <button
                        key={connId}
                        onClick={() => onSelectPart(connPart)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-secondary hover:bg-primary/20 text-secondary-foreground hover:text-primary transition-colors"
                      >
                        {connPart.name}
                      </button>
                    );
                  })}
                  {part.connections.length > 8 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground">+{part.connections.length - 8} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Spotter Quiz */}
            <div className="pt-2 border-t border-border/30">
              {!showQuiz ? (
                <button
                  onClick={() => setShowQuiz(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-xs font-medium transition-colors border border-primary/20"
                >
                  <Brain size={14} />
                  Spotter Quiz — 3 Questions
                </button>
              ) : (
                <SpotterQuiz bone={part} onFinish={() => setShowQuiz(false)} />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
