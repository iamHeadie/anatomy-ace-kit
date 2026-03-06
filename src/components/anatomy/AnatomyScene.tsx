/**
 * AnatomyScene.tsx — Dual-mode 3D skeleton viewer
 *
 * Moveable Mode: OrbitControls enabled (rotate + zoom + pan), hover-highlight, floating label
 *
 * Labelled Mode (Atlas View):
 *   • Dual-Skeleton layout — Anterior (left) + Posterior (right) skeletons side by side
 *   • Synchronized Pinch-to-Zoom and Pan — both skeletons share a single camera/OrbitControls
 *   • Rotation LOCKED (front-facing anatomical position)
 *   • Staggered, tappable side-margin labels with fat-finger-friendly touch targets
 *   • Leader lines anchored to bone meshes, stable at all zoom levels
 *   • Clicking any label opens the same ContextPanel used in Floating Mode
 *   • Both skeletons highlight the selected bone simultaneously
 *   • No Latin names / TA98 codes anywhere in the label or overlay layer
 */

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Bounds, useBounds, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useRef, useMemo, useState, useCallback } from "react";
import * as THREE from "three";
import { SkeletonViewer } from "./SkeletonViewer";
import { BoneModel } from "./BoneModel";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";
import type { ViewerMode } from "@/contexts/ViewModeContext";

interface AnatomySceneProps {
  selectedPart: BonePart | null;
  hoveredPart: string | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
  onClearSelection: () => void;
  onOpenDrawer: () => void;
  drawerOpen: boolean;
  viewerMode: ViewerMode;
}

// ── Horizontal offset for dual-skeleton layout ─────────────────────────────
// Each skeleton sits at ±DUAL_OFFSET on the X axis.
// Keep this in sync with the ChartBoneTracker xOffset values below.
const DUAL_OFFSET = 3.2;

const SLATE_BG = new THREE.Color("#171720");

function SceneBackground() {
  const { scene, gl } = useThree();
  useEffect(() => {
    scene.background = SLATE_BG;
    gl.setClearColor(SLATE_BG, 1);
    return () => { scene.background = null; };
  }, [scene, gl]);
  return null;
}

function PrimitiveSkeletonGroup({
  selectedPart, hoveredPart, onSelectPart, onHoverPart,
}: Pick<AnatomySceneProps, "selectedPart" | "hoveredPart" | "onSelectPart" | "onHoverPart">) {
  return (
    <group position={[0, 0, 0]}>
      {skeletalParts.map((bone) => (
        <BoneModel
          key={bone.id}
          bone={bone}
          isSelected={selectedPart?.id === bone.id}
          isHighlighted={hoveredPart === bone.id || (selectedPart?.connections.includes(bone.id) ?? false)}
          onClick={() => onSelectPart(bone)}
          onHover={(h) => onHoverPart(h ? bone.id : null)}
        />
      ))}
    </group>
  );
}

function CameraController({ drawerOpen, selectedPart }: { drawerOpen: boolean; selectedPart: BonePart | null }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controls = useThree((state) => state.controls) as any;
  const prevDrawerOpen = useRef(false);

  useEffect(() => {
    if (!controls || drawerOpen === prevDrawerOpen.current) return;
    prevDrawerOpen.current = drawerOpen;
    if (drawerOpen && selectedPart) {
      controls.target.set(0, -0.5, 0);
    } else {
      controls.target.set(0, 0.65, 0);
    }
    controls.update();
  }, [drawerOpen, selectedPart, controls]);

  return null;
}

function AutoFramer({ selectedPart }: { selectedPart: BonePart | null }) {
  const bounds = useBounds();
  const prevPartId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedPart && selectedPart.id !== prevPartId.current) {
      prevPartId.current = selectedPart.id;
      bounds.refresh().clip().fit();
    } else if (!selectedPart && prevPartId.current) {
      prevPartId.current = null;
      bounds.refresh().clip().fit();
    }
  }, [selectedPart, bounds]);

  return null;
}

// ── Bone projection tracker — inside Canvas ────────────────────────────────
// Projects 3D bone positions to 2D screen coordinates every frame (when camera moves).
// xOffset and mirrorX allow it to track bones on the offset/rotated posterior skeleton.
interface ProjectedPositions {
  positions: Record<string, { x: number; y: number }>;
  cameraZ: number;
}

