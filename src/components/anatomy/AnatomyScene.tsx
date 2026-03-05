/**
 * AnatomyScene.tsx — Dual-mode 3D skeleton viewer
 * 
 * Moveable Mode: OrbitControls enabled, hover-highlight, no labels
 * Labelled Mode: Fixed camera, labels on bones, no rotation
 */

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Bounds, useBounds, ContactShadows, Html } from "@react-three/drei";
import { Suspense, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { SkeletonViewer } from "./SkeletonViewer";
import { BoneModel } from "./BoneModel";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";
import type { ViewerMode } from "@/pages/AnatomyViewer";

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

// ── Atlas labels for Labelled Mode ────────────────────────────────────────
function AtlasLabels() {
  // Show a subset of labels to avoid overcrowding — one per unique base bone
  const labelBones = useMemo(() => {
    // Pick only left-side or unpaired bones to reduce clutter
    return skeletalParts.filter((b) => !b.side || b.side === "left").slice(0, 40);
  }, []);

  return (
    <>
      {labelBones.map((bone) => (
        <Html
          key={bone.id}
          position={[bone.position[0], bone.position[1] + (bone.scale[1] * 0.5) + 0.15, bone.position[2]]}
          center
          zIndexRange={[150, 50]}
          style={{ pointerEvents: "none" }}
        >
          <div className="flex flex-col items-center" style={{ pointerEvents: "none" }}>
            <div
              style={{
                fontSize: "9px",
                fontWeight: 600,
                color: "#fff",
                background: "rgba(14,165,233,0.75)",
                padding: "1px 6px",
                borderRadius: "4px",
                whiteSpace: "nowrap",
                backdropFilter: "blur(4px)",
                lineHeight: 1.4,
              }}
            >
              {bone.name.replace(/^(Left|Right)\s/, "")}
            </div>
            <div
              style={{
                fontSize: "7px",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.6)",
                whiteSpace: "nowrap",
                marginTop: "1px",
              }}
            >
              {bone.latinName.replace(/\s*\(.*\)$/, "")}
            </div>
          </div>
        </Html>
      ))}
    </>
  );
}

export function AnatomyScene({
  selectedPart, hoveredPart, onSelectPart, onHoverPart,
  onClearSelection, onOpenDrawer, drawerOpen, viewerMode,
}: AnatomySceneProps) {
  const isLabelled = viewerMode === "labelled";

  return (
    <div className="w-full h-full">
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
            />
            {isLabelled && <AtlasLabels />}
            <AutoFramer selectedPart={selectedPart} />
          </Bounds>

          <ContactShadows position={[0, -2.9, 0]} opacity={0.25} scale={12} blur={3} far={5} color="#000820" />

          <OrbitControls
            enablePan={!isLabelled}
            enableZoom={!isLabelled}
            enableRotate={!isLabelled}
            minDistance={1.5}
            maxDistance={22}
            target={[0, 0.65, 0]}
            makeDefault
          />

          <CameraController drawerOpen={drawerOpen} selectedPart={selectedPart} />
        </Suspense>
      </Canvas>
    </div>
  );
}
