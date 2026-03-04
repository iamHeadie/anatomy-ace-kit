/**
 * AnatomyScene.tsx
 *
 * Scene Environment:
 *   • Background  — dark, slightly slate-textured matte finish (#171720)
 *     achieved via scene.background colour + subtle background plane.
 *   • Lighting    — professional three-point system:
 *       Key   warm white  (#fff8e7 / 1.4)  — upper-left-front primary
 *       Fill  cool blue   (#c8d8ff / 0.45) — right-side shadow softener
 *       Back  warm rim    (#ffe0a0 / 0.6)  — upper-rear silhouette accent
 *       Ambient            (#d0d8e8 / 0.18) — global bounce
 *       Teal accent point  (#14b8a6 / 0.35) — app-brand accent near model
 *
 * 3D Model:
 *   SkeletonViewer loads the real skeleton.glb organic mesh and applies
 *   atlas-based colour coding to each bone group surface (Femur → Red,
 *   Tibia → Yellow, Cranium → Light Blue, etc.) using MeshStandardMaterial
 *   roughness 0.7. Replaces the placeholder ExplodedSkeletonAtlas geometry.
 *
 * Quiz Mode:
 *   Hovering any bone causes every bone in the same anatomical region to
 *   pulse with the app's teal (#14b8a6) glow — matching the UI accent colour.
 */

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Bounds, useBounds, ContactShadows } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";
import { SkeletonViewer } from "./SkeletonViewer";
import { BoneModel } from "./BoneModel";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";

interface AnatomySceneProps {
  selectedPart: BonePart | null;
  hoveredPart: string | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
  onClearSelection: () => void;
  onOpenDrawer: () => void;
  drawerOpen: boolean;
}

// ── Dark slate background applied to the Three.js scene ───────────────────────
const SLATE_BG = new THREE.Color("#171720");

function SceneBackground() {
  const { scene, gl } = useThree();
  useEffect(() => {
    scene.background = SLATE_BG;
    gl.setClearColor(SLATE_BG, 1);
    return () => {
      scene.background = null;
    };
  }, [scene, gl]);
  return null;
}

// ── Fallback primitive skeleton shown during Suspense loading ─────────────────
function PrimitiveSkeletonGroup({
  selectedPart,
  hoveredPart,
  onSelectPart,
  onHoverPart,
}: Pick<AnatomySceneProps, "selectedPart" | "hoveredPart" | "onSelectPart" | "onHoverPart">) {
  return (
    <group position={[0, 0, 0]}>
      {skeletalParts.map((bone) => (
        <BoneModel
          key={bone.id}
          bone={bone}
          isSelected={selectedPart?.id === bone.id}
          isHighlighted={
            hoveredPart === bone.id ||
            (selectedPart?.connections.includes(bone.id) ?? false)
          }
          onClick={() => onSelectPart(bone)}
          onHover={(h) => onHoverPart(h ? bone.id : null)}
        />
      ))}
    </group>
  );
}

// ── Camera controller — shifts orbit target when the study drawer opens ───────
function CameraController({
  drawerOpen,
  selectedPart,
}: {
  drawerOpen: boolean;
  selectedPart: BonePart | null;
}) {
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

// ── Auto-framing — re-fits the camera when selected part changes ──────────────
function AutoFramer({ selectedPart }: { selectedPart: BonePart | null }) {
  const bounds     = useBounds();
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

// ─────────────────────────────────────────────────────────────────────────────
// AnatomyScene
// ─────────────────────────────────────────────────────────────────────────────
export function AnatomyScene({
  selectedPart,
  hoveredPart,
  onSelectPart,
  onHoverPart,
  onClearSelection,
  onOpenDrawer,
  drawerOpen,
}: AnatomySceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.65, 12], fov: 45 }}
        dpr={[1, 2]}
        style={{ touchAction: "none", background: "#171720" }}
      >
        {/* Set Three.js scene background to dark slate */}
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
          {/* ── Three-Point Medical Lighting ─────────────────────────────── */}

          {/* Global ambient — very dim, prevents pitch-black shadows */}
          <ambientLight color="#d0d8e8" intensity={0.18} />

          {/* KEY LIGHT — warm white, primary illumination from upper-left-front */}
          <directionalLight
            position={[-4, 7, 5]}
            intensity={1.4}
            color="#fff8e7"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          {/* FILL LIGHT — cool blue, opposite side, softens shadows */}
          <directionalLight
            position={[5, 3, -3]}
            intensity={0.45}
            color="#c8d8ff"
          />

          {/* BACK / RIM LIGHT — warm, rear-upper, creates silhouette separation */}
          <directionalLight
            position={[0, 6, -8]}
            intensity={0.6}
            color="#ffe0a0"
          />

          {/* ACCENT — teal point light near model centre (brand colour) */}
          <pointLight
            position={[0, 2, 3]}
            intensity={0.35}
            color="#14b8a6"
            distance={12}
            decay={2}
          />

          {/* ── Realistic Skeleton (organic GLB mesh, atlas colour-coded) ─── */}
          <Bounds fit clip observe margin={1.4}>
            <SkeletonViewer
              selectedPart={selectedPart}
              hoveredPart={hoveredPart}
              onSelectPart={onSelectPart}
              onHoverPart={onHoverPart}
              onClearSelection={onClearSelection}
              onOpenDrawer={onOpenDrawer}
            />
            <AutoFramer selectedPart={selectedPart} />
          </Bounds>

          {/* Subtle ground shadow for depth cues */}
          <ContactShadows
            position={[0, -2.9, 0]}
            opacity={0.25}
            scale={12}
            blur={3}
            far={5}
            color="#000820"
          />

          {/* ── Controls ─────────────────────────────────────────────────── */}
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
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
