/**
 * InteractiveTour — spotlight-based interactive onboarding for new users.
 *
 * Behaviour:
 *  • Auto-starts 1.5s after mount if localStorage key is absent (first login).
 *  • Physically opens the sidebar, finds each nav element by ID, and renders
 *    a box-shadow spotlight around it with a pulsing beacon ring.
 *  • A floating tooltip appears next to (or below on mobile) each spotlight.
 *  • Welcome + Get-Started steps are full-screen dimmed centre modals.
 *  • On "Get Started" → writes TOUR_KEY to localStorage so it never re-fires.
 *  • TourTriggerButton clears the key + reloads to replay from anywhere.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  User,
  LayoutDashboard,
  BookOpen,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
  Rocket,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

export const TOUR_KEY = "anatomy-tour-v2-completed";

/** Padding (px) added around the target rect for the spotlight cut-out */
const PAD = 10;

/** Maximum width for the floating tooltip card */
const TOOLTIP_W = 252;

// ─── Types ───────────────────────────────────────────────────────────────────

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TourStep {
  /** DOM id of the element to spotlight. null = centre modal (no spotlight). */
  targetId: string | null;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  /** Set true when the target lives inside the slide-in sidebar. */
  requiresSidebar?: boolean;
}

// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS: TourStep[] = [
  {
    targetId: null,
    title: "Welcome to Anatomy Tutor! 👋",
    description:
      "You're about to master all 206 bones of the human body. Let's take 30 seconds to show you around so you can hit the ground running.",
    icon: Sparkles,
    color: "hsl(168, 76%, 40%)",
  },
  {
    targetId: "tour-profile",
    title: "Your Profile & Rank",
    description:
      "This is your identity hub — avatar, current rank, total XP, and how close you are to the next tier.",
    icon: User,
    color: "hsl(45, 90%, 55%)",
    requiresSidebar: true,
  },
  {
    targetId: "tour-dashboard",
    title: "Dashboard — Your Home Base",
    description:
      "See bones learned, quiz scores, and your daily study streak all in one place.",
    icon: LayoutDashboard,
    color: "hsl(168, 76%, 40%)",
    requiresSidebar: true,
  },
  {
    targetId: "tour-quiz",
    title: "Quiz Mode — Test & Earn XP",
    description:
      "Timed multiple-choice questions about bones. XP is awarded for every quiz you complete.",
    icon: BookOpen,
    color: "hsl(45, 90%, 60%)",
    requiresSidebar: true,
  },
  {
    targetId: "tour-flashcards",
    title: "Flashcards — +25 XP Each",
    description:
      "Study with interactive 3D rotating flashcards. Flip to reveal key facts and earn 25 XP per card reviewed.",
    icon: Layers,
    color: "hsl(280, 45%, 55%)",
    requiresSidebar: true,
  },
  {
    targetId: null,
    title: "You're all set! 🚀",
    description:
      "Head to the Dashboard, then explore Quiz and Flashcards to earn XP and climb the ranks. Good luck, Anatomist!",
    icon: Rocket,
    color: "hsl(168, 76%, 40%)",
  },
];

// ─── Utility: window size hook ────────────────────────────────────────────────

