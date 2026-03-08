/**
 * LabelledViewer.tsx — Textbook-style anatomical chart overlay
 *
 * Renders 1 px solid SVG leader lines that connect 3D bone anchor points
 * (projected to 2D screen space by ChartBoneTracker inside the Canvas) to
 * margin-aligned bone-name labels, mimicking a traditional biology textbook.
 *
 * Rules:
 *   • Only active when viewMode === "labelled" (enforced by parent AnatomyScene)
 *   • Left-margin labels are LEFT-aligned; right-margin labels are RIGHT-aligned
 *   • Lines are solid, 1 px wide — no dashes, no glow effects
 *   • A small circular terminus dot marks the 3D bone anchor point
 *   • Leader lines re-project every frame via ChartBoneTracker, so they stay
 *     anchored to the bone as the user rotates or zooms the model
 */

import { useMemo } from "react";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";

// ── Re-export types consumed by AnatomyScene ────────────────────────────────
export interface ProjectedPositions {
  positions: Record<string, { x: number; y: number }>;
  cameraZ: number;
}

export interface ChartBoneSpec {
  boneId: string;
  panel: "left" | "right";
  major: boolean;
}

// ── Layout constants ────────────────────────────────────────────────────────
/** Horizontal gap from the screen edge to the outer label edge (px). */
const LABEL_MARGIN_X = 6;

/**
 * Fixed pixel width of the label column on each side.
 * Used to compute the label-edge connection point for the leader line.
 * Matches the `maxWidth` on each label button.
 */
const MAX_LABEL_W = 160;

/** Vertical padding removed from the top/bottom of the label area. */
const MARGIN_RATIO = 0.06;

/** Alternating vertical stagger applied to adjacent labels (improves readability). */
const STAGGER_PX = 6;

// ── Colour tokens ───────────────────────────────────────────────────────────
const LINE_COLOR     = "rgba(148,163,184,0.55)";  // slate-300 @ 55% — subtle, textbook
const DOT_COLOR      = "rgba(148,163,184,0.80)";
const SEL_LINE_COLOR = "rgba(56,189,248,0.90)";   // sky-400 — matches UI accent on selection
const SEL_DOT_COLOR  = "rgba(56,189,248,1.0)";

// ── Component props ─────────────────────────────────────────────────────────
export interface LabelledOverlayProps {
  /** 2-D projections for the anterior (or single) skeleton. */
  projectedDataAnterior: ProjectedPositions | null;
  /** 2-D projections for the posterior skeleton (dual-skeleton mode only). */
  projectedDataPosterior: ProjectedPositions | null;
  /** Pixel width of the host container. */
  containerWidth: number;
  /** Pixel height of the host container. */
  containerHeight: number;
  /** True when both anterior + posterior skeletons are visible. */
  isDualSkeleton: boolean;
  /** Called when a label button is tapped/clicked. */
  onSelectBone: (bone: BonePart) => void;
  /** TA98 ID of the currently selected bone (for highlight state). */
  selectedBoneId: string | null;
  /** Specs that describe which bones to label on the left (anterior) margin. */
  specsAnteriorLeft: ChartBoneSpec[];
  /** Specs that describe which bones to label on the right (anterior) margin
   *  — only used in single-skeleton mode. */
  specsAnteriorRight: ChartBoneSpec[];
  /** Specs that describe which bones to label on the right (posterior) margin
   *  — only used in dual-skeleton mode. */
  specsPosteriorRight: ChartBoneSpec[];
}

// ── Helper: evenly-spaced Y positions with alternating stagger ───────────────
function getY(
  index: number,
  total: number,
  containerHeight: number,
  stagger = true,
): number {
  const marginTop    = containerHeight * MARGIN_RATIO;
  const marginBottom = containerHeight * MARGIN_RATIO;
  const usableH      = containerHeight - marginTop - marginBottom;

  const base =
    total <= 1
      ? containerHeight / 2
      : marginTop + (index / (total - 1)) * usableH;

  return stagger ? base + (index % 2 === 0 ? -STAGGER_PX : STAGGER_PX) : base;
}

