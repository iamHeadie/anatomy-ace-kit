import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Sparkles, Brain, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { BonePart } from "@/data/skeletalSystem";
import { skeletalParts, ta98Bones } from "@/data/skeletalSystem";

interface ContextPanelProps {
  part: BonePart | null;
  onClose: () => void;
  onSelectPart: (part: BonePart) => void;
}

// ── Spotter Quiz Generator (uses TA98 data) ──────────────────────────────
function generateSpotterQuestions(targetBone: BonePart) {
  const allBones = ta98Bones.filter((b) => b.id !== targetBone.ta98Id);

  return [
    // Q1: Bilateral status
    (() => {
      const answer = targetBone.bilateral ? "Bilateral (paired)" : "Unpaired (midline)";
      const wrong = targetBone.bilateral ? ["Unpaired (midline)", "Axial only", "Cranial only"] : ["Bilateral (paired)", "Mirrored pair", "Lateral pair"];
      const options = [...wrong.slice(0, 3), answer].sort(() => Math.random() - 0.5);
      return { question: `Is the ${targetBone.name} a paired or unpaired bone?`, options, answer };
    })(),
    // Q2: Region
    (() => {
      const regions = [...new Set(ta98Bones.map((b) => b.region))].filter((r) => r !== targetBone.region);
      const wrongRegions = regions.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...wrongRegions, targetBone.region].sort(() => Math.random() - 0.5);
      return { question: `Which region does the ${targetBone.name} belong to?`, options, answer: targetBone.region };
    })(),
    // Q3: Subregion
    (() => {
      const subregions = [...new Set(ta98Bones.map((b) => b.subregion))].filter((s) => s !== targetBone.subregion);
      const wrongSubs = subregions.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...wrongSubs, targetBone.subregion].sort(() => Math.random() - 0.5);
      return { question: `Which subregion does the ${targetBone.name} belong to?`, options, answer: targetBone.subregion };
    })(),
  ];
}

type SpotterQuestion = { question: string; options: string[]; answer: string };

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
    if (qIndex >= questions.length - 1) setFinished(true);
    else { setQIndex((i) => i + 1); setSelected(null); }
  };

  if (finished) {
    const finalScore = score + (correct ? 1 : 0);
    return (
      <div className="space-y-3 text-center py-4">
        <p className="text-2xl font-bold text-foreground">{finalScore}/{questions.length}</p>
        <p className="text-sm text-muted-foreground">
          {finalScore === questions.length ? "Perfect!" : finalScore >= 2 ? "Great job!" : "Keep studying!"}
        </p>
        <button onClick={onFinish} className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Done</button>
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
            <button key={opt} onClick={() => !answered && setSelected(opt)} disabled={answered}
              className={`text-left px-3 py-2 rounded-md border border-transparent text-xs font-medium transition-all ${style}`}>
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
        <button onClick={next} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
          {qIndex >= questions.length - 1 ? "Finish" : "Next"} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

// ── Main Context Panel ───────────────────────────────────────────────────
export function ContextPanel({ part, onClose, onSelectPart }: ContextPanelProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const isMobile = useIsMobile();

  const partId = part?.id;
  const [lastPartId, setLastPartId] = useState<string | undefined>();
  if (partId !== lastPartId) {
    setLastPartId(partId);
    setShowQuiz(false);
  }

  const motionProps = isMobile
    ? {
        initial: { y: "100%", opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "100%", opacity: 0 },
        transition: { type: "spring", damping: 28, stiffness: 300 },
        className: "fixed left-0 right-0 bottom-0 z-30 glass-panel overflow-y-auto scrollbar-thin flex flex-col max-h-[65vh] rounded-t-2xl",
      }
    : {
        initial: { x: 340, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 340, opacity: 0 },
        transition: { type: "spring", damping: 26, stiffness: 280 },
        className: "fixed right-3 top-3 bottom-3 w-80 max-w-[85vw] z-30 glass-panel overflow-y-auto scrollbar-thin flex flex-col",
      };

  return (
    <AnimatePresence>
      {part && (
        <motion.div {...motionProps}>
          {isMobile && (
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
          )}

          {/* Header */}
          <div className="p-4 pb-3 border-b border-border/30">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-foreground truncate">{part.name}</h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{part.region}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">{part.subregion}</span>
              {part.bilateral && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                  {part.side === "left" ? "Left" : part.side === "right" ? "Right" : "Bilateral"}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
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
                <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5 text-[8px]">●</span>
                  Region: {part.region}
                </li>
                <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5 text-[8px]">●</span>
                  Subregion: {part.subregion}
                </li>
                <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary mt-0.5 text-[8px]">●</span>
                  {part.bilateral ? "Bilateral (paired) bone" : "Unpaired (midline) bone"}
                </li>
              </ul>
            </div>

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
