/**
 * InfoDrawer — "Shutter" Study Drawer (Step 2 UI)
 *
 * Occupies the bottom 30 % of the screen so the 3D skeleton stays fully
 * visible in the top 70 %.  All content is scrollable within that height.
 *
 * Flow:
 *   Step 1 – User taps a bone → blue isolation glow + floating pill label
 *   Step 2 – User taps the pill label → this drawer slides up (isOpen=true)
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, BookOpen, Link2, Sparkles, Brain, ArrowRight,
  CheckCircle, XCircle, RotateCcw,
} from "lucide-react";
import type { BonePart } from "@/data/skeletalSystem";
import { skeletalParts } from "@/data/skeletalSystem";

interface InfoDrawerProps {
  part: BonePart | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPart: (part: BonePart) => void;
}

// ── Region mnemonics ──────────────────────────────────────────────────────────
const regionMnemonics: Record<string, { mnemonic: string; hint: string }> = {
  "Wrist (Carpals)": {
    mnemonic: "Some Lovers Try Positions That They Can't Handle",
    hint: "Scaphoid · Lunate · Triquetrum · Pisiform · Trapezium · Trapezoid · Capitate · Hamate",
  },
  "Cranium": {
    mnemonic: "STEP OF 6",
    hint: "Sphenoid · Temporal · Ethmoid · Parietal · Occipital · Frontal",
  },
  "Face": {
    mnemonic: "My Mom's Zurich Pal Liked Nachos In Venice",
    hint: "Mandible · Maxilla · Zygomatic · Palatine · Lacrimal · Nasal · Inferior concha · Vomer",
  },
  "Vertebral Column": {
    mnemonic: "Breakfast at 7, Lunch at 12, Dinner at 5",
    hint: "7 Cervical · 12 Thoracic · 5 Lumbar",
  },
  "Ankle (Tarsals)": {
    mnemonic: "Tiger Cubs Need MILC",
    hint: "Talus · Calcaneus · Navicular · Medial/Intermediate/Lateral cuneiforms · Cuboid",
  },
};

// ── Spotter Quiz ──────────────────────────────────────────────────────────────
function buildQuestions(target: BonePart) {
  const others = skeletalParts.filter((b) => b.id !== target.id);
  const pick3  = () => others.sort(() => Math.random() - 0.5).slice(0, 3);

  return [
    (() => {
      const opts = [...pick3().map((d) => d.latinName), target.latinName].sort(() => Math.random() - 0.5);
      return { q: `Latin name of the ${target.name}?`, opts, ans: target.latinName };
    })(),
    (() => {
      const regions = [...new Set(skeletalParts.map((b) => b.region))].filter((r) => r !== target.region);
      const opts = [...regions.sort(() => Math.random() - 0.5).slice(0, 3), target.region].sort(() => Math.random() - 0.5);
      return { q: `Which region contains the ${target.name}?`, opts, ans: target.region };
    })(),
    (() => {
      const fact = target.facts[0] ?? `located in the ${target.region}`;
      const opts = [...pick3().map((d) => d.name), target.name].sort(() => Math.random() - 0.5);
      return { q: `Which bone: "${fact}"?`, opts, ans: target.name };
    })(),
  ];
}

function SpotterQuiz({ bone, onFinish }: { bone: BonePart; onFinish: () => void }) {
  const qs = useMemo(() => buildQuestions(bone), [bone]);
  const [idx, setIdx]         = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore]     = useState(0);
  const [done, setDone]       = useState(false);

  const q       = qs[idx];
  const answered = selected !== null;
  const correct  = selected === q?.ans;

  const advance = () => {
    if (correct) setScore((s) => s + 1);
    if (idx >= qs.length - 1) setDone(true);
    else { setIdx((i) => i + 1); setSelected(null); }
  };

  if (done) {
    const final = score + (correct ? 1 : 0);
    return (
      <div className="text-center py-3 space-y-1.5">
        <p className="text-xl font-bold text-white">{final}/{qs.length}</p>
        <p className="text-xs text-white/50">
          {final === qs.length ? "Perfect!" : final >= 2 ? "Great job!" : "Keep studying!"}
        </p>
        <button
          onClick={onFinish}
          className="text-xs px-3 py-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-400 transition-colors font-medium mt-1"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest text-white/35">Q{idx + 1}/3</span>
        <span className="text-[10px] font-mono text-sky-400">{score}/{idx}</span>
      </div>
      <p className="text-xs font-medium text-white/85 leading-snug">{q.q}</p>
      <div className="grid gap-1">
        {q.opts.map((opt) => {
          let cls = "bg-white/5 hover:bg-white/10 text-white/65 border-white/10";
          if (answered && opt === q.ans)                   cls = "bg-sky-500/20 text-sky-300 border-sky-400/40";
          else if (answered && opt === selected && !correct) cls = "bg-red-500/20 text-red-400 border-red-400/40";
          return (
            <button
              key={opt}
              disabled={answered}
              onClick={() => !answered && setSelected(opt)}
              className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${cls}`}
            >
              <span className="flex items-center justify-between gap-2">
                {opt}
                {answered && opt === q.ans  && <CheckCircle size={12} className="shrink-0" />}
                {answered && opt === selected && !correct && <XCircle size={12} className="shrink-0" />}
              </span>
            </button>
          );
        })}
      </div>
      {answered && (
        <button
          onClick={advance}
          className="w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-sky-500 text-white text-[11px] font-semibold hover:bg-sky-400 transition-colors"
        >
          {idx >= qs.length - 1 ? "Finish" : "Next"} <ArrowRight size={13} />
        </button>
      )}
    </div>
  );
}

// ── Info Drawer ───────────────────────────────────────────────────────────────
export function InfoDrawer({ part, isOpen, onClose, onSelectPart }: InfoDrawerProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [flipped,  setFlipped]  = useState(false);

  // Reset local state whenever the selected bone changes
  const [lastId, setLastId] = useState<string | undefined>();
  if (part?.id !== lastId) {
    setLastId(part?.id);
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
            // ── 30 % of viewport height (spec requirement) ──────────────────
            maxHeight: "30vh",
            background: "rgba(7,10,22,0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 -10px 48px rgba(0,0,0,0.7),0 -1px 0 rgba(14,165,233,0.18)",
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-2 pb-0.5 shrink-0">
            <div className="w-8 h-1 rounded-full bg-white/20" />
          </div>

          {/* Compact header */}
          <div
            className="px-4 py-2 shrink-0 flex items-center justify-between gap-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-white leading-tight truncate">{part.name}</h2>
                <span className="text-[10px] font-mono text-sky-400 italic truncate shrink-0">
                  {part.latinName}
                </span>
              </div>
              <div className="flex gap-1 mt-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-semibold">
                  {part.system}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50 font-medium">
                  {part.region}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-white/35 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>

          {/* Scrollable study content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

            {/* Mnemonic flashcard */}
            {mnemonic && (
              <div
                onClick={() => setFlipped(!flipped)}
                className="cursor-pointer rounded-xl p-2.5 transition-all"
                style={{
                  background: "rgba(14,165,233,0.09)",
                  border: "1px solid rgba(14,165,233,0.22)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <RotateCcw size={9} className="text-sky-400" />
                  <p className="text-[9px] uppercase tracking-widest text-sky-400/70">
                    Mnemonic — tap to flip
                  </p>
                </div>
                {!flipped ? (
                  <p className="text-xs font-semibold text-sky-300 leading-snug">
                    &ldquo;{mnemonic.mnemonic}&rdquo;
                  </p>
                ) : (
                  <p className="text-[10px] text-white/55 leading-snug">{mnemonic.hint}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-white/60">
                <BookOpen size={10} className="text-sky-400" />
                Description
              </div>
              <p className="text-[11px] text-white/45 leading-relaxed line-clamp-3">
                {part.description}
              </p>
            </div>

            {/* Key Facts */}
            {part.facts.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-white/60">
                  <Sparkles size={10} className="text-sky-400" />
                  Key Facts
                </div>
                <ul className="space-y-1">
                  {part.facts.slice(0, 2).map((fact, i) => (
                    <li key={i} className="text-[11px] text-white/45 flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5 text-[8px] shrink-0">●</span>
                      {fact}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Connected Parts */}
            {part.connections.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-white/60">
                  <Link2 size={10} className="text-sky-400" />
                  Connected
                </div>
                <div className="flex flex-wrap gap-1">
                  {part.connections.slice(0, 6).map((id) => {
                    const cp = skeletalParts.find((p) => p.id === id);
                    if (!cp) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => onSelectPart(cp)}
                        className="text-[10px] px-2 py-0.5 rounded-md text-white/50 hover:text-sky-300 transition-colors"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {cp.name}
                      </button>
                    );
                  })}
                  {part.connections.length > 6 && (
                    <span className="text-[10px] px-1 text-white/25">
                      +{part.connections.length - 6}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Spotter Quiz */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "10px" }}>
              {!showQuiz ? (
                <button
                  onClick={() => setShowQuiz(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sky-400 text-[11px] font-semibold transition-all"
                  style={{
                    background: "rgba(14,165,233,0.08)",
                    border: "1px solid rgba(14,165,233,0.22)",
                  }}
                >
                  <Brain size={13} />
                  Spotter Quiz — 3 Questions
                </button>
              ) : (
                <SpotterQuiz bone={part} onFinish={() => setShowQuiz(false)} />
              )}
            </div>

            {/* Bottom safe-area pad */}
            <div className="h-2" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
