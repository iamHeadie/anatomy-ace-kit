import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Link2,
  Sparkles,
  Brain,
  ArrowRight,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import type { BonePart } from "@/data/skeletalSystem";
import { skeletalParts } from "@/data/skeletalSystem";

interface InfoDrawerProps {
  part: BonePart | null;
  /** Controls visibility — only true after user taps the floating label */
  isOpen: boolean;
  onClose: () => void;
  onSelectPart: (part: BonePart) => void;
}

// ─── Mnemonics ───────────────────────────────────────────
const regionMnemonics: Record<string, { mnemonic: string; hint: string }> = {
  "Wrist (Carpals)": {
    mnemonic: "Some Lovers Try Positions That They Can't Handle",
    hint: "Scaphoid, Lunate, Triquetrum, Pisiform, Trapezium, Trapezoid, Capitate, Hamate",
  },
  Cranium: {
    mnemonic: "STEP OF 6",
    hint: "Sphenoid, Temporal, Ethmoid, Parietal, Occipital, Frontal",
  },
  Face: {
    mnemonic: "My Mom's Zurich Pal Liked Nachos In Venice",
    hint: "Mandible, Maxilla, Zygomatic, Palatine, Lacrimal, Nasal, Inferior concha, Vomer",
  },
  "Vertebral Column": {
    mnemonic: "Breakfast at 7, Lunch at 12, Dinner at 5",
    hint: "7 Cervical, 12 Thoracic, 5 Lumbar vertebrae",
  },
  "Ankle (Tarsals)": {
    mnemonic: "Tiger Cubs Need MILC",
    hint: "Talus, Calcaneus, Navicular, Medial/Intermediate/Lateral cuneiforms, Cuboid",
  },
};

