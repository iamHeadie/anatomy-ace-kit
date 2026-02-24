import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skeletalParts } from "@/data/skeletalSystem";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";

const generateQuestion = (parts: typeof skeletalParts) => {
  const correct = parts[Math.floor(Math.random() * parts.length)];
  const wrong = parts.filter((p) => p.id !== correct.id).sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [...wrong, correct].sort(() => Math.random() - 0.5);
  const isFactQuestion = Math.random() > 0.5 && correct.facts.length > 0;

  return {
    question: isFactQuestion
      ? `Which bone has this fact: "${correct.facts[0]}"?`
      : `What is the Latin name for the ${correct.name}?`,
    correctAnswer: isFactQuestion ? correct.name : correct.latinName,
    options: isFactQuestion
      ? options.map((o) => o.name)
      : options.map((o) => o.latinName),
    correctId: correct.id,
  };
};

export default function Quiz() {
  const [current, setCurrent] = useState(() => generateQuestion(skeletalParts));
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const isCorrect = selected === current.correctAnswer;
  const answered = selected !== null;

  const next = () => {
    if (answered && isCorrect) setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
    else if (answered) setScore((s) => ({ ...s, total: s.total + 1 }));
    setSelected(null);
    setCurrent(generateQuestion(skeletalParts));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skeletal Quiz</h1>
          <p className="text-muted-foreground text-sm mt-1">Test your anatomy knowledge</p>
        </div>
        <div className="glass-panel px-4 py-2 text-sm font-mono">
          <span className="text-primary">{score.correct}</span>
          <span className="text-muted-foreground">/{score.total}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.question}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-panel p-6 space-y-6"
        >
          <p className="text-lg font-medium text-foreground">{current.question}</p>

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
                Next <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
