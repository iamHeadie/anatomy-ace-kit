import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skeletalParts } from "@/data/skeletalSystem";
import { getBoneImage } from "@/data/boneImages";
import { CheckCircle, XCircle, ArrowRight, Calendar } from "lucide-react";

// Seed-based pseudo-random for daily consistency
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
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

type QuestionType = "region" | "fact" | "connection" | "description" | "image" | "odd_one_out";

interface Question {
  type: QuestionType;
  question: string;
  correctAnswer: string;
  options: string[];
  imageUrl?: string;
}

const DAILY_QUESTION_COUNT = 20;

function generateDailyQuestions(): Question[] {
  const seed = getDailySeed();
  const rng = seededRandom(seed);
  const parts = shuffle(skeletalParts, rng);
  const questions: Question[] = [];

  const questionTypes: QuestionType[] = ["region", "fact", "connection", "description", "image", "odd_one_out"];

  for (let i = 0; i < DAILY_QUESTION_COUNT && i < parts.length; i++) {
    const correct = parts[i];
    const others = parts.filter((p) => p.id !== correct.id);
    const wrongPool = shuffle(others, rng).slice(0, 3);
    const typeIndex = Math.floor(rng() * questionTypes.length);
    let type = questionTypes[typeIndex];

    // Fallback if data is insufficient for chosen type
    if (type === "fact" && correct.facts.length === 0) type = "region";
    if (type === "connection" && correct.connections.length === 0) type = "region";
    if (type === "image" && !getBoneImage(correct.id, correct.region)) type = "description";

    const allOptions = shuffle([...wrongPool.map((w) => w.name), correct.name], rng);

    switch (type) {
      case "fact": {
        const fact = correct.facts[Math.floor(rng() * correct.facts.length)];
        questions.push({
          type,
          question: `Which bone has this fact: "${fact}"?`,
          correctAnswer: correct.name,
          options: allOptions,
        });
        break;
      }
      case "region": {
        questions.push({
          type,
          question: `Which of these bones belongs to the ${correct.region} region?`,
          correctAnswer: correct.name,
          options: shuffle(
            [
              correct.name,
              ...shuffle(others.filter((o) => o.region !== correct.region), rng)
                .slice(0, 3)
                .map((o) => o.name),
            ],
            rng
          ),
        });
        break;
      }
      case "connection": {
        const connId = correct.connections[Math.floor(rng() * correct.connections.length)];
        const connBone = skeletalParts.find((b) => b.id === connId);
        const connName = connBone ? connBone.name : connId;
        questions.push({
          type,
          question: `Which bone connects to the ${connName}?`,
          correctAnswer: correct.name,
          options: allOptions,
        });
        break;
      }
      case "description": {
        const snippet = correct.description.length > 80
          ? correct.description.slice(0, 80) + "…"
          : correct.description;
        questions.push({
          type,
          question: `Which bone matches this description: "${snippet}"`,
          correctAnswer: correct.name,
          options: allOptions,
        });
        break;
      }
      case "image": {
        const imgUrl = getBoneImage(correct.id, correct.region);
        questions.push({
          type,
          question: "Which bone is shown in this image?",
          correctAnswer: correct.name,
          options: allOptions,
          imageUrl: imgUrl || undefined,
        });
        break;
      }
      case "odd_one_out": {
        const sameRegion = shuffle(others.filter((o) => o.region === correct.region), rng).slice(0, 3);
        if (sameRegion.length < 3) {
          // Fallback to region question
          questions.push({
            type: "region",
            question: `Which of these bones belongs to the ${correct.region} region?`,
            correctAnswer: correct.name,
            options: shuffle(
              [correct.name, ...shuffle(others.filter((o) => o.region !== correct.region), rng).slice(0, 3).map((o) => o.name)],
              rng
            ),
          });
        } else {
          const oddBone = shuffle(others.filter((o) => o.region !== correct.region), rng)[0];
          if (oddBone) {
            questions.push({
              type,
              question: `Which bone does NOT belong to the ${correct.region} region?`,
              correctAnswer: oddBone.name,
              options: shuffle([...sameRegion.map((s) => s.name), oddBone.name], rng),
            });
          } else {
            questions.push({
              type: "region",
              question: `Which of these bones belongs to the ${correct.region} region?`,
              correctAnswer: correct.name,
              options: allOptions,
            });
          }
        }
        break;
      }
    }
  }

  return questions;
}

export default function Quiz() {
  const questions = useMemo(() => generateDailyQuestions(), []);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);

  const current = questions[qIndex];
  const isCorrect = selected === current?.correctAnswer;
  const answered = selected !== null;

  const next = () => {
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1,
    };
    setScore(newScore);
    setSelected(null);

    if (qIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setQIndex((i) => i + 1);
    }
  };

  const restart = () => {
    setQIndex(0);
    setSelected(null);
    setScore({ correct: 0, total: 0 });
    setFinished(false);
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

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
            {pct >= 80 ? "Excellent work! 🎉" : pct >= 50 ? "Good effort! Keep studying 💪" : "Keep practicing, you'll get there! 📚"}
          </p>
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

      {/* Progress bar */}
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
              {current.type.replace("_", " ")}
            </span>
            <p className="text-lg font-medium text-foreground">{current.question}</p>
            {current.imageUrl && (
              <img
                src={current.imageUrl}
                alt="Bone illustration"
                className="h-32 w-auto object-contain rounded-lg mx-auto opacity-90"
              />
            )}
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
                  onClick={() => !answered && setSelected(opt)}
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
