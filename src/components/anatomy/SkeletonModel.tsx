/**
 * SkeletonModel.tsx
 *
 * Loads skeleton.glb and provides interactive bone identification using a
 * two-stage hybrid strategy:
 *
 *   Stage 1 – boneMap lookup  (per-bone GLB models)
 *     If the clicked Three.js mesh name is in modelRegistry.boneMap, return
 *     the mapped BonePart immediately (O(1), most accurate).
 *
 *   Stage 2 – position-based fallback  (merged-mesh GLB models)
 *     When the mesh name is NOT in boneMap (e.g. 'sub01', 'sub02' from
 *     skeleton.glb) use the 3-D world-space intersection point and find the
 *     nearest BonePart by Euclidean distance in bone-data space.
 *
 * Visual isolation rules (useFrame):
 *   SELECTED mesh  → emissive deepskyblue, emissiveIntensity 2.0, opacity 1.0
 *   HOVERED mesh   → subtle teal tint (desktop only)
 *   ALL OTHER      → ghosted to opacity 0.1, transparent: true
 *   CLEAR (void)   → all opacities lerp back to 1.0, no emissive
 */

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";
import { boneMap } from "@/data/modelRegistry";

// ── Props ─────────────────────────────────────────────────────────────────────
interface SkeletonModelProps {
  selectedPart: BonePart | null;
  hoveredPart: string | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
  onClearSelection: () => void;
  onOpenDrawer: () => void;
}

// ── Visual constants ──────────────────────────────────────────────────────────
const SELECTION_COLOR    = new THREE.Color("#00bfff"); // deepskyblue
const SELECTION_EMISSIVE = new THREE.Color("#0088cc");
const HOVER_COLOR        = new THREE.Color("#5eead4"); // teal
const HOVER_EMISSIVE     = new THREE.Color("#2dd4bf");
const BLACK              = new THREE.Color("#000000");

