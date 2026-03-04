import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bone,
  LayoutDashboard,
  Layers,
  BookOpen,
  User,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Eye,
  Brain,
  Trophy,
  Target,
  Flame,
  Palette,
} from "lucide-react";

const TOUR_STORAGE_KEY = "anatomy-tutor-tour-seen";

interface TourStep {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tips?: string[];
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to Anatomy Tutor",
    description:
      "Your interactive 3D anatomy learning companion. This guide will walk you through every feature so you can master the human skeleton with confidence.",
    icon: Sparkles,
    color: "hsl(168, 76%, 40%)",
    tips: [
      "Built for medical & anatomy students",
      "206 bones to explore and master",
      "Track your progress with XP & ranks",
    ],
  },
  {
    title: "3D Skeleton Viewer",
    description:
      "An interactive 3D model of the full human skeleton. Rotate, zoom, and click on any bone to select it. Selected bones glow blue and a floating label appears.",
    icon: Bone,
    color: "hsl(39, 50%, 75%)",
    tips: [
      "Pinch or scroll to zoom in/out",
      "Drag to rotate the skeleton freely",
      "Tap any bone to highlight and study it",
      "Tap the floating label to open the Study Drawer",
    ],
  },
  {
    title: "Study Drawer",
    description:
      "When you select a bone and tap its label, a detailed study panel slides up. It shows the bone's common name, Latin name, region, key facts, and related bones.",
    icon: Eye,
    color: "hsl(200, 80%, 55%)",
    tips: [
      "Swipe down or tap ✕ to close",
      "Navigate to related bones from inside the drawer",
      "Earn XP every time you study a bone",
    ],
  },
  {
    title: "Dashboard",
    description:
      "Your home base. See how many bones you've learned, your quiz scores, study streak, and total study time at a glance. Quick-access links to every section.",
    icon: LayoutDashboard,
    color: "hsl(168, 76%, 40%)",
    tips: [
      "Track bones learned out of 206",
      "Monitor your daily study streak",
      "See recently studied bones",
    ],
  },
  {
    title: "Flashcards",
    description:
      "Study bones with interactive 3D flashcards. Each card shows a live mini-preview of the bone rotating in 3D. Flip the card to reveal the name, Latin name, and key facts.",
    icon: Layers,
    color: "hsl(280, 45%, 55%)",
    tips: [
      "Cards auto-rotate the 3D bone model",
      "Flip to test your recall",
      "Shuffle for random practice",
      "Earn 25 XP per card reviewed",
    ],
  },
  {
    title: "Quiz Mode",
    description:
      "Test your knowledge with timed quizzes. Answer questions about bone names, regions, and functions. Track your accuracy and earn XP for correct answers.",
    icon: BookOpen,
    color: "hsl(45, 90%, 60%)",
    tips: [
      "Multiple choice questions",
      "Instant feedback on each answer",
      "XP awarded for quiz completion",
    ],
  },
  {
    title: "Profile & Rank System",
    description:
      "Your profile tracks all progress: XP earned, bones identified, flashcards reviewed, quizzes taken, and your study streak. Climb the ranks from Novice to Diamond!",
    icon: Trophy,
    color: "hsl(45, 90%, 55%)",
    tips: [
      "Choose your avatar emoji",
      "Set your name, department & role",
      "Unlock achievements as you learn",
      "Compete on the leaderboard",
    ],
  },
  {
    title: "Settings & Customisation",
    description:
      "Access settings from the sidebar menu. Edit your name, avatar, department, and role anytime. Your progress is saved automatically in your browser.",
    icon: Settings,
    color: "hsl(215, 20%, 55%)",
    tips: [
      "Tap the profile icon to open the sidebar",
      "All data is stored locally — no account needed",
      "Daily login bonus: +50 XP for streaks",
    ],
  },
  {
    title: "XP & Progression",
    description:
      "Everything you do earns XP. Identifying bones, reviewing flashcards, completing quizzes, and maintaining your daily streak all contribute to your rank.",
    icon: Flame,
    color: "hsl(0, 72%, 51%)",
    tips: [
      "Bone identified: +10 XP",
      "Flashcard reviewed: +25 XP",
      "Daily login streak: +50 XP",
      "Ranks: Novice → Bronze → Silver → Gold → Platinum → Diamond",
    ],
  },
];

export function AppTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!seen) {
      // Small delay so the app renders first
      const t = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
  };

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => handleClose();

  const current = tourSteps[step];
  const Icon = current.icon;
  const isLast = step === tourSteps.length - 1;
  const isFirst = step === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60"
            style={{
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
            onClick={handleSkip}
          />

          {/* Tour Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[210] max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "hsl(222, 41%, 11%)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: `0 0 80px ${current.color}20, 0 25px 50px rgba(0,0,0,0.5)`,
              }}
            >
              {/* Header with icon */}
              <div
                className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center"
                style={{
                  background: `linear-gradient(180deg, ${current.color}15 0%, transparent 100%)`,
                }}
              >
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>

                {/* Step indicator */}
                <div className="flex items-center gap-1.5 mb-5">
                  {tourSteps.map((_, i) => (
                    <div
                      key={i}
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: i === step ? 24 : 8,
                        background:
                          i === step
                            ? current.color
                            : i < step
                            ? `${current.color}80`
                            : "rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>

                {/* Icon */}
                <motion.div
                  key={step}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background: `${current.color}18`,
                    border: `1px solid ${current.color}30`,
                    boxShadow: `0 0 30px ${current.color}20`,
                  }}
                >
                  <Icon size={28} style={{ color: current.color }} />
                </motion.div>

                {/* Title */}
                <motion.h2
                  key={`title-${step}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg font-bold text-foreground"
                >
                  {current.title}
                </motion.h2>
              </div>

              {/* Body */}
              <div className="px-6 pb-6">
                <motion.p
                  key={`desc-${step}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="text-sm text-muted-foreground leading-relaxed text-center mb-4"
                >
                  {current.description}
                </motion.p>

                {/* Tips */}
                {current.tips && (
                  <motion.div
                    key={`tips-${step}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2 mb-6"
                  >
                    {current.tips.map((tip, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-secondary-foreground"
                      >
                        <span
                          className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: current.color }}
                        />
                        {tip}
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center gap-3">
                  {!isFirst && (
                    <button
                      onClick={handlePrev}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                    >
                      <ChevronLeft size={14} />
                      Back
                    </button>
                  )}

                  {isFirst && (
                    <button
                      onClick={handleSkip}
                      className="px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
                    >
                      Skip tour
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className="ml-auto flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: current.color,
                      color: "hsl(222, 47%, 8%)",
                      boxShadow: `0 0 20px ${current.color}40`,
                    }}
                  >
                    {isLast ? "Get Started" : "Next"}
                    {!isLast && <ChevronRight size={15} />}
                  </button>
                </div>

                {/* Step counter */}
                <p className="text-center text-[10px] text-muted-foreground mt-4">
                  {step + 1} of {tourSteps.length}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** A button to manually re-trigger the tour from anywhere */
export function TourTriggerButton() {
  const handleRestart = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.location.reload();
  };

  return (
    <button
      onClick={handleRestart}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
    >
      <Sparkles size={14} />
      Replay Tour
    </button>
  );
}