function ChartBoneTracker({
  bones,
  onUpdate,
  xOffset = 0,
  mirrorX = false,
}: {
  bones: BonePart[];
  onUpdate: (data: ProjectedPositions) => void;
  xOffset?: number;
  mirrorX?: boolean;
}) {
  const { camera, size } = useThree();
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const prevCamState = useRef({ x: Infinity, y: Infinity, z: Infinity });

  useFrame(() => {
    const { x, y, z } = camera.position;
    const prev = prevCamState.current;
    if (
      Math.abs(x - prev.x) < 0.005 &&
      Math.abs(y - prev.y) < 0.005 &&
      Math.abs(z - prev.z) < 0.005
    ) return;

    prevCamState.current = { x, y, z };

    const positions: Record<string, { x: number; y: number }> = {};
    for (const bone of bones) {
      // For posterior skeleton: Y-rotation by π flips X and Z
      const worldX = mirrorX
        ? xOffset - bone.position[0]
        : bone.position[0] + xOffset;
      const worldZ = mirrorX ? -bone.position[2] : bone.position[2];

      tempVec.set(worldX, bone.position[1], worldZ);
      tempVec.project(camera);
      positions[bone.id] = {
        x: (tempVec.x * 0.5 + 0.5) * size.width,
        y: (-tempVec.y * 0.5 + 0.5) * size.height,
      };
    }
    onUpdate({ positions, cameraZ: z });
  });

  return null;
}

// ── Chart label specifications ─────────────────────────────────────────────
// Anterior skeleton — labels on the left margin
interface ChartBoneSpec {
  boneId: string;
  panel: "left" | "right";
  major: boolean;
}

const CHART_SPECS_ANTERIOR: ChartBoneSpec[] = [
  { boneId: "A02.1.02.001",      panel: "left",  major: true  }, // Frontal bone
  { boneId: "A02.1.02.301-L",    panel: "left",  major: false }, // Temporal (L)
  { boneId: "A02.4.01.001-L",    panel: "left",  major: true  }, // Clavicle (L)
  { boneId: "A02.4.02.001-L",    panel: "left",  major: true  }, // Humerus (L)
  { boneId: "A02.4.03.001-L",    panel: "left",  major: true  }, // Radius (L)
  { boneId: "A02.4.03.002-L",    panel: "left",  major: false }, // Ulna (L)
  { boneId: "A02.5.01.101-L",    panel: "left",  major: true  }, // Ilium (L)
  { boneId: "A02.5.02.001-L",    panel: "left",  major: true  }, // Femur (L)
  { boneId: "A02.5.02.002-L",    panel: "left",  major: false }, // Patella (L)
  { boneId: "A02.5.06.001-L",    panel: "left",  major: true  }, // Tibia (L)
  { boneId: "A02.5.10.001-L",    panel: "left",  major: false }, // Calcaneus (L)
  // Right-side margin for anterior (midline bones)
  { boneId: "A02.1.03.701",      panel: "right", major: true  }, // Mandible
  { boneId: "A02.3.01.001",      panel: "right", major: true  }, // Sternum
  { boneId: "A02.2.02.001",      panel: "right", major: false }, // Atlas C1
  { boneId: "A02.1.00.027",      panel: "right", major: false }, // Hyoid
  { boneId: "A02.3.02.001-L",    panel: "right", major: false }, // Rib 1
  { boneId: "A02.5.01.301-L",    panel: "right", major: false }, // Pubis (L)
];

// Posterior skeleton — labels on the right margin
const CHART_SPECS_POSTERIOR: ChartBoneSpec[] = [
  { boneId: "A02.1.02.201",      panel: "right", major: true  }, // Occipital
  { boneId: "A02.4.01.002-L",    panel: "right", major: true  }, // Scapula (L)
  { boneId: "A02.4.02.001-L",    panel: "right", major: true  }, // Humerus (L)
  { boneId: "A02.4.03.002-L",    panel: "right", major: true  }, // Ulna (L)
  { boneId: "A02.2.03.001",      panel: "right", major: false }, // T1
  { boneId: "A02.2.04.003",      panel: "right", major: false }, // L3
  { boneId: "A02.2.05.001",      panel: "right", major: true  }, // Sacrum
  { boneId: "A02.2.06.001",      panel: "right", major: false }, // Coccyx
  { boneId: "A02.5.01.101-L",    panel: "right", major: true  }, // Ilium (L)
  { boneId: "A02.5.06.002-L",    panel: "right", major: true  }, // Fibula (L)
  { boneId: "A02.5.10.001-L",    panel: "right", major: true  }, // Calcaneus (L)
  { boneId: "A02.5.10.002-L",    panel: "right", major: false }, // Talus (L)
];