// ─── Spotter Quiz ────────────────────────────────────────
function generateSpotterQuestions(targetBone: BonePart) {
  const allBones = skeletalParts.filter((b) => b.id !== targetBone.id);

  const q1 = (() => {
    const distractors = allBones.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...distractors.map((d) => d.latinName), targetBone.latinName].sort(
      () => Math.random() - 0.5
    );
    return {
      question: `What is the Latin name of the ${targetBone.name}?`,
      options,
      answer: targetBone.latinName,
    };
  })();

  const q2 = (() => {
    const regions = [...new Set(skeletalParts.map((b) => b.region))].filter(
      (r) => r !== targetBone.region
    );
    const wrongRegions = regions.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...wrongRegions, targetBone.region].sort(() => Math.random() - 0.5);
    return {
      question: `Which region does the ${targetBone.name} belong to?`,
      options,
      answer: targetBone.region,
    };
  })();

  const q3 = (() => {
    if (targetBone.facts.length === 0) {
      const distractors = allBones.sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...distractors.map((d) => d.name), targetBone.name].sort(
        () => Math.random() - 0.5
      );
      return {
        question: `Which bone is located in the ${targetBone.region}?`,
        options,
        answer: targetBone.name,
      };
    }
    const fact = targetBone.facts[Math.floor(Math.random() * targetBone.facts.length)];
    const distractors = allBones.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...distractors.map((d) => d.name), targetBone.name].sort(
      () => Math.random() - 0.5
    );
    return { question: `Which bone: "${fact}"?`, options, answer: targetBone.name };
  })();

  return [q1, q2, q3];
}

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
        <p className="text-2xl font-bold text-white">
          {finalScore}/{questions.length}
        </p>
        <p className="text-sm text-white/50">
          {finalScore === questions.length
            ? "Perfect!"
            : finalScore >= 2
            ? "Great job!"
            : "Keep studying!"}
        </p>
        <button
          onClick={onFinish}
          className="text-xs px-4 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-400 transition-colors font-medium"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-white/40">
          Question {qIndex + 1}/3
        </p>
        <p className="text-xs font-mono text-sky-400">
          {score}/{qIndex}
        </p>
      </div>
      <p className="text-sm font-medium text-white/90 leading-snug">{q.question}</p>
      <div className="grid gap-1.5">
        {q.options.map((opt) => {
          let cls =
            "bg-white/5 hover:bg-white/10 text-white/70 border-white/10";
          if (answered && opt === q.answer)
            cls = "bg-sky-500/20 text-sky-300 border-sky-500/40";
          else if (answered && opt === selected && !correct)
            cls = "bg-red-500/20 text-red-400 border-red-500/40";

          return (
            <button
              key={opt}
              onClick={() => !answered && setSelected(opt)}
              disabled={answered}
              className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all ${cls}`}
            >
              <span className="flex items-center justify-between gap-2">
                {opt}
                {answered && opt === q.answer && <CheckCircle size={13} className="shrink-0" />}
                {answered && opt === selected && !correct && (
                  <XCircle size={13} className="shrink-0" />
                )}
              </span>
            </button>
          );
        })}
      </div>
      {answered && (
        <button
          onClick={next}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 transition-colors"
        >
          {qIndex >= questions.length - 1 ? "Finish" : "Next"} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Info Drawer — "Shutter" Bottom Sheet (Step 2 UI) ───
export function InfoDrawer({ part, isOpen, onClose, onSelectPart }: InfoDrawerProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // Reset local state when the selected bone changes
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
      {isOpen && part && (
        <motion.div
          key={part.id}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 340 }}
          className="fixed left-0 right-0 bottom-0 z-40 flex flex-col rounded-t-2xl overflow-hidden"
          style={{
            maxHeight: "62vh",
            background: "rgba(8, 12, 26, 0.94)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 -12px 48px rgba(0,0,0,0.65), 0 -1px 0 rgba(14,165,233,0.15)",
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Header */}
          <div
            className="px-5 pb-3 pt-2 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white truncate">{part.name}</h2>
                <p className="text-xs font-mono text-sky-400 italic truncate mt-0.5">
                  {part.latinName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-1.5 mt-2.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-semibold">
                {part.system}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 font-medium">
                {part.region}
              </span>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Mnemonic flashcard */}
            {mnemonic && (
              <div
                onClick={() => setFlipped(!flipped)}
                className="cursor-pointer rounded-xl p-4 transition-all"
                style={{
                  background: "rgba(14, 165, 233, 0.09)",
                  border: "1px solid rgba(14,165,233,0.22)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <RotateCcw size={11} className="text-sky-400" />
                  <p className="text-[10px] uppercase tracking-widest text-sky-400/70">
                    Mnemonic — tap to flip
                  </p>
                </div>
                {!flipped ? (
                  <p className="text-sm font-semibold text-sky-300 leading-relaxed">
                    &ldquo;{mnemonic.mnemonic}&rdquo;
                  </p>
                ) : (
                  <p className="text-xs text-white/55 leading-relaxed">{mnemonic.hint}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                <BookOpen size={12} className="text-sky-400" />
                Description
              </div>
              <p className="text-xs text-white/48 leading-relaxed">{part.description}</p>
            </div>

            {/* Key Facts */}
            {part.facts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                  <Sparkles size={12} className="text-sky-400" />
                  Key Facts
                </div>
                <ul className="space-y-1.5">
                  {part.facts.map((fact, i) => (
                    <li key={i} className="text-xs text-white/48 flex items-start gap-2">
                      <span className="text-sky-400 mt-0.5 text-[8px] shrink-0">●</span>
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Connected Parts */}
            {part.connections.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                  <Link2 size={12} className="text-sky-400" />
                  Connected Parts
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {part.connections.slice(0, 8).map((connId) => {
                    const connPart = skeletalParts.find((p) => p.id === connId);
                    if (!connPart) return null;
                    return (
                      <button
                        key={connId}
                        onClick={() => onSelectPart(connPart)}
                        className="text-[10px] px-2 py-1 rounded-lg text-white/55 transition-colors"
                        style={{
                          background: "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "rgba(14,165,233,0.18)";
                          (e.currentTarget as HTMLButtonElement).style.color = "#7dd3fc";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "rgba(255,255,255,0.07)";
                          (e.currentTarget as HTMLButtonElement).style.color = "";
                        }}
                      >
                        {connPart.name}
                      </button>
                    );
                  })}
                  {part.connections.length > 8 && (
                    <span className="text-[10px] px-2 py-1 text-white/25">
                      +{part.connections.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Spotter Quiz */}
            <div
              className="pt-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              {!showQuiz ? (
                <button
                  onClick={() => setShowQuiz(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sky-400 text-xs font-semibold transition-all"
                  style={{
                    background: "rgba(14,165,233,0.08)",
                    border: "1px solid rgba(14,165,233,0.22)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(14,165,233,0.16)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(14,165,233,0.08)";
                  }}
                >
                  <Brain size={14} />
                  Spotter Quiz — 3 Questions
                </button>
              ) : (
                <SpotterQuiz bone={part} onFinish={() => setShowQuiz(false)} />
              )}
            </div>

            {/* Safe-area bottom padding */}
            <div className="h-4" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
