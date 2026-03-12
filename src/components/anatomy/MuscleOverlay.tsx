/**
 * MuscleOverlay.tsx — procedural 3-D muscle representations
 *
 * Renders each MusclePart as a semi-transparent ellipsoid (scaled SphereGeometry)
 * positioned at the centroid of its connected bones.  Because OrbitControls
 * rotates the camera (not individual objects), both the skeleton GLB and these
 * muscle blobs naturally rotate together in the same scene.
 *
 * Visual states (per-frame lerp — mirrors SkeletonViewer.tsx):
 *   SELECTED  → warm orange glow, emissiveIntensity 1.8, opacity 0.92
 *   HOVERED   → soft yellow tint, opacity 0.78
 *   GHOSTED   → opacity 0.07, dimmed (when another muscle is selected)
 *   DEFAULT   → muscle-red, opacity 0.55, transparent, no depthWrite
 *
 * Interaction:
 *   - Uses R3F's built-in event system (onClick / onPointerOver / onPointerOut)
 *     on each mesh, so muscle clicks are handled without touching SkeletonViewer's
 *     custom DOM raycaster.
 *   - Each mesh is tagged with userData.isMuscle = true and userData.muscleId so
 *     that SkeletonViewer can optionally detect and skip bone-fallback when a
 *     muscle mesh is the closest hit.
 *
 * Floating label:
 *   - A pill HTML overlay appears above the selected muscle (same style as
 *     SkeletonViewer's FloatingBoneLabel).
 */