// Legacy single-skeleton specs (used in non-dual labelled mode — same as before)
const CHART_SPECS: ChartBoneSpec[] = [
  { boneId: "A02.1.02.001",      panel: "left",  major: true  },
  { boneId: "A02.1.02.301-L",    panel: "left",  major: false },
  { boneId: "A02.4.01.001-L",    panel: "left",  major: true  },
  { boneId: "A02.4.01.002-L",    panel: "left",  major: false },
  { boneId: "A02.4.02.001-L",    panel: "left",  major: true  },
  { boneId: "A02.4.03.001-L",    panel: "left",  major: true  },
  { boneId: "A02.3.02.001-L",    panel: "left",  major: false },
  { boneId: "A02.5.01.101-L",    panel: "left",  major: true  },
  { boneId: "A02.5.02.001-L",    panel: "left",  major: true  },
  { boneId: "A02.5.02.002-L",    panel: "left",  major: false },
  { boneId: "A02.5.06.001-L",    panel: "left",  major: true  },
  { boneId: "A02.5.10.001-L",    panel: "left",  major: false },
  { boneId: "A02.1.03.701",      panel: "right", major: true  },
  { boneId: "A02.1.00.027",      panel: "right", major: false },
  { boneId: "A02.3.01.001",      panel: "right", major: true  },
  { boneId: "A02.2.02.001",      panel: "right", major: false },
  { boneId: "A02.2.02.301",      panel: "right", major: false },
  { boneId: "A02.2.03.001",      panel: "right", major: false },
  { boneId: "A02.2.04.003",      panel: "right", major: false },
  { boneId: "A02.2.05.001",      panel: "right", major: false },
  { boneId: "A02.2.06.001",      panel: "right", major: false },
  { boneId: "A02.4.03.002-L",    panel: "right", major: true  },
  { boneId: "A02.5.06.002-L",    panel: "right", major: true  },
  { boneId: "A02.5.10.002-L",    panel: "right", major: false },
];

// ── Anatomical Chart Overlay — outside Canvas ──────────────────────────────
interface AnatomicalChartOverlayProps {
  projectedDataAnterior: ProjectedPositions | null;
  projectedDataPosterior: ProjectedPositions | null;
  containerWidth: number;
  containerHeight: number;
  isDualSkeleton: boolean;
  onSelectBone: (bone: BonePart) => void;
  selectedBoneId: string | null;
}

