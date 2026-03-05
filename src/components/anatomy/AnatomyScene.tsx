/**
 * AnatomyScene.tsx — Dual-mode 3D skeleton viewer
 *
 * Moveable Mode: OrbitControls enabled (rotate + zoom + pan), hover-highlight, no labels
 * Labelled Mode: Zoom + Pan enabled, Rotation LOCKED (front-facing anatomical position),
 *                CSS-anchored labels on left/right margins with SVG leader lines,
 *                dynamic label visibility based on zoom level
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
// Projects 3D bone positions to 2D screen coordinates every frame (when camera moves)
interface ProjectedPositions {
  positions: Record<string, { x: number; y: number }>;
  cameraZ: number;
}

function ChartBoneTracker({
  bones,
  onUpdate,
}: {
  bones: BonePart[];
  onUpdate: (data: ProjectedPositions) => void;
}) {
  const { camera, size } = useThree();
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const prevCamState = useRef({ x: Infinity, y: Infinity, z: Infinity });

  useFrame(() => {
    const { x, y, z } = camera.position;
    const prev = prevCamState.current;
    // Only reproject when camera moves meaningfully
    if (
      Math.abs(x - prev.x) < 0.005 &&
      Math.abs(y - prev.y) < 0.005 &&
      Math.abs(z - prev.z) < 0.005
    ) return;

    prevCamState.current = { x, y, z };

    const positions: Record<string, { x: number; y: number }> = {};
    for (const bone of bones) {
      tempVec.set(bone.position[0], bone.position[1], bone.position[2]);
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
// Each entry maps a bone ID to a panel side and zoom tier.
// "major" = shown when zoomed out; all shown when zoomed in.
interface ChartBoneSpec {
  /** ID as stored in skeletalParts (may include -L/-R suffix) */
  boneId: string;
  /** Which margin to anchor the label on */
  panel: "left" | "right";
  /** Show at all zoom levels (true) or only when zoomed in (false) */
  major: boolean;
}

const CHART_SPECS: ChartBoneSpec[] = [
  // ── LEFT MARGIN ── (bones on the body's left side)
  { boneId: "A02.1.02.001",      panel: "left",  major: true  }, // Skull / Frontal bone
  { boneId: "A02.1.02.301-L",    panel: "left",  major: false }, // Temporal (left)
  { boneId: "A02.4.01.001-L",    panel: "left",  major: true  }, // Clavicle (left)
  { boneId: "A02.4.01.002-L",    panel: "left",  major: false }, // Scapula (left)
  { boneId: "A02.4.02.001-L",    panel: "left",  major: true  }, // Humerus (left)
  { boneId: "A02.4.03.001-L",    panel: "left",  major: true  }, // Radius (left)
  { boneId: "A02.3.02.001-L",    panel: "left",  major: false }, // Rib 1 (left)
  { boneId: "A02.5.01.101-L",    panel: "left",  major: true  }, // Ilium (left)
  { boneId: "A02.5.02.001-L",    panel: "left",  major: true  }, // Femur (left)
  { boneId: "A02.5.02.002-L",    panel: "left",  major: false }, // Patella (left)
  { boneId: "A02.5.06.001-L",    panel: "left",  major: true  }, // Tibia (left)
  { boneId: "A02.5.10.001-L",    panel: "left",  major: false }, // Calcaneus (left)

  // ── RIGHT MARGIN ── (midline + body-right bones)
  { boneId: "A02.1.03.701",      panel: "right", major: true  }, // Mandible
  { boneId: "A02.1.00.027",      panel: "right", major: false }, // Hyoid
  { boneId: "A02.3.01.001",      panel: "right", major: true  }, // Sternum
  { boneId: "A02.2.02.001",      panel: "right", major: false }, // Atlas C1
  { boneId: "A02.2.02.301",      panel: "right", major: false }, // C7
  { boneId: "A02.2.03.001",      panel: "right", major: false }, // T1
  { boneId: "A02.2.04.003",      panel: "right", major: false }, // L3
  { boneId: "A02.2.05.001",      panel: "right", major: false }, // Sacrum
  { boneId: "A02.2.06.001",      panel: "right", major: false }, // Coccyx
  { boneId: "A02.4.03.002-L",    panel: "right", major: true  }, // Ulna (left)
  { boneId: "A02.5.06.002-L",    panel: "right", major: true  }, // Fibula (left)
  { boneId: "A02.5.10.002-L",    panel: "right", major: false }, // Talus (left)
];

