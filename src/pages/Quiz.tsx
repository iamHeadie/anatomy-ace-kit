import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ta98Bones, type TA98Bone } from "@/data/skeletalSystem";
import { CheckCircle, XCircle, ArrowRight, Calendar } from "lucide-react";
import { useUserState } from "@/hooks/useUserState";

// ── Seed-based pseudo-random for daily consistency ────────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

function getDailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Three question types ─────────────────────────────────────────────────
type QuestionType = "terminology" | "classification" | "symmetry";

interface Question {
  type: QuestionType;
  question: string;
  correctAnswer: string;
  options: string[];
}

const DAILY_QUESTION_COUNT = 20;

function generateQuestions(round: number): Question[] {
  const seed = getDailySeed() + round;
  const rng = seededRandom(seed);
  const bones = shuffle([...ta98Bones], rng);
  const questions: Question[] = [];
  const types: QuestionType[] = ["terminology", "classification", "symmetry"];

  for (let i = 0; i < DAILY_QUESTION_COUNT && i < bones.length; i++) {
    const bone = bones[i];
    const type = types[Math.floor(rng() * types.length)];

    // Get distractors from the same region for harder questions
    const sameRegion = ta98Bones.filter((b) => b.region === bone.region && b.id !== bone.id);
    const otherBones = ta98Bones.filter((b) => b.id !== bone.id);
    const distractorPool = sameRegion.length >= 3 ? sameRegion : otherBones;

    switch (type) {
      case "terminology": {
        // "What is the Latin name for [name_en]?"
        const wrongAnswers = shuffle(distractorPool, rng).slice(0, 3).map((b) => b.name_la);
        const options = shuffle([bone.name_la, ...wrongAnswers], rng);
        questions.push({
          type,
          question: `What is the Latin name for the ${bone.name_en}?`,
          correctAnswer: bone.name_la,
          options,
        });
        break;
      }
      case "classification": {
        // "Which region/subregion does [name_en] belong to?"
        const allRegions = [...new Set(ta98Bones.map((b) => b.region))];
        const wrongRegions = shuffle(allRegions.filter((r) => r !== bone.region), rng).slice(0, 3);
        const options = shuffle([bone.region, ...wrongRegions], rng);
        questions.push({
          type,
          question: `Which region does the ${bone.name_en} belong to?`,
          correctAnswer: bone.region,
          options,
        });
        break;
      }
      case "symmetry": {
        // "Is the [name_en] a bilateral (paired) bone?" (True/False style with 4 options)
        const answer = bone.bilateral ? "Yes — bilateral (paired)" : "No — unpaired (midline)";
        const options = [
          "Yes — bilateral (paired)",
          "No — unpaired (midline)",
        ];
        questions.push({
          type,
          question: `Is the ${bone.name_en} a bilateral (paired) bone?`,
          correctAnswer: answer,
          options,
        });
        break;
      }
    }
  }

  return questions;
}

export default function Quiz() {
  const [round, setRound] = useState(0);
  const questions = useMemo(() => generateQuestions(round), [round]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);
  const { recordBoneIdentified, recordQuizComplete } = useUserState();

  const current = questions[qIndex];
  const isCorrect = selected === current?.correctAnswer;
  const answered = selected !== null;

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    if (opt === current.correctAnswer) recordBoneIdentified();
  };

  const next = () => {
    const newScore = { correct: score.correct + (isCorrect ? 1 : 0), total: score.total + 1 };
    setScore(newScore);
    setSelected(null);

    if (qIndex + 1 >= questions.length) {
      recordQuizComplete();
      setFinished(true);
    } else {
      setQIndex((i) => i + 1);
    }
  };

  const restart = () => {
    setRound((r) => r + 1);
    setQIndex(0);
    setSelected(null);
    setScore({ correct: 0, total: 0 });
    setFinished(false);
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const typeLabels: Record<QuestionType, string> = {
    terminology: "🔤 Terminology",
    classification: "📂 Classification",
    symmetry: "🔄 Symmetry",
  };

  if (finished) {
    const pct = Math.round((score.correct / score.total) * 100);
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 text-center space-y-4">
          <p className="text-5xl font-bold text-primary">{pct}%</p>
          <p className="text-lg text-foreground font-medium">
            You got {score.correct} out of {score.total} correct
          </p>
          <p className="text-sm text-muted-foreground">
            {pct >= 80 ? "Excellent work! 🎉" : pct >= 50 ? "Good effort! Keep studying 💪" : "Keep practicing! 📚"}
          </p>
          <p className="text-xs text-primary font-medium">+{score.correct * 10} XP earned!</p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <Calendar size={14} />
            <span>Come back tomorrow for new questions</span>
          </div>
          <button onClick={restart} className="mt-4 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Retry Today's Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Quiz</h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
            <Calendar size={14} />
            <span>{today}</span>
          </div>
        </div>
        <div className="glass-panel px-4 py-2 text-sm font-mono flex items-center gap-3">
          <span className="text-muted-foreground text-xs">{qIndex + 1}/{questions.length}</span>
          <span className="text-primary">{score.correct}</span>
          <span className="text-muted-foreground">/{score.total}</span>
        </div>
      </div>

      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((qIndex) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-panel p-6 space-y-6"
        >
          <div className="space-y-3">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {typeLabels[current.type]}
            </span>
            <p className="text-lg font-medium text-foreground">{current.question}</p>
          </div>

          <div className="grid gap-3">
            {current.options.map((opt) => {
              const isThis = selected === opt;
              const isAnswer = opt === current.correctAnswer;
              let style = "bg-secondary hover:bg-secondary/80 text-secondary-foreground";
              if (answered && isAnswer) style = "bg-primary/20 text-primary border-primary/40";
              else if (answered && isThis && !isCorrect) style = "bg-destructive/20 text-destructive border-destructive/40";

              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  disabled={answered}
                  className={`text-left px-4 py-3 rounded-lg border border-transparent text-sm font-medium transition-all ${style}`}
                >
                  <div className="flex items-center justify-between">
                    {opt}
                    {answered && isAnswer && <CheckCircle size={18} />}
                    {answered && isThis && !isCorrect && <XCircle size={18} />}
                  </div>
                </button>
              );
            })}
          </div>

          {answered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
              <button
                onClick={next}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {qIndex + 1 >= questions.length ? "See Results" : "Next"} <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
