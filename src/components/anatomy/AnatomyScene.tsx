/**
 * AnatomyScene.tsx — 3D viewer hosting the Skeletal and Muscular systems
 *
 * Both systems share the same Three.js scene.  OrbitControls moves the camera
 * (not individual objects), so all meshes rotate together automatically — no
 * explicit wrapper group is needed for rotation sync.
 *
 * showMuscles=true (default) renders MuscleOverlay alongside SkeletonViewer.
 */

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Bounds, useBounds, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { SkeletonViewer } from "./SkeletonViewer";
import { MuscleOverlay } from "./MuscleOverlay";
import { BoneModel } from "./BoneModel";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";
import { muscularParts, type MusclePart } from "@/data/muscularSystem";

interface AnatomySceneProps {
  selectedPart: BonePart | null;
  hoveredPart: string | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
  onClearSelection: () => void;
  onOpenDrawer: () => void;
  drawerOpen: boolean;
  // Muscular system
  showMuscles: boolean;
  selectedMuscle: MusclePart | null;
  hoveredMuscle: string | null;
  onSelectMuscle: (muscle: MusclePart) => void;
  onHoverMuscle: (id: string | null) => void;
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

export function AnatomyScene({
  selectedPart, hoveredPart, onSelectPart, onHoverPart,
  onClearSelection, onOpenDrawer, drawerOpen,
  showMuscles, selectedMuscle, hoveredMuscle, onSelectMuscle, onHoverMuscle,
}: AnatomySceneProps) {
  return (
    <div className="w-full h-full" style={{ position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0.65, 12], fov: 45 }}
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
            {/* ── Skeletal system ─────────────────────────────────────── */}
            <SkeletonViewer
              selectedPart={selectedPart}
              hoveredPart={hoveredPart}
              onSelectPart={onSelectPart}
              onHoverPart={onHoverPart}
              onClearSelection={onClearSelection}
              onOpenDrawer={onOpenDrawer}
            />

            {/* ── Muscular system overlay ──────────────────────────────── */}
            {showMuscles && (
              <MuscleOverlay
                muscularParts={muscularParts}
                selectedMuscle={selectedMuscle}
                hoveredMuscle={hoveredMuscle}
                onSelectMuscle={onSelectMuscle}
                onHoverMuscle={onHoverMuscle}
                onClearSelection={onClearSelection}
                onOpenDrawer={onOpenDrawer}
              />
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
    </div>
  );
}