function AnatomicalChartOverlay({
  projectedDataAnterior,
  projectedDataPosterior,
  containerWidth,
  containerHeight,
  isDualSkeleton,
  onSelectBone,
  selectedBoneId,
}: AnatomicalChartOverlayProps) {
  if (!projectedDataAnterior || containerWidth === 0 || containerHeight === 0) return null;

  const { cameraZ } = projectedDataAnterior;
  const isZoomedOut = cameraZ > (isDualSkeleton ? 12 : 8);

  const anteriorPositions = projectedDataAnterior.positions;
  const posteriorPositions = projectedDataPosterior?.positions ?? {};

  // ── Resolve active bone sets ─────────────────────────────────────────────
  const activeAnteriorLeft = useMemo(() => {
    const specs = isDualSkeleton ? CHART_SPECS_ANTERIOR.filter(s => s.panel === "left") : CHART_SPECS.filter(s => s.panel === "left");
    return specs.flatMap((spec) => {
      if (isZoomedOut && !spec.major) return [];
      const bone = skeletalParts.find((b) => b.id === spec.boneId);
      if (bone && anteriorPositions[bone.id]) return [{ bone, spec }];
      return [];
    });
  }, [isZoomedOut, anteriorPositions, isDualSkeleton]);

  // For single-skeleton mode, right labels also track anterior
  const activeAnteriorRight = useMemo(() => {
    if (isDualSkeleton) return [];
    return CHART_SPECS.filter(s => s.panel === "right").flatMap((spec) => {
      if (isZoomedOut && !spec.major) return [];
      const bone = skeletalParts.find((b) => b.id === spec.boneId);
      if (bone && anteriorPositions[bone.id]) return [{ bone, spec }];
      return [];
    });
  }, [isZoomedOut, anteriorPositions, isDualSkeleton]);

  const activePosteriorRight = useMemo(() => {
    if (!isDualSkeleton) return [];
    return CHART_SPECS_POSTERIOR.filter(s => s.panel === "right").flatMap((spec) => {
      if (isZoomedOut && !spec.major) return [];
      const bone = skeletalParts.find((b) => b.id === spec.boneId);
      if (bone && posteriorPositions[bone.id]) return [{ bone, spec }];
      return [];
    });
  }, [isZoomedOut, posteriorPositions, isDualSkeleton]);

  // ── Layout constants ─────────────────────────────────────────────────────
  const MARGIN_TOP    = containerHeight * 0.06;
  const MARGIN_BOTTOM = containerHeight * 0.06;
  const usableH       = containerHeight - MARGIN_TOP - MARGIN_BOTTOM;
  const STAGGER_PX    = 6; // vertical stagger for alternating labels (mobile ergonomics)

  const getY = (index: number, total: number, stagger = true): number => {
    const base = total <= 1
      ? containerHeight / 2
      : MARGIN_TOP + (index / (total - 1)) * usableH;
    return stagger ? base + (index % 2 === 0 ? -STAGGER_PX : STAGGER_PX) : base;
  };

  const LABEL_MARGIN_X = 6; // px from screen edge to outer label edge
  const LINE_COLOR     = "rgba(56,189,248,0.45)";
  const DOT_COLOR      = "rgba(14,165,233,0.9)";
  const SEL_LINE_COLOR = "rgba(56,189,248,0.85)";
  const SEL_DOT_COLOR  = "rgba(14,165,233,1.0)";

  // ── Shared label button renderer ──────────────────────────────────────────
  const renderLabel = (
    bone: BonePart,
    labelY: number,
    side: "left" | "right",
  ) => {
    const displayName = bone.name.replace(/^(Left|Right)\s/, "");
    const isSelected = selectedBoneId === bone.id;
    return (
      <div
        key={`label-${bone.id}`}
        style={{
          position: "absolute",
          [side]: LABEL_MARGIN_X,
          top: labelY,
          transform: "translateY(-50%)",
          maxWidth: 160,
          textAlign: side === "left" ? "right" : "left",
          zIndex: 6,
        }}
      >
        <button
          onClick={() => onSelectBone(bone)}
          aria-label={`Select ${bone.name}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: "clamp(9px, 1.8vw, 11px)",
            fontWeight: isSelected ? 700 : 600,
            color: isSelected ? "#38bdf8" : "#e0f2fe",
            background: isSelected
              ? "rgba(14, 165, 233, 0.22)"
              : "rgba(8, 14, 30, 0.72)",
            padding: "6px 10px",       // fat-finger touch target
            minHeight: "32px",          // minimum 32 px height for accessibility
            minWidth: "44px",           // minimum touch target width
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
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(14, 165, 233, 0.16)";
              (e.currentTarget as HTMLButtonElement).style.color = "#7dd3fc";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(8, 14, 30, 0.72)";
              (e.currentTarget as HTMLButtonElement).style.color = "#e0f2fe";
            }
          }}
        >
          {displayName}
        </button>
      </div>
    );
  };

  // ── SVG leader line renderer ──────────────────────────────────────────────
  const renderLeaderLine = (
    bone: BonePart,
    labelY: number,
    side: "left" | "right",
    boneScreenPos: { x: number; y: number },
  ) => {
    const isSelected = selectedBoneId === bone.id;
    const lineColor = isSelected ? SEL_LINE_COLOR : LINE_COLOR;
    const dotColor  = isSelected ? SEL_DOT_COLOR  : DOT_COLOR;
    const dotR      = isSelected ? 4 : 3;

    if (side === "left") {
      const labelRight = LABEL_MARGIN_X + 168;
      return (
        <g key={`line-${bone.id}`}>
          <line x1={labelRight} y1={labelY} x2={boneScreenPos.x} y2={labelY}
            stroke={lineColor} strokeWidth={isSelected ? 1.5 : 1} strokeDasharray="3 3" />
          <line x1={boneScreenPos.x} y1={labelY} x2={boneScreenPos.x} y2={boneScreenPos.y}
            stroke={lineColor} strokeWidth={isSelected ? 1.5 : 1} strokeDasharray="3 3" />
          <circle cx={boneScreenPos.x} cy={boneScreenPos.y} r={dotR} fill={dotColor} />
        </g>
      );
    } else {
      const labelLeft = containerWidth - LABEL_MARGIN_X - 168;
      return (
        <g key={`line-${bone.id}`}>
          <line x1={labelLeft} y1={labelY} x2={boneScreenPos.x} y2={labelY}
            stroke={lineColor} strokeWidth={isSelected ? 1.5 : 1} strokeDasharray="3 3" />
          <line x1={boneScreenPos.x} y1={labelY} x2={boneScreenPos.x} y2={boneScreenPos.y}
            stroke={lineColor} strokeWidth={isSelected ? 1.5 : 1} strokeDasharray="3 3" />
          <circle cx={boneScreenPos.x} cy={boneScreenPos.y} r={dotR} fill={dotColor} />
        </g>
      );
    }
  };

  return (
    <div
      className="absolute inset-0"
      style={{ zIndex: 5, overflow: "hidden", pointerEvents: "none" }}
    >
      {/* Full-viewport SVG for leader lines — pointer-events:none so labels stay tappable */}
      <svg
        width={containerWidth}
        height={containerHeight}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {/* Dual-skeleton divider */}
        {isDualSkeleton && (
          <>
            <line
              x1={containerWidth / 2} y1={containerHeight * 0.06}
              x2={containerWidth / 2} y2={containerHeight * 0.94}
              stroke="rgba(56,189,248,0.12)" strokeWidth="1" strokeDasharray="6 6"
            />
            <text x={containerWidth / 4} y={containerHeight * 0.04}
              fill="rgba(148,163,184,0.5)" fontSize="9" textAnchor="middle"
              fontFamily="system-ui,sans-serif" letterSpacing="0.08em">
              ANTERIOR
            </text>
            <text x={containerWidth * 3 / 4} y={containerHeight * 0.04}
              fill="rgba(148,163,184,0.5)" fontSize="9" textAnchor="middle"
              fontFamily="system-ui,sans-serif" letterSpacing="0.08em">
              POSTERIOR
            </text>
          </>
        )}

        {/* Left margin leader lines — anterior skeleton */}
        {activeAnteriorLeft.map(({ bone }, i) => {
          const pos = anteriorPositions[bone.id];
          if (!pos) return null;
          return renderLeaderLine(bone, getY(i, activeAnteriorLeft.length), "left", pos);
        })}

        {/* Right margin leader lines — single-skeleton anterior */}
        {activeAnteriorRight.map(({ bone }, i) => {
          const pos = anteriorPositions[bone.id];
          if (!pos) return null;
          return renderLeaderLine(bone, getY(i, activeAnteriorRight.length), "right", pos);
        })}

        {/* Right margin leader lines — dual-skeleton posterior */}
        {activePosteriorRight.map(({ bone }, i) => {
          const pos = posteriorPositions[bone.id];
          if (!pos) return null;
          return renderLeaderLine(bone, getY(i, activePosteriorRight.length), "right", pos);
        })}
      </svg>

      {/* ── Left margin labels (pointer-events: auto on individual buttons) ─── */}
      {activeAnteriorLeft.map(({ bone }, i) =>
        renderLabel(bone, getY(i, activeAnteriorLeft.length), "left")
      )}

      {/* ── Right margin labels — single-skeleton ────────────────────────── */}
      {activeAnteriorRight.map(({ bone }, i) =>
        renderLabel(bone, getY(i, activeAnteriorRight.length), "right")
      )}

      {/* ── Right margin labels — posterior skeleton ─────────────────────── */}
      {activePosteriorRight.map(({ bone }, i) =>
        renderLabel(bone, getY(i, activePosteriorRight.length), "right")
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

// ── Resolve all bones for trackers at module level ─────────────────────────
const CHART_BONES_ANTERIOR = [...CHART_SPECS_ANTERIOR, ...CHART_SPECS].flatMap((spec) => {
  const bone = skeletalParts.find((b) => b.id === spec.boneId);
  return bone ? [bone] : [];
}).filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i); // dedupe

const CHART_BONES_POSTERIOR = CHART_SPECS_POSTERIOR.flatMap((spec) => {
  const bone = skeletalParts.find((b) => b.id === spec.boneId);
  return bone ? [bone] : [];
});

export function AnatomyScene({
  selectedPart, hoveredPart, onSelectPart, onHoverPart,
  onClearSelection, onOpenDrawer, drawerOpen, viewerMode,
}: AnatomySceneProps) {
  const isLabelled = viewerMode === "labelled";

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Two separate projected-position states: anterior (left) and posterior (right)
  const [projectedDataAnterior, setProjectedDataAnterior] = useState<ProjectedPositions | null>(null);
  const [projectedDataPosterior, setProjectedDataPosterior] = useState<ProjectedPositions | null>(null);

  const handleAnteriorUpdate = useCallback((d: ProjectedPositions) => setProjectedDataAnterior(d), []);
  const handlePosteriorUpdate = useCallback((d: ProjectedPositions) => setProjectedDataPosterior(d), []);

  // Camera settings differ between modes
  const cameraZ    = isLabelled ? 18 : 12;
  const cameraPos: [number, number, number] = [0, 0.65, cameraZ];

  return (
    <div ref={containerRef} className="w-full h-full" style={{ position: "relative" }}>
      <Canvas
        camera={{ position: cameraPos, fov: 45 }}
        dpr={[1, 2]}
        style={{ touchAction: "none", background: "#171720" }}
      >
        <SceneBackground />

        <Suspense
          fallback={
            <PrimitiveSkeletonGroup
              selectedPart={selectedPart}
              hoveredPart={hoveredPart}
              onSelectPart={onSelectPart}
              onHoverPart={onHoverPart}
            />
          }
        >
          <ambientLight color="#d0d8e8" intensity={0.18} />
          <directionalLight position={[-4, 7, 5]} intensity={1.4} color="#fff8e7" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <directionalLight position={[5, 3, -3]} intensity={0.45} color="#c8d8ff" />
          <directionalLight position={[0, 6, -8]} intensity={0.6} color="#ffe0a0" />
          <pointLight position={[0, 2, 3]} intensity={0.35} color="#14b8a6" distance={12} decay={2} />

          <Bounds fit clip observe margin={isLabelled ? 1.1 : 1.4}>
            {isLabelled ? (
              <>
                {/* ── Anterior skeleton — left half ────────────────────── */}
                <SkeletonViewer
                  selectedPart={selectedPart}
                  hoveredPart={hoveredPart}
                  onSelectPart={onSelectPart}
                  onHoverPart={onHoverPart}
                  onClearSelection={onClearSelection}
                  onOpenDrawer={onOpenDrawer}
                  viewerMode={viewerMode}
                  xOffset={-DUAL_OFFSET}
                  yRotation={0}
                  disableInteraction={false}
                />

                {/* ── Posterior skeleton — right half (rotated π) ───────── */}
                <SkeletonViewer
                  selectedPart={selectedPart}
                  hoveredPart={hoveredPart}
                  onSelectPart={onSelectPart}
                  onHoverPart={onHoverPart}
                  onClearSelection={onClearSelection}
                  onOpenDrawer={onOpenDrawer}
                  viewerMode={viewerMode}
                  xOffset={DUAL_OFFSET}
                  yRotation={Math.PI}
                  disableInteraction={false}
                />

                {/* Anterior projection tracker */}
                <ChartBoneTracker
                  bones={CHART_BONES_ANTERIOR}
                  onUpdate={handleAnteriorUpdate}
                  xOffset={-DUAL_OFFSET}
                  mirrorX={false}
                />

                {/* Posterior projection tracker (Y-rotation = π mirrors X) */}
                <ChartBoneTracker
                  bones={CHART_BONES_POSTERIOR}
                  onUpdate={handlePosteriorUpdate}
                  xOffset={DUAL_OFFSET}
                  mirrorX={true}
                />
              </>
            ) : (
              <>
                <SkeletonViewer
                  selectedPart={selectedPart}
                  hoveredPart={hoveredPart}
                  onSelectPart={onSelectPart}
                  onHoverPart={onHoverPart}
                  onClearSelection={onClearSelection}
                  onOpenDrawer={onOpenDrawer}
                  viewerMode={viewerMode}
                />

                {isLabelled && (
                  <ChartBoneTracker
                    bones={CHART_BONES_ANTERIOR}
                    onUpdate={handleAnteriorUpdate}
                  />
                )}
              </>
            )}

            <AutoFramer selectedPart={selectedPart} />
          </Bounds>

          <ContactShadows position={[0, -2.9, 0]} opacity={0.25} scale={12} blur={3} far={5} color="#000820" />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1.5}
            maxDistance={28}
            target={[0, 0.65, 0]}
            makeDefault
          />

          <CameraController drawerOpen={drawerOpen} selectedPart={selectedPart} />
        </Suspense>
      </Canvas>

      {/* ── Anatomical chart overlay — labelled mode only ─────────────────── */}
      {isLabelled && (
        <AnatomicalChartOverlay
          projectedDataAnterior={projectedDataAnterior}
          projectedDataPosterior={projectedDataPosterior}
          containerWidth={containerSize.w}
          containerHeight={containerSize.h}
          isDualSkeleton={true}
          onSelectBone={onSelectPart}
          selectedBoneId={selectedPart?.id ?? null}
        />
      )}
    </div>
  );
}