// ── Anatomical Chart Overlay — outside Canvas ──────────────────────────────
// Renders CSS-anchored labels on left/right margins with SVG leader lines.
interface AnatomicalChartOverlayProps {
  projectedData: ProjectedPositions | null;
  containerWidth: number;
  containerHeight: number;
}

function AnatomicalChartOverlay({ projectedData, containerWidth, containerHeight }: AnatomicalChartOverlayProps) {
  if (!projectedData || containerWidth === 0 || containerHeight === 0) return null;

  const { positions, cameraZ } = projectedData;
  // Zoomed out when camera z is large; show only major labels
  const isZoomedOut = cameraZ > 8;

  // Resolve which bones to show based on zoom level
  const activeBones = useMemo(() => {
    const result: { bone: BonePart; spec: ChartBoneSpec }[] = [];
    for (const spec of CHART_SPECS) {
      if (isZoomedOut && !spec.major) continue;
      const bone = skeletalParts.find((b) => b.id === spec.boneId);
      if (bone && positions[bone.id]) {
        result.push({ bone, spec });
      }
    }
    return result;
  }, [isZoomedOut, positions]);

  const leftBones  = activeBones.filter((b) => b.spec.panel === "left");
  const rightBones = activeBones.filter((b) => b.spec.panel === "right");

  // Vertical distribution: evenly space labels across the usable height
  const MARGIN_TOP    = containerHeight * 0.06;
  const MARGIN_BOTTOM = containerHeight * 0.06;
  const usableH       = containerHeight - MARGIN_TOP - MARGIN_BOTTOM;

  const getY = (index: number, total: number) =>
    total <= 1
      ? containerHeight / 2
      : MARGIN_TOP + (index / (total - 1)) * usableH;

  const LABEL_MARGIN_X = 8; // px from screen edge to label box
  const LINE_COLOR     = "rgba(56,189,248,0.45)";
  const DOT_COLOR      = "rgba(14,165,233,0.9)";

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 5, overflow: "hidden" }}
    >
      {/* Full-viewport SVG for leader lines */}
      <svg
        width={containerWidth}
        height={containerHeight}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {/* Left panel leader lines */}
        {leftBones.map(({ bone }, i) => {
          const boneScreen = positions[bone.id];
          if (!boneScreen) return null;
          const labelY = getY(i, leftBones.length);
          const labelRight = LABEL_MARGIN_X + 160; // label box right edge (x=168)
          return (
            <g key={bone.id}>
              {/* Horizontal dashed line from label to bone projection */}
              <line
                x1={labelRight}
                y1={labelY}
                x2={boneScreen.x}
                y2={labelY}
                stroke={LINE_COLOR}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Diagonal connector from horizontal line end to bone position */}
              <line
                x1={boneScreen.x}
                y1={labelY}
                x2={boneScreen.x}
                y2={boneScreen.y}
                stroke={LINE_COLOR}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle cx={boneScreen.x} cy={boneScreen.y} r="3" fill={DOT_COLOR} />
            </g>
          );
        })}

        {/* Right panel leader lines */}
        {rightBones.map(({ bone }, i) => {
          const boneScreen = positions[bone.id];
          if (!boneScreen) return null;
          const labelY = getY(i, rightBones.length);
          const labelLeft = containerWidth - LABEL_MARGIN_X - 160; // label box left edge
          return (
            <g key={bone.id}>
              <line
                x1={labelLeft}
                y1={labelY}
                x2={boneScreen.x}
                y2={labelY}
                stroke={LINE_COLOR}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <line
                x1={boneScreen.x}
                y1={labelY}
                x2={boneScreen.x}
                y2={boneScreen.y}
                stroke={LINE_COLOR}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle cx={boneScreen.x} cy={boneScreen.y} r="3" fill={DOT_COLOR} />
            </g>
          );
        })}
      </svg>

      {/* Left margin labels */}
      {leftBones.map(({ bone }, i) => {
        const labelY = getY(i, leftBones.length);
        const displayName = bone.name.replace(/^(Left|Right)\s/, "");
        return (
          <div
            key={bone.id}
            style={{
              position: "absolute",
              left: LABEL_MARGIN_X,
              top: labelY,
              transform: "translateY(-50%)",
              maxWidth: 155,
              textAlign: "right",
              paddingRight: 6,
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: "clamp(9px, 1.8vw, 11px)",
                fontWeight: 600,
                color: "#e0f2fe",
                background: "rgba(8, 14, 30, 0.72)",
                padding: "2px 7px",
                borderRadius: 4,
                whiteSpace: "nowrap",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                border: "1px solid rgba(56,189,248,0.22)",
                lineHeight: 1.5,
                letterSpacing: "0.01em",
              }}
            >
              {displayName}
            </span>
          </div>
        );
      })}

      {/* Right margin labels */}
      {rightBones.map(({ bone }, i) => {
        const labelY = getY(i, rightBones.length);
        const displayName = bone.name.replace(/^(Left|Right)\s/, "");
        return (
          <div
            key={bone.id}
            style={{
              position: "absolute",
              right: LABEL_MARGIN_X,
              top: labelY,
              transform: "translateY(-50%)",
              maxWidth: 155,
              textAlign: "left",
              paddingLeft: 6,
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: "clamp(9px, 1.8vw, 11px)",
                fontWeight: 600,
                color: "#e0f2fe",
                background: "rgba(8, 14, 30, 0.72)",
                padding: "2px 7px",
                borderRadius: 4,
                whiteSpace: "nowrap",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                border: "1px solid rgba(56,189,248,0.22)",
                lineHeight: 1.5,
                letterSpacing: "0.01em",
              }}
            >
              {displayName}
            </span>
          </div>
        );
      })}

      {/* Zoom hint badge */}
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
          Pinch or scroll to zoom · Pan to explore
        </div>
      )}
    </div>
  );
}