import { useRef, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { type MusclePart } from "@/data/muscularSystem";

// ── Visual constants ──────────────────────────────────────────────────────
const SELECTED_COLOR    = new THREE.Color("#f39c12"); // warm orange
const SELECTED_EMISSIVE = new THREE.Color("#e67e22");
const HOVER_COLOR       = new THREE.Color("#f1c40f"); // yellow
const HOVER_EMISSIVE    = new THREE.Color("#d4a800");
const BLACK             = new THREE.Color("#000000");

interface MuscleOverlayProps {
  muscularParts: MusclePart[];
  selectedMuscle: MusclePart | null;
  hoveredMuscle: string | null;
  onSelectMuscle: (muscle: MusclePart) => void;
  onHoverMuscle: (id: string | null) => void;
  onClearSelection: () => void;
  onOpenDrawer: () => void;
}

// ── Per-muscle material entry ─────────────────────────────────────────────
interface MuscleMatEntry {
  mat: THREE.MeshStandardMaterial;
  originalColor: THREE.Color;
}

// ── Floating label (same pill style as SkeletonViewer) ───────────────────
function FloatingMuscleLabel({
  muscle,
  onOpenDrawer,
}: {
  muscle: MusclePart;
  onOpenDrawer: () => void;
}) {
  const pos: [number, number, number] = [
    muscle.position[0],
    muscle.position[1] + muscle.scale[1] + 0.4,
    muscle.position[2],
  ];
  return (
    <Html position={pos} center zIndexRange={[200, 100]}>
      <button
        onClick={(e) => { e.stopPropagation(); onOpenDrawer(); }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        style={{
          pointerEvents: "auto",
          padding: "4px 12px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#fff",
          background: "rgba(231, 76, 60, 0.90)",
          border: "1.5px solid rgba(252, 180, 180, 0.65)",
          boxShadow: "0 4px 18px rgba(231,76,60,0.45), 0 0 0 3px rgba(231,76,60,0.15)",
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          whiteSpace: "nowrap",
          userSelect: "none" as const,
          letterSpacing: "0.03em",
          lineHeight: 1.4,
          maxWidth: "200px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          transition: "transform 0.1s",
        }}
      >
        {muscle.name}
      </button>
    </Html>
  );
}

// ── Main overlay component ────────────────────────────────────────────────
export function MuscleOverlay({
  muscularParts,
  selectedMuscle,
  hoveredMuscle,
  onSelectMuscle,
  onHoverMuscle,
  onClearSelection,
  onOpenDrawer,
}: MuscleOverlayProps) {
  // Map: muscleId → { mat, originalColor }
  const matsRef = useRef<Map<string, MuscleMatEntry>>(new Map());

  // Register a material when a mesh mounts (via callback ref pattern)
  const registerMat = useCallback((muscleId: string, color: string, mat: THREE.MeshStandardMaterial | null) => {
    if (!mat) return;
    const existing = matsRef.current.get(muscleId);
    if (!existing) {
      matsRef.current.set(muscleId, { mat, originalColor: new THREE.Color(color) });
    }
  }, []);

  // ── Per-frame visual transitions (single pass over all muscles) ──────────
  useFrame(() => {
    const hasSelection = selectedMuscle !== null;
    const selectedId   = selectedMuscle?.id ?? null;

    matsRef.current.forEach(({ mat, originalColor }, muscleId) => {
      const isSelected = hasSelection && muscleId === selectedId;
      const isHovered  = !hasSelection && hoveredMuscle === muscleId;

      if (isSelected) {
        mat.color.lerp(SELECTED_COLOR, 0.35);
        mat.emissive.lerp(SELECTED_EMISSIVE, 0.35);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 1.8, 0.35);
        mat.opacity           = THREE.MathUtils.lerp(mat.opacity, 0.92, 0.35);
        mat.transparent = true;
        mat.depthWrite  = false;
      } else if (isHovered) {
        mat.color.lerp(HOVER_COLOR, 0.12);
        mat.emissive.lerp(HOVER_EMISSIVE, 0.12);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.5, 0.12);
        mat.opacity           = THREE.MathUtils.lerp(mat.opacity, 0.78, 0.12);
        mat.transparent = true;
        mat.depthWrite  = false;
      } else if (hasSelection) {
        // Ghost out everything else when a muscle is selected
        mat.color.lerp(originalColor.clone().multiplyScalar(0.3), 0.05);
        mat.emissive.lerp(BLACK, 0.05);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.05);
        mat.opacity           = THREE.MathUtils.lerp(mat.opacity, 0.07, 0.04);
        mat.transparent = true;
        mat.depthWrite  = false;
      } else {
        // Default: semi-transparent muscle red
        mat.color.lerp(originalColor, 0.06);
        mat.emissive.lerp(BLACK, 0.06);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.06);
        mat.opacity           = THREE.MathUtils.lerp(mat.opacity, 0.55, 0.06);
        mat.transparent = true;
        mat.depthWrite  = false;
      }
      mat.needsUpdate = true;
    });
  });

  // Memoised geometry — one sphere shared by all muscles via clone
  const sphereGeom = useMemo(() => new THREE.SphereGeometry(1, 10, 7), []);

  return (
    <group>
      {muscularParts.map((muscle) => (
        <MuscleMesh
          key={muscle.id}
          muscle={muscle}
          sphereGeom={sphereGeom}
          onRegisterMat={registerMat}
          onSelect={() => onSelectMuscle(muscle)}
          onHover={(h) => onHoverMuscle(h ? muscle.id : null)}
          onClearSelection={onClearSelection}
        />
      ))}
      {selectedMuscle && (
        <FloatingMuscleLabel muscle={selectedMuscle} onOpenDrawer={onOpenDrawer} />
      )}
    </group>
  );
}

// ── Individual mesh (keeps JSX clean, avoids inline function churn) ───────
function MuscleMesh({
  muscle,
  sphereGeom,
  onRegisterMat,
  onSelect,
  onHover,
  onClearSelection,
}: {
  muscle: MusclePart;
  sphereGeom: THREE.SphereGeometry;
  onRegisterMat: (id: string, color: string, mat: THREE.MeshStandardMaterial | null) => void;
  onSelect: () => void;
  onHover: (h: boolean) => void;
  onClearSelection: () => void;
}) {
  return (
    <mesh
      position={muscle.position}
      scale={muscle.scale}
      geometry={sphereGeom}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true); }}
      onPointerOut={() => onHover(false)}
      onPointerMissed={() => onClearSelection()}
      userData={{ isMuscle: true, muscleId: muscle.id }}
    >
      <meshStandardMaterial
        ref={(mat) => onRegisterMat(muscle.id, muscle.color, mat)}
        color={muscle.color}
        transparent
        opacity={0.55}
        roughness={0.85}
        metalness={0.0}
        depthWrite={false}
      />
    </mesh>
  );
}