// ── Main export ─────────────────────────────────────────────────────────────
export function LabelledOverlay({
  projectedDataAnterior,
  projectedDataPosterior,
  containerWidth,
  containerHeight,
  isDualSkeleton,
  onSelectBone,
  selectedBoneId,
  specsAnteriorLeft,
  specsAnteriorRight,
  specsPosteriorRight,
}: LabelledOverlayProps) {
  if (!projectedDataAnterior || containerWidth === 0 || containerHeight === 0) return null;

  const { cameraZ } = projectedDataAnterior;
  const isZoomedOut = cameraZ > (isDualSkeleton ? 12 : 8);

  const anteriorPositions = projectedDataAnterior.positions;
  const posteriorPositions = projectedDataPosterior?.positions ?? {};

  // ── Resolve active bone lists ─────────────────────────────────────────────
  const activeAnteriorLeft = useMemo(() => {
    return specsAnteriorLeft.flatMap((spec) => {
      if (isZoomedOut && !spec.major) return [];
      const bone = skeletalParts.find((b) => b.id === spec.boneId);
      if (bone && anteriorPositions[bone.id]) return [{ bone, spec }];
      return [];
    });
  }, [isZoomedOut, anteriorPositions, specsAnteriorLeft]);

  const activeAnteriorRight = useMemo(() => {
    if (isDualSkeleton) return [];
    return specsAnteriorRight.flatMap((spec) => {
      if (isZoomedOut && !spec.major) return [];
      const bone = skeletalParts.find((b) => b.id === spec.boneId);
      if (bone && anteriorPositions[bone.id]) return [{ bone, spec }];
      return [];
    });
  }, [isZoomedOut, anteriorPositions, isDualSkeleton, specsAnteriorRight]);

  const activePosteriorRight = useMemo(() => {
    if (!isDualSkeleton) return [];
    return specsPosteriorRight.flatMap((spec) => {
      if (isZoomedOut && !spec.major) return [];
      const bone = skeletalParts.find((b) => b.id === spec.boneId);
      if (bone && posteriorPositions[bone.id]) return [{ bone, spec }];
      return [];
    });
  }, [isZoomedOut, posteriorPositions, isDualSkeleton, specsPosteriorRight]);

  // ── Textbook leader-line renderer ─────────────────────────────────────────
  /**
   * Draws a single solid 1 px line from the label-column edge to the 3-D bone
   * anchor point, plus a small terminus dot. No dashes, no elbow segments.
   *
   * Left margin  → line originates from the RIGHT edge of the label column.
   * Right margin → line originates from the LEFT edge of the label column.
   */
  const renderLeaderLine = (
    bone: BonePart,
    labelY: number,
    side: "left" | "right",
    boneScreenPos: { x: number; y: number },
  ) => {
    const isSelected = selectedBoneId === bone.id;
    const lineColor  = isSelected ? SEL_LINE_COLOR : LINE_COLOR;
    const dotColor   = isSelected ? SEL_DOT_COLOR  : DOT_COLOR;
    const dotR       = isSelected ? 3.5 : 2.5;

    // X coordinate of the label edge that connects to the line.
    const labelEdgeX =
      side === "left"
        ? LABEL_MARGIN_X + MAX_LABEL_W          // right edge of left-margin column
        : containerWidth - LABEL_MARGIN_X - MAX_LABEL_W; // left edge of right-margin column

    return (
      <g key={`line-${bone.id}`}>
        {/* Single solid diagonal line — textbook style */}
        <line
          x1={labelEdgeX}
          y1={labelY}
          x2={boneScreenPos.x}
          y2={boneScreenPos.y}
          stroke={lineColor}
          strokeWidth="1"
        />
        {/* Terminus dot at the 3-D bone anchor */}
        <circle
          cx={boneScreenPos.x}
          cy={boneScreenPos.y}
          r={dotR}
          fill={dotColor}
        />
      </g>
    );
  };

  // ── Label button renderer ─────────────────────────────────────────────────
  /**
   * Renders a tappable label pill anchored to the screen margin.
   *
   * Textbook alignment:
   *   left-margin labels  → text-align: left
   *   right-margin labels → text-align: right
   */
  const renderLabel = (
    bone: BonePart,
    labelY: number,
    side: "left" | "right",
  ) => {
    // Strip the "Left " / "Right " prefix — we show only the bone name itself.
    const displayName = bone.name.replace(/^(Left|Right)\s/, "");
    const isSelected  = selectedBoneId === bone.id;

    return (
      <div
        key={`label-${bone.id}`}
        style={{
          position: "absolute",
          [side]: LABEL_MARGIN_X,
          top: labelY,
          transform: "translateY(-50%)",
          maxWidth: MAX_LABEL_W,
          // Textbook rule: left labels read left→right; right labels read right→left.
          textAlign: side,
          zIndex: 6,
        }}
      >
        <button
          onClick={() => onSelectBone(bone)}
          aria-label={`Select ${bone.name}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            // Align button content per textbook convention
            justifyContent: side === "left" ? "flex-start" : "flex-end",
            fontSize: "clamp(9px, 1.8vw, 11px)",
            fontWeight: isSelected ? 700 : 600,
            color: isSelected ? "#38bdf8" : "#e0f2fe",
            background: isSelected
              ? "rgba(14, 165, 233, 0.22)"
              : "rgba(8, 14, 30, 0.72)",
            padding: "6px 10px",
            minHeight: "32px",   // WCAG minimum touch target height
            minWidth: "44px",    // WCAG minimum touch target width
            borderRadius: 6,
            whiteSpace: "nowrap",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            border: isSelected
              ? "1px solid rgba(56,189,248,0.6)"
              : "1px solid rgba(56,189,248,0.22)",
            lineHeight: 1.4,
            letterSpacing: "0.01em",
            cursor: "pointer",
            pointerEvents: "auto",
            transition: "color 0.15s, background 0.15s, border-color 0.15s",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.background = "rgba(14, 165, 233, 0.16)";
              btn.style.color = "#7dd3fc";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.background = "rgba(8, 14, 30, 0.72)";
              btn.style.color = "#e0f2fe";
            }
          }}
        >
          {displayName}
        </button>
      </div>
    );
  };

  return (
    <div
      className="absolute inset-0"
      style={{ zIndex: 5, overflow: "hidden", pointerEvents: "none" }}
    >
      {/* Full-viewport SVG for leader lines — pointer-events:none so labels remain tappable */}
      <svg
        width={containerWidth}
        height={containerHeight}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        aria-hidden="true"
      >
        {/* Dual-skeleton divider + panel labels */}
        {isDualSkeleton && (
          <>
            <line
              x1={containerWidth / 2}
              y1={containerHeight * MARGIN_RATIO}
              x2={containerWidth / 2}
              y2={containerHeight * (1 - MARGIN_RATIO)}
              stroke="rgba(56,189,248,0.12)"
              strokeWidth="1"
              strokeDasharray="6 6"
            />
            <text
              x={containerWidth / 4}
              y={containerHeight * (MARGIN_RATIO * 0.65)}
              fill="rgba(148,163,184,0.5)"
              fontSize="9"
              textAnchor="middle"
              fontFamily="system-ui,sans-serif"
              letterSpacing="0.08em"
            >
              ANTERIOR
            </text>
            <text
              x={(containerWidth * 3) / 4}
              y={containerHeight * (MARGIN_RATIO * 0.65)}
              fill="rgba(148,163,184,0.5)"
              fontSize="9"
              textAnchor="middle"
              fontFamily="system-ui,sans-serif"
              letterSpacing="0.08em"
            >
              POSTERIOR
            </text>
          </>
        )}

        {/* Left margin leader lines — anterior skeleton */}
        {activeAnteriorLeft.map(({ bone }, i) => {
          const pos = anteriorPositions[bone.id];
          if (!pos) return null;
          return renderLeaderLine(
            bone,
            getY(i, activeAnteriorLeft.length, containerHeight),
            "left",
            pos,
          );
        })}

        {/* Right margin leader lines — single-skeleton (anterior) */}
        {activeAnteriorRight.map(({ bone }, i) => {
          const pos = anteriorPositions[bone.id];
          if (!pos) return null;
          return renderLeaderLine(
            bone,
            getY(i, activeAnteriorRight.length, containerHeight),
            "right",
            pos,
          );
        })}

        {/* Right margin leader lines — posterior skeleton (dual mode) */}
        {activePosteriorRight.map(({ bone }, i) => {
          const pos = posteriorPositions[bone.id];
          if (!pos) return null;
          return renderLeaderLine(
            bone,
            getY(i, activePosteriorRight.length, containerHeight),
            "right",
            pos,
          );
        })}
      </svg>

      {/* Left margin labels (pointer-events auto on the buttons themselves) */}
      {activeAnteriorLeft.map(({ bone }, i) =>
        renderLabel(bone, getY(i, activeAnteriorLeft.length, containerHeight), "left"),
      )}

      {/* Right margin labels — single-skeleton */}
      {activeAnteriorRight.map(({ bone }, i) =>
        renderLabel(bone, getY(i, activeAnteriorRight.length, containerHeight), "right"),
      )}

      {/* Right margin labels — posterior skeleton */}
      {activePosteriorRight.map(({ bone }, i) =>
        renderLabel(bone, getY(i, activePosteriorRight.length, containerHeight), "right"),
      )}

      {/* Zoom / interaction hint */}
      {isZoomedOut && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "10px",
            color: "rgba(148,163,184,0.7)",
            background: "rgba(8,14,30,0.6)",
            padding: "3px 10px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(6px)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          Tap a label to explore · Pinch or scroll to zoom · Pan to compare
        </div>
      )}
    </div>
  );
}