function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  useEffect(() => {
    const handle = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return size;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Step-progress dots shown inside every card */
function StepDots({
  total,
  current,
  color,
}: {
  total: number;
  current: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            background:
              i === current
                ? color
                : i < current
                ? `${color}70`
                : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </div>
  );
}

/** Centred welcome / finish modal */
function CentreCard({
  step,
  stepData,
  isLast,
  isFirst,
  onNext,
  onPrev,
  onSkip,
}: {
  step: number;
  stepData: TourStep;
  isLast: boolean;
  isFirst: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const Icon = stepData.icon;
  return (
    <motion.div
      key={`centre-${step}`}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      className="fixed inset-x-4 z-[320] max-w-sm mx-auto"
      style={{ top: "50%", transform: "translateY(-50%)" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="rounded-2xl p-6 flex flex-col items-center text-center gap-4 relative"
        style={{
          background: "hsl(222, 41%, 11%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: `0 0 60px ${stepData.color}22, 0 24px 48px rgba(0,0,0,0.55)`,
        }}
      >
        {/* Skip — only on non-last steps */}
        {!isLast && (
          <button
            onClick={onSkip}
            aria-label="Skip tour"
            className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          >
            <X size={15} />
          </button>
        )}

        <StepDots total={STEPS.length} current={step} color={stepData.color} />

        {/* Animated icon */}
        <motion.div
          key={`icon-${step}`}
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 14, stiffness: 200 }}
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{
            background: `${stepData.color}18`,
            border: `1px solid ${stepData.color}30`,
            boxShadow: `0 0 24px ${stepData.color}25`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color: stepData.color }} />
        </motion.div>

        <div>
          <h2 className="text-lg font-bold text-foreground leading-tight">
            {stepData.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {stepData.description}
          </p>
        </div>

        {/* Action buttons */}
        <div className="w-full flex items-center gap-3">
          {!isFirst && (
            <button
              onClick={onPrev}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            >
              <ChevronLeft size={14} />
              Back
            </button>
          )}
          <button
            onClick={onNext}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{
              background: stepData.color,
              color: "hsl(222, 47%, 8%)",
              boxShadow: `0 0 20px ${stepData.color}40`,
            }}
          >
            {isLast ? "Get Started!" : "Show me around"}
            {!isLast && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/** Floating tooltip that sits beside (or below on mobile) the spotlight */
function SpotlightTooltip({
  step,
  stepData,
  rect,
  windowWidth,
  windowHeight,
  onNext,
  onPrev,
  onSkip,
}: {
  step: number;
  stepData: TourStep;
  rect: TargetRect;
  windowWidth: number;
  windowHeight: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const Icon = stepData.icon;

  // Decide whether tooltip goes RIGHT of spotlight or BOTTOM of viewport.
  // Right-side: needs enough space after the spotlight + PAD.
  const spaceRight = windowWidth - (rect.left + rect.width + PAD) - 16;
  const useBottom = spaceRight < TOOLTIP_W + 20;

  const tooltipTop = useBottom
    ? undefined
    : Math.max(
        72,
        Math.min(
          windowHeight - 260,
          rect.top + rect.height / 2 - 110
        )
      );

  const tooltipLeft = useBottom ? 16 : rect.left + rect.width + PAD + 16;
  const tooltipBottom = useBottom ? 24 : undefined;
  const tooltipRight = useBottom ? 16 : undefined;

  return (
    <motion.div
      key={`tooltip-${step}`}
      initial={{ opacity: 0, x: useBottom ? 0 : -12, y: useBottom ? 12 : 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: useBottom ? 0 : -12, y: useBottom ? 12 : 0 }}
      transition={{ type: "spring", damping: 22, stiffness: 280, delay: 0.12 }}
      className="fixed z-[320]"
      style={{
        top: tooltipTop,
        left: tooltipLeft,
        bottom: tooltipBottom,
        right: tooltipRight,
        width: useBottom ? undefined : TOOLTIP_W,
        maxWidth: useBottom ? undefined : TOOLTIP_W,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Arrow pointing left toward the sidebar (desktop only) */}
      {!useBottom && (
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: -10,
            width: 0,
            height: 0,
            borderTop: "9px solid transparent",
            borderBottom: "9px solid transparent",
            borderRight: `10px solid ${stepData.color}28`,
          }}
        />
      )}

      {/* Arrow pointing up toward the spotlight (mobile bottom position) */}
      {useBottom && rect && (
        <div
          className="absolute -top-2.5 pointer-events-none"
          style={{
            left: Math.min(
              Math.max(rect.left + rect.width / 2 - 16, 12),
              windowWidth - 44
            ),
            width: 0,
            height: 0,
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderBottom: `10px solid ${stepData.color}28`,
          }}
        />
      )}

      <div
        className="rounded-xl p-4 flex flex-col gap-3"
        style={{
          background: "hsl(222, 41%, 11%)",
          border: `1px solid ${stepData.color}28`,
          boxShadow: `0 0 40px ${stepData.color}18, 0 12px 32px rgba(0,0,0,0.5)`,
        }}
      >
        <StepDots total={STEPS.length} current={step} color={stepData.color} />

        {/* Icon + title */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: `${stepData.color}18`,
              border: `1px solid ${stepData.color}30`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color: stepData.color }} />
          </div>
          <p className="text-sm font-semibold text-foreground leading-tight">
            {stepData.title}
          </p>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {stepData.description}
        </p>

        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              onClick={onPrev}
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
            >
              <ChevronLeft size={12} />
              Back
            </button>
          )}
          <button
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: stepData.color,
              color: "hsl(222, 47%, 8%)",
              boxShadow: `0 0 12px ${stepData.color}40`,
            }}
          >
            Next
            <ChevronRight size={13} />
          </button>
        </div>

        <button
          onClick={onSkip}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors text-center"
        >
          Skip tour
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface InteractiveTourProps {
  /** Callback to programmatically open the app sidebar */
  onOpenSidebar: () => void;
  /** Callback to programmatically close the app sidebar */
  onCloseSidebar: () => void;
  /**
   * When true the tour starts unconditionally (ignores the localStorage key).
   * Pass this for freshly signed-up users so the guide always fires on their
   * first login, even on devices that already have the key set.
   */
  isNewUser?: boolean;
  /**
   * Called once the tour has been shown (or skipped) so the parent can clear
   * the new-user flag in auth state.
   */
  onComplete?: () => void;
}

export function InteractiveTour({
  onOpenSidebar,
  onCloseSidebar,
  isNewUser = false,
  onComplete,
}: InteractiveTourProps) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<TargetRect | null>(null);
  const { width: winW, height: winH } = useWindowSize();

  // ── Auto-start: fires for new users OR if localStorage key is absent ──
  useEffect(() => {
    if (isNewUser || !localStorage.getItem(TOUR_KEY)) {
      const t = setTimeout(() => setActive(true), 1500);
      return () => clearTimeout(t);
    }
  // isNewUser is intentionally the only reactive dep here; we want this to
  // re-evaluate when the parent signals a fresh sign-up mid-session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewUser]);

  // ── Locate the spotlight target with retry polling ─────────────────────
  //
  // The sidebar is conditionally rendered (AnimatePresence), so immediately
  // after onOpenSidebar() the target element may not yet be in the DOM.
  // We retry every 100 ms for up to 1.5 s (15 attempts) until the element
  // has non-zero dimensions, then commit its rect.
  const locateTarget = useCallback((targetId: string) => {
    let attempts = 15;
    const tryFind = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
          return;
        }
      }
      if (attempts-- > 0) setTimeout(tryFind, 100);
    };
    tryFind();
  }, []);

  // ── Step-change effect: open/close sidebar then locate target ──────────
  useEffect(() => {
    if (!active) return;

    const s = STEPS[step];

    if (s.requiresSidebar && s.targetId) {
      // Open sidebar, then start polling for the target once it mounts
      onOpenSidebar();
      setRect(null); // clear old rect while sidebar slides in
      locateTarget(s.targetId);
    } else {
      onCloseSidebar();
      setRect(null);
    }
  }, [step, active, onOpenSidebar, onCloseSidebar, locateTarget]);

  // ── Re-locate on window resize (handles orientation changes) ──────────
  // Note: step is intentionally excluded from these deps so that resize
  // re-runs only when the window actually changes, not on every step tick.
  useEffect(() => {
    if (!active) return;
    const s = STEPS[step];
    if (s.targetId && rect) locateTarget(s.targetId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winW, winH]);

  // ── Actions ──────────────────────────────────────────────────────────
  const complete = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "true");
    setActive(false);
    onCloseSidebar();
    // Notify the parent (e.g. AppLayout) so it can clear the isNewUser flag
    // in AuthContext, preventing the tour from firing again this session.
    onComplete?.();
  }, [onCloseSidebar, onComplete]);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else complete();
  }, [step, complete]);

  const handlePrev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const handleSkip = useCallback(() => complete(), [complete]);

  if (!active) return null;

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const isCentre = !current.targetId;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {active && (
        <div key="interactive-tour">
          {/* ── Overlay layer ─────────────────────────────────────── */}
          {isCentre ? (
            /* Full-screen blur for welcome / finish steps */
            <motion.div
              key="overlay-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[310]"
              style={{
                background: "rgba(0,0,0,0.78)",
                backdropFilter: "blur(5px)",
                WebkitBackdropFilter: "blur(5px)",
              }}
            />
          ) : rect ? (
            <>
              {/*
               * Box-shadow spotlight trick:
               * A transparent div sized to the target rect with an
               * enormous box-shadow creates the dimmed surround effect.
               * z-[310] puts it above the sidebar (z-50) but below the
               * tooltip / beacon (z-[320] / z-[315]).
               */}
              <motion.div
                key="spotlight"
                className="fixed z-[310] rounded-xl"
                animate={{
                  top: rect.top - PAD,
                  left: rect.left - PAD,
                  width: rect.width + PAD * 2,
                  height: rect.height + PAD * 2,
                }}
                transition={{ type: "spring", damping: 32, stiffness: 320 }}
                style={{
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.78)",
                  // Pointer-events blocked everywhere — user must use tour buttons
                  pointerEvents: "none",
                }}
              />

              {/*
               * Invisible full-screen intercept — prevents accidental clicks
               * on anything outside the tooltip while the tour is active.
               */}
              <div className="fixed inset-0 z-[311]" />

              {/* Pulsing beacon ring around the spotlight */}
              <motion.div
                key="beacon"
                className="fixed z-[315] rounded-xl pointer-events-none"
                animate={{
                  top: rect.top - PAD - 5,
                  left: rect.left - PAD - 5,
                  width: rect.width + (PAD + 5) * 2,
                  height: rect.height + (PAD + 5) * 2,
                  // Pulse opacity & scale in a loop
                  opacity: [1, 0.45, 1],
                  scale: [1, 1.045, 1],
                }}
                transition={{
                  top: { type: "spring", damping: 32, stiffness: 320 },
                  left: { type: "spring", damping: 32, stiffness: 320 },
                  width: { type: "spring", damping: 32, stiffness: 320 },
                  height: { type: "spring", damping: 32, stiffness: 320 },
                  opacity: {
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "easeInOut",
                  },
                  scale: {
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "easeInOut",
                  },
                }}
                style={{
                  border: `2px solid ${current.color}`,
                  boxShadow: `0 0 18px ${current.color}55, 0 0 36px ${current.color}28`,
                }}
              />
            </>
          ) : null /* sidebar not yet open / element not yet in DOM */}

          {/* ── Tour card / tooltip ────────────────────────────────── */}
          {isCentre ? (
            <CentreCard
              step={step}
              stepData={current}
              isLast={isLast}
              isFirst={isFirst}
              onNext={handleNext}
              onPrev={handlePrev}
              onSkip={handleSkip}
            />
          ) : rect ? (
            <SpotlightTooltip
              step={step}
              stepData={current}
              rect={rect}
              windowWidth={winW}
              windowHeight={winH}
              onNext={handleNext}
              onPrev={handlePrev}
              onSkip={handleSkip}
            />
          ) : null}
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Replay button ────────────────────────────────────────────────────────────

/** Drop-in replacement for the old TourTriggerButton — clears the key & reloads. */
export function TourTriggerButton() {
  const handleRestart = () => {
    localStorage.removeItem(TOUR_KEY);
    window.location.reload();
  };

  return (
    <button
      onClick={handleRestart}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors w-full"
    >
      <Sparkles size={14} />
      Replay Tour
    </button>
  );
}