// ── Type for material cache entry ─────────────────────────────────────────────
interface MatEntry {
  mat: THREE.MeshStandardMaterial;
  original: THREE.Color;
  meshName: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 1 — boneMap lookup
// ─────────────────────────────────────────────────────────────────────────────
function findBoneByMeshName(meshName: string): BonePart | null {
  const boneId = (boneMap as Record<string, string>)[meshName];
  if (!boneId) return null;
  return skeletalParts.find((b) => b.id === boneId) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage 2 — position-based nearest-bone fallback
// Used for merged-mesh models (e.g. skeleton.glb 'sub01' / 'sub02').
//
// The hit point from intersects[0].point is in world space.
// Bone positions in skeletalSystem.ts ARE ALSO in world space (they match the
// normalised model coordinates: Y from -2.85 at the feet to +4.2 at the skull).
// So we compare the world-space hit point DIRECTLY against bone positions.
// ─────────────────────────────────────────────────────────────────────────────
function findNearestBone(worldPoint: THREE.Vector3): BonePart | null {
  let nearest: BonePart | null = null;
  let minDist = Infinity;

  for (const bone of skeletalParts) {
    const [bx, by, bz] = bone.position;
    // Weight Y heavily — anatomy is naturally indexed by height
    const dist = Math.hypot(
      (worldPoint.x - bx) * 0.6,
      (worldPoint.y - by) * 1.2,
      (worldPoint.z - bz) * 0.6
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = bone;
    }
  }

  if (nearest) {
    console.log(
      `[Anatomy] Nearest bone: "${nearest.name}" (id: ${nearest.id}) | dist: ${minDist.toFixed(3)} | world: (${worldPoint.x.toFixed(2)}, ${worldPoint.y.toFixed(2)}, ${worldPoint.z.toFixed(2)}) | bone: (${nearest.position.join(", ")})`
    );
  }

  return nearest;
}

// ── Haptic feedback ───────────────────────────────────────────────────────────
function triggerHaptic() {
  try { if (navigator.vibrate) navigator.vibrate(10); } catch { /**/ }
}

// ─────────────────────────────────────────────────────────────────────────────
// FloatingBoneLabel — Step 1 UI
// Renders a pill button in 3-D world space above the selected bone.
// Tapping it opens the InfoDrawer (Step 2).
// ─────────────────────────────────────────────────────────────────────────────
function FloatingBoneLabel({
  part,
  transformScale,
  transformOffset,
  onOpenDrawer,
}: {
  part: BonePart;
  transformScale: number;
  transformOffset: THREE.Vector3;
  onOpenDrawer: () => void;
}) {
  const worldPos: [number, number, number] = [
    part.position[0] * transformScale + transformOffset.x,
    part.position[1] * transformScale + transformOffset.y + 0.55,
    part.position[2] * transformScale + transformOffset.z,
  ];

  return (
    <Html position={worldPos} center zIndexRange={[200, 100]}>
      <button
        onClick={(e) => { e.stopPropagation(); onOpenDrawer(); }}
        style={{
          pointerEvents: "auto",
          padding: "4px 12px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#fff",
          background: "rgba(14, 165, 233, 0.88)",
          border: "1.5px solid rgba(125, 211, 252, 0.65)",
          boxShadow: "0 4px 18px rgba(14,165,233,0.45), 0 0 0 3px rgba(14,165,233,0.15)",
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          whiteSpace: "nowrap",
          userSelect: "none",
          letterSpacing: "0.03em",
          lineHeight: 1.4,
          maxWidth: "200px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          transition: "transform 0.1s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >
        {part.name}
      </button>
    </Html>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SkeletonModel
// ─────────────────────────────────────────────────────────────────────────────
export function SkeletonModel({
  selectedPart,
  hoveredPart,
  onSelectPart,
  onHoverPart,
  onClearSelection,
  onOpenDrawer,
}: SkeletonModelProps) {
  const { scene } = useGLTF("/models/skeleton.glb");
  const { gl, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  // Map<mesh.uuid, MatEntry> – material state for every mesh in the scene
  const materialsRef = useRef<Map<string, MatEntry>>(new Map());

  // Track the exact Three.js Mesh that was clicked/hovered (for UUID-based
  // highlighting — works correctly for merged-mesh models).
  const clickedMeshUUIDRef = useRef<string | null>(null);
  const hoveredMeshUUIDRef = useRef<string | null>(null);

  // Normalisation transform (scale + translation applied to the cloned scene)
  const transformRef = useRef({ scale: 1, offset: new THREE.Vector3() });

  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef     = useRef(new THREE.Vector2());
  const [ready, setReady] = useState(false);

  // Stable callback refs to avoid stale-closure bugs in event listeners
  const onSelectRef       = useRef(onSelectPart);
  const onHoverRef        = useRef(onHoverPart);
  const onClearRef        = useRef(onClearSelection);
  useEffect(() => { onSelectRef.current = onSelectPart; },    [onSelectPart]);
  useEffect(() => { onHoverRef.current  = onHoverPart; },     [onHoverPart]);
  useEffect(() => { onClearRef.current  = onClearSelection; },[onClearSelection]);

  // ── Clone and normalise the GLB scene once ──────────────────────────────
  const preparedScene = useMemo(() => {
    const clone = scene.clone();

    // Scale to 7-unit height so it fills the viewport
    const box    = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const s      = 7 / Math.max(size.x, size.y, size.z);
    clone.scale.setScalar(s);
    const offset = new THREE.Vector3(
      -center.x * s,
      -center.y * s + 7 / 2 - 2.85,
      -center.z * s
    );
    clone.position.copy(offset);
    transformRef.current = { scale: s, offset };

    // Assign a fresh interactive MeshStandardMaterial to every mesh
    const matsMap = new Map<string, MatEntry>();
    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;

      const srcMat = mesh.material;
      const baseColor =
        srcMat instanceof THREE.MeshStandardMaterial
          ? srcMat.color?.clone()
          : new THREE.Color("#d4b896");

      const mat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.5,
        metalness: 0.05,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        side: THREE.DoubleSide,
      });
      mesh.material = mat;
      matsMap.set(mesh.uuid, { mat, original: mat.color.clone(), meshName: mesh.name });
    });
    materialsRef.current = matsMap;
    return clone;
  }, [scene]);

  useEffect(() => { setReady(true); }, [preparedScene]);

  // ── Collect all Mesh objects for raycasting ──────────────────────────────
  const meshesRef = useRef<THREE.Mesh[]>([]);
  useEffect(() => {
    const meshes: THREE.Mesh[] = [];
    preparedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
    });
    meshesRef.current = meshes;
  }, [preparedScene]);

  // ── Core raycast helper ──────────────────────────────────────────────────
  const castRay = useCallback(
    (clientX: number, clientY: number): { mesh: THREE.Mesh; point: THREE.Vector3 } | null => {
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(meshesRef.current, true);
      if (!hits.length) return null;
      return { mesh: hits[0].object as THREE.Mesh, point: hits[0].point };
    },
    [gl, camera]
  );

  // ── Hybrid bone identification ────────────────────────────────────────────
  /**
   * Resolves a raycast hit to a BonePart using the two-stage strategy:
   *   1. boneMap lookup  (exact mesh name → bone ID)
   *   2. Position-based nearest-bone search  (3-D hit point)
   *
   * Also logs the raw mesh name to the console so developers can inspect
   * what the GLB calls each mesh and populate boneMap accordingly.
   */
  const identifyBone = useCallback(
    (clientX: number, clientY: number): BonePart | null => {
      const hit = castRay(clientX, clientY);
      if (!hit) return null;

      const { mesh: hitMesh, point: hitPoint } = hit;
      const meshName = hitMesh.name;

      // ── Mesh Name Inspection ──
      // Logs the exact GLB internal mesh name for every click.
      // Use this to populate boneMap in src/data/modelRegistry.js.
      console.log(
        `[Anatomy] Clicked mesh: "${meshName}"`,
        `| uuid: ${hitMesh.uuid}`,
        `| hit: (${hitPoint.x.toFixed(2)}, ${hitPoint.y.toFixed(2)}, ${hitPoint.z.toFixed(2)})`,
        hitMesh
      );

      // ── Stage 1: boneMap lookup ──────────────────────────────────────────
      const boneByName = findBoneByMeshName(meshName);
      if (boneByName) {
        clickedMeshUUIDRef.current = hitMesh.uuid;
        return boneByName;
      }

      // ── Stage 2: position-based fallback ────────────────────────────────
      // For merged-mesh models ('sub01', 'sub02') we use the world-space hit point
      // directly, since bone positions in skeletalSystem.ts are in world space.
      const nearestBone = findNearestBone(hitPoint);
      if (nearestBone) {
        clickedMeshUUIDRef.current = hitMesh.uuid;
        return nearestBone;
      }

      return null;
    },
    [castRay]
  );

  /**
   * Lightweight hover variant — same hybrid strategy, returns bone ID string.
   */
  const identifyHoveredBone = useCallback(
    (clientX: number, clientY: number): string | null => {
      const hit = castRay(clientX, clientY);
      if (!hit) { hoveredMeshUUIDRef.current = null; return null; }

      const { mesh: hitMesh, point: hitPoint } = hit;
      const meshName = hitMesh.name;
      hoveredMeshUUIDRef.current = hitMesh.uuid;

      // Stage 1
      const boneId = (boneMap as Record<string, string>)[meshName];
      if (boneId) return boneId;

      // Stage 2 — use world-space hit point directly
      const bone = findNearestBone(hitPoint);
      return bone?.id ?? null;
    },
    [castRay]
  );

  // ── Pointer event handlers ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = gl.domElement;
    let downTime = 0;
    let downX = 0, downY = 0;

    const onPointerDown = (e: PointerEvent) => {
      downTime = Date.now();
      downX = e.clientX; downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      const dt = Date.now() - downTime;
      const dx = Math.abs(e.clientX - downX);
      const dy = Math.abs(e.clientY - downY);
      // Tap: ≤ 400 ms, ≤ 15 px (tolerant for mobile thumbs)
      if (dt < 400 && dx < 15 && dy < 15) {
        const bone = identifyBone(e.clientX, e.clientY);
        if (bone) {
          triggerHaptic();
          onSelectRef.current(bone);
        } else {
          // Tapped the void — clear selection, restore all opacities
          clickedMeshUUIDRef.current = null;
          onClearRef.current();
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;   // hover is desktop-only
      const boneId = identifyHoveredBone(e.clientX, e.clientY);
      canvas.style.cursor = boneId ? "pointer" : "default";
      onHoverRef.current(boneId);
    };

    canvas.addEventListener("pointerdown",  onPointerDown);
    canvas.addEventListener("pointerup",    onPointerUp);
    canvas.addEventListener("pointermove",  onPointerMove);
    return () => {
      canvas.removeEventListener("pointerdown",  onPointerDown);
      canvas.removeEventListener("pointerup",    onPointerUp);
      canvas.removeEventListener("pointermove",  onPointerMove);
    };
  }, [gl, identifyBone, identifyHoveredBone]);

  // When the parent clears the selection, also clear our UUID ref
  useEffect(() => {
    if (!selectedPart) clickedMeshUUIDRef.current = null;
  }, [selectedPart]);

  // ── Per-frame material update — Isolation Mode ────────────────────────────
  //
  // Highlighting strategy:
  //   • UUID match  → the exact Three.js Mesh object that was clicked
  //     gets the blue glow.  Works for both merged-mesh and per-bone models.
  //   • All other meshes when a selection exists → ghosted to opacity 0.1.
  //   • No selection → everything returns to opacity 1.0.
  //
  // Smooth lerp transitions are applied every frame to avoid jarring snaps.
  useFrame(() => {
    if (!preparedScene) return;

    const hasSelection  = selectedPart !== null;
    const clickedUUID   = clickedMeshUUIDRef.current;
    const hoveredUUID   = hoveredMeshUUIDRef.current;

    materialsRef.current.forEach(({ mat, original }, meshUUID) => {
      const isSelected = hasSelection && meshUUID === clickedUUID;
      const isHovered  = !hasSelection && hoveredUUID === meshUUID;

      if (isSelected) {
        // ── SELECTED: persistent deep sky blue, emissive intensity 2 ──────
        mat.color.lerp(SELECTION_COLOR, 0.35);
        mat.emissive.lerp(SELECTION_EMISSIVE, 0.35);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 2.0, 0.35);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.35);
        mat.transparent = false;
        mat.depthWrite  = true;

      } else if (isHovered) {
        // ── HOVERED: subtle teal tint (desktop only) ─────────────────────
        mat.color.lerp(HOVER_COLOR, 0.1);
        mat.emissive.lerp(HOVER_EMISSIVE, 0.1);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.3, 0.1);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.95, 0.1);
        mat.transparent = false;
        mat.depthWrite  = true;

      } else if (hasSelection) {
        // ── GHOSTED: opacity 0.1, transparent: true ───────────────────────
        // "Ghosts out" everything except the selected bone
        mat.color.lerp(original.clone().multiplyScalar(0.35), 0.05);
        mat.emissive.lerp(BLACK, 0.05);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.05);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.1, 0.04);
        mat.transparent = true;
        mat.depthWrite  = false;

      } else {
        // ── DEFAULT: full opacity 1.0, no highlights ─────────────────────
        // Void tap clears clickedMeshUUIDRef and hasSelection becomes false,
        // so all meshes converge here and lerp back to full opacity.
        mat.color.lerp(original, 0.06);
        mat.emissive.lerp(BLACK, 0.06);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.06);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.06);
        mat.transparent = false;
        mat.depthWrite  = true;
      }
    });
  });

  if (!ready) return null;

  return (
    <group ref={groupRef}>
      <primitive object={preparedScene} />
      {selectedPart && (
        <FloatingBoneLabel
          part={selectedPart}
          transformScale={transformRef.current.scale}
          transformOffset={transformRef.current.offset}
          onOpenDrawer={onOpenDrawer}
        />
      )}
    </group>
  );
}

useGLTF.preload("/models/skeleton.glb");