// Resolve all chart bones once at module level for the tracker
const CHART_BONES: BonePart[] = CHART_SPECS.flatMap((spec) => {
  const bone = skeletalParts.find((b) => b.id === spec.boneId);
  return bone ? [bone] : [];
});

export function AnatomyScene({
  selectedPart, hoveredPart, onSelectPart, onHoverPart,
  onClearSelection, onOpenDrawer, drawerOpen, viewerMode,
}: AnatomySceneProps) {
  const isLabelled = viewerMode === "labelled";

  // Container size for the SVG overlay calculations
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

  // Projected positions — written by ChartBoneTracker inside Canvas,
  // read by AnatomicalChartOverlay outside Canvas.
  const [projectedData, setProjectedData] = useState<ProjectedPositions | null>(null);
  const handleProjectionUpdate = useCallback((data: ProjectedPositions) => {
    setProjectedData(data);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full" style={{ position: "relative" }}>
      <Canvas
        camera={{
          position: isLabelled ? [0, 0.65, 14] : [0, 0.65, 12],
          fov: 45,
        }}
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

          <Bounds fit clip observe margin={1.4}>
            <SkeletonViewer
              selectedPart={selectedPart}
              hoveredPart={hoveredPart}
              onSelectPart={onSelectPart}
              onHoverPart={onHoverPart}
              onClearSelection={onClearSelection}
              onOpenDrawer={onOpenDrawer}
              viewerMode={viewerMode}
            />

            {/* Project bone positions to screen space when in labelled mode */}
            {isLabelled && (
              <ChartBoneTracker
                bones={CHART_BONES}
                onUpdate={handleProjectionUpdate}
              />
            )}

            <AutoFramer selectedPart={selectedPart} />
          </Bounds>

          <ContactShadows position={[0, -2.9, 0]} opacity={0.25} scale={12} blur={3} far={5} color="#000820" />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            // In labelled mode: lock rotation to maintain front-facing anatomical position
            // In moveable mode: full rotation enabled
            enableRotate={!isLabelled}
            minDistance={1.5}
            maxDistance={22}
            target={[0, 0.65, 0]}
            makeDefault
          />

          <CameraController drawerOpen={drawerOpen} selectedPart={selectedPart} />
        </Suspense>
      </Canvas>

      {/* CSS-anchored anatomical chart labels overlay (labelled mode only) */}
      {isLabelled && (
        <AnatomicalChartOverlay
          projectedData={projectedData}
          containerWidth={containerSize.w}
          containerHeight={containerSize.h}
        />
      )}
    </div>
  );
}
