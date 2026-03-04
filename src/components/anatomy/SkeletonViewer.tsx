/**
 * SkeletonViewer.tsx
 *
 * Realistic human skeleton viewer that loads the organic skeleton.glb mesh
 * and applies atlas-based color coding to the organic bone surfaces.
 *
 * Replaces the ExplodedSkeletonAtlas placeholder geometry (BoxGeometry /
 * capsule / sphere primitives) with the actual professional-grade GLB model.
 *
 * Colour coding applied directly to GLB mesh surfaces (roughness 0.7):
 *   Cranium / Sphenoid → Light Blue    (#add8e6)
 *   Femur              → Solid Red     (#ff2424)
 *   Tibia              → Yellow        (#ffdd00)
 *   Fibula             → Green         (#22cc44)
 *   Humerus            → Orange        (#ff8c00)
 *   Thorax / Ribs      → Sandy Tan     (#d4a87a)
 *   Vertebral Column   → Warm Sand     (#dba870)
 *   … and all other atlas groups (see getAtlasColor below)
 *
 * For the merged-mesh skeleton.glb (sub01 = full skeleton, sub02 = thorax),
 * regional base colours are assigned to each sub-mesh so the organic shape
 * is readable at a glance; per-bone atlas colours are revealed on selection.
 *
 * Bone identification:
 *   Stage 1 — boneMap lookup (O(1), for per-bone-named GLB meshes)
 *   Stage 2 — position-based nearest-bone fallback (for merged meshes)
 *
 * Sphenoid label:
 *   Anchored to the computed top of the skull mesh bounding box rather than
 *   a floating point above a placeholder box.
 */

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";
import { boneMap } from "@/data/modelRegistry";

// ── Props ──────────────────────────────────────────────────────────────────────
interface SkeletonViewerProps {
  selectedPart: BonePart | null;
  hoveredPart: string | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
  onClearSelection: () => void;
  onOpenDrawer: () => void;
}

// ── Visual constants ──────────────────────────────────────────────────────────
const SELECTION_COLOR    = new THREE.Color("#00bfff"); // deep sky-blue — selected
const SELECTION_EMISSIVE = new THREE.Color("#0088cc");
const HOVER_COLOR        = new THREE.Color("#5eead4"); // soft teal — hover
const HOVER_EMISSIVE     = new THREE.Color("#2dd4bf");
const BLACK              = new THREE.Color("#000000");

// ── Type for material cache entry ─────────────────────────────────────────────
interface MatEntry {
  mat: THREE.MeshStandardMaterial;
  /** Atlas / regional colour for this mesh — restored when not highlighted */
  atlasColor: THREE.Color;
  meshName: string;
}

// ── Atlas colour by bone ID / region ──────────────────────────────────────────
// Applied to organic GLB mesh surfaces with MeshStandardMaterial roughness 0.7.
function getAtlasColor(boneId: string, region: string): THREE.Color {
  // ── Specific long-bone matches (highest priority) ─────────────────────────
  if (boneId.startsWith("femur"))    return new THREE.Color("#ff2424"); // Solid Red
  if (boneId.startsWith("tibia"))    return new THREE.Color("#ffdd00"); // Yellow
  if (boneId.startsWith("fibula"))   return new THREE.Color("#22cc44"); // Green
  if (boneId.startsWith("patella"))  return new THREE.Color("#ff6600"); // Orange
  if (boneId.startsWith("hipbone"))  return new THREE.Color("#9370db"); // Purple
  if (boneId.startsWith("humerus"))  return new THREE.Color("#ff8c00"); // Orange
  if (boneId.startsWith("radius"))   return new THREE.Color("#ff6040"); // Coral
  if (boneId.startsWith("ulna"))     return new THREE.Color("#e84830"); // Dark Coral
  if (boneId.startsWith("clavicle")) return new THREE.Color("#87ceeb"); // Sky Blue
  if (boneId.startsWith("scapula"))  return new THREE.Color("#4f94cd"); // Steel Blue

  // ── Axial specials ────────────────────────────────────────────────────────
  if (boneId === "sacrum")  return new THREE.Color("#b8860b");
  if (boneId === "coccyx")  return new THREE.Color("#9a7010");
  if (boneId === "sternum") return new THREE.Color("#d4c090");
  if (boneId === "hyoid")   return new THREE.Color("#88aacc");

  // ── Ear ossicles ──────────────────────────────────────────────────────────
  if (
    boneId.startsWith("malleus") ||
    boneId.startsWith("incus")   ||
    boneId.startsWith("stapes")
  ) return new THREE.Color("#ffd700");

  // ── Region-based fallback ─────────────────────────────────────────────────
  switch (region) {
    case "Cranium":            return new THREE.Color("#add8e6"); // Light Blue
    case "Face":               return new THREE.Color("#edddd0"); // Warm Ivory
    case "Ear Ossicles":       return new THREE.Color("#ffd700"); // Gold
    case "Axial":              return new THREE.Color("#88aacc");
    case "Vertebral Column":   return new THREE.Color("#dba870"); // Warm Sand
    case "Thorax":             return new THREE.Color("#d4a87a"); // Sandy Tan
    case "Pectoral Girdle":    return new THREE.Color("#87ceeb"); // Sky Blue
    case "Pelvic Girdle":      return new THREE.Color("#9370db"); // Purple
    case "Upper Limb":         return new THREE.Color("#ff8c00"); // Orange
    case "Wrist (Carpals)":    return new THREE.Color("#ffb3c6"); // Light Pink
    case "Hand (Metacarpals)": return new THREE.Color("#ff69b4"); // Hot Pink
    case "Hand (Phalanges)":   return new THREE.Color("#ff00cc"); // Magenta
    case "Lower Limb":         return new THREE.Color("#ff2424"); // Red
    case "Foot (Tarsals)":     return new THREE.Color("#00ccdd"); // Cyan
    case "Foot (Metatarsals)": return new THREE.Color("#00aaaa"); // Teal
    case "Foot (Phalanges)":   return new THREE.Color("#ff00cc"); // Magenta
    default:                   return new THREE.Color("#d4b896"); // Natural bone
  }
}

// ── Base colour for merged / un-named GLB sub-meshes ──────────────────────────
// skeleton.glb exports as merged groups: sub01 (full skeleton) and sub02 (ribs).
// These receive regional base colours so the organic shape reads clearly even
// before any bone is selected.
function getMeshBaseColor(meshName: string): THREE.Color {
  const lower = meshName.toLowerCase();

  if (lower === "sub02") return new THREE.Color("#d4a87a"); // thoracic cage — sandy tan
  if (lower === "sub01") return new THREE.Color("#d4b896"); // main skeleton — natural bone

  // Named per-bone mesh (e.g. "Femur_L") → full atlas colour
  const boneId = (boneMap as Record<string, string>)[meshName];
  if (boneId) {
    const bone = skeletalParts.find((b) => b.id === boneId);
    if (bone) return getAtlasColor(bone.id, bone.region);
  }

  return new THREE.Color("#d4b896"); // fallback — natural bone
}

// ── Stage 1 — boneMap lookup ──────────────────────────────────────────────────
function findBoneByMeshName(meshName: string): BonePart | null {
  const boneId = (boneMap as Record<string, string>)[meshName];
  if (!boneId) return null;
  return skeletalParts.find((b) => b.id === boneId) ?? null;
}

// ── Stage 2 — position-based nearest-bone fallback ────────────────────────────
// Used when the GLB mesh name is not in boneMap (merged-mesh models).
// Hit point is in world space; bone positions in skeletalSystem match world space.
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
      `[SkeletonViewer] Nearest: "${nearest.name}" (${nearest.id}) | dist: ${minDist.toFixed(3)} | world: (${worldPoint.x.toFixed(2)}, ${worldPoint.y.toFixed(2)}, ${worldPoint.z.toFixed(2)})`
    );
  }

  return nearest;
}

// ── Haptic feedback ───────────────────────────────────────────────────────────
function triggerHaptic() {
  try { if (navigator.vibrate) navigator.vibrate(10); } catch { /**/ }
}

// ── FloatingBoneLabel ─────────────────────────────────────────────────────────
// Pill button in world space that opens the info drawer on tap.
//
// Cranial bones (Sphenoid, Ethmoid, etc.) have their label anchored to the
// computed top of the skull mesh bounding box — not to a phantom box position.
// All other bones use their database position plus a vertical offset.
function FloatingBoneLabel({
  part,
  skullTopY,
  onOpenDrawer,
}: {
  part: BonePart;
  skullTopY: number | null;
  onOpenDrawer: () => void;
}) {
  const isCranial = part.region === "Cranium" || part.region === "Face";

  const worldPos: [number, number, number] = isCranial && skullTopY !== null
    // Anchor above the actual skull mesh top so the label sits on the organic shape
    ? [part.position[0], skullTopY + 0.3, part.position[2]]
    // Standard: bone position + half its scale height + margin
    : [part.position[0], part.position[1] + part.scale[1] * 0.5 + 0.55, part.position[2]];

  return (
    <Html position={worldPos} center zIndexRange={[200, 100]}>
      <button
        onClick={(e) => { e.stopPropagation(); onOpenDrawer(); }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
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
          userSelect: "none" as const,
          letterSpacing: "0.03em",
          lineHeight: 1.4,
          maxWidth: "200px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          transition: "transform 0.1s",
        }}
      >
        {part.name}
      </button>
    </Html>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SkeletonViewer
// ─────────────────────────────────────────────────────────────────────────────
export function SkeletonViewer({
  selectedPart,
  hoveredPart,
  onSelectPart,
  onHoverPart,
  onClearSelection,
  onOpenDrawer,
}: SkeletonViewerProps) {
  const { scene } = useGLTF("/models/skeleton.glb");
  const { gl, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  // Per-mesh material cache — uuid → MatEntry
  const materialsRef = useRef<Map<string, MatEntry>>(new Map());

  // UUID of the exact mesh hit by the last click / hover
  const clickedMeshUUIDRef = useRef<string | null>(null);
  const hoveredMeshUUIDRef = useRef<string | null>(null);

  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef     = useRef(new THREE.Vector2());

  const [ready, setReady] = useState(false);
  // Y coordinate of the skull mesh top (world space) — for label anchoring
  const [skullTopY, setSkullTopY] = useState<number | null>(null);

  // Stable callback refs to avoid stale closures in DOM event listeners
  const onSelectRef = useRef(onSelectPart);
  const onHoverRef  = useRef(onHoverPart);
  const onClearRef  = useRef(onClearSelection);
  useEffect(() => { onSelectRef.current = onSelectPart; },    [onSelectPart]);
  useEffect(() => { onHoverRef.current  = onHoverPart; },     [onHoverPart]);
  useEffect(() => { onClearRef.current  = onClearSelection; },[onClearSelection]);

  // ── Clone, normalise, and colour the GLB scene ──────────────────────────
  const preparedScene = useMemo(() => {
    const clone = scene.clone();

    // Scale the model to exactly 7 world units in its tallest axis so it fills
    // the viewport, then shift it so the pelvis sits near world-origin (y ≈ 0).
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

    // ── Assign atlas-coloured MeshStandardMaterial to every mesh ──────────
    // roughness 0.7 → realistic matte bone texture, not plastic
    const matsMap = new Map<string, MatEntry>();
    let highestY = -Infinity; // track skull top for label anchoring

    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;

      const atlasColor = getMeshBaseColor(mesh.name);
      const mat = new THREE.MeshStandardMaterial({
        color: atlasColor.clone(),
        roughness: 0.7,
        metalness: 0.02,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        side: THREE.DoubleSide,
      });
      mesh.material = mat;
      matsMap.set(mesh.uuid, { mat, atlasColor: atlasColor.clone(), meshName: mesh.name });

      // Track the world-space top of any mesh that extends into the skull region
      // (y > 3.0 in world space after the normalise transform above).
      const meshBox = new THREE.Box3().setFromObject(mesh);
      if (meshBox.max.y > highestY) highestY = meshBox.max.y;
    });

    materialsRef.current = matsMap;

    // Store skull top for cranial-bone label anchoring.
    // Using a small timeout so React state update occurs after the useMemo return.
    if (isFinite(highestY)) {
      setTimeout(() => setSkullTopY(highestY), 0);
    }

    return clone;
  }, [scene]);

  useEffect(() => { setReady(true); }, [preparedScene]);

  // ── Collect all Mesh objects for raycasting ────────────────────────────
  const meshesRef = useRef<THREE.Mesh[]>([]);
  useEffect(() => {
    const meshes: THREE.Mesh[] = [];
    preparedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
    });
    meshesRef.current = meshes;
  }, [preparedScene]);

  // ── Core raycast helper ────────────────────────────────────────────────
  const castRay = useCallback(
    (clientX: number, clientY: number): { mesh: THREE.Mesh; point: THREE.Vector3 } | null => {
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((clientX - rect.left) / rect.width)  *  2 - 1;
      mouseRef.current.y = -((clientY - rect.top)  / rect.height) *  2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const hits = raycasterRef.current.intersectObjects(meshesRef.current, true);
      if (!hits.length) return null;
      return { mesh: hits[0].object as THREE.Mesh, point: hits[0].point };
    },
    [gl, camera]
  );

  // ── Two-stage bone identification (click) ─────────────────────────────
  const identifyBone = useCallback(
    (clientX: number, clientY: number): BonePart | null => {
      const hit = castRay(clientX, clientY);
      if (!hit) return null;

      const { mesh: hitMesh, point: hitPoint } = hit;
      console.log(
        `[SkeletonViewer] Clicked mesh: "${hitMesh.name}"`,
        `| uuid: ${hitMesh.uuid}`,
        `| hit: (${hitPoint.x.toFixed(2)}, ${hitPoint.y.toFixed(2)}, ${hitPoint.z.toFixed(2)})`
      );

      clickedMeshUUIDRef.current = hitMesh.uuid;

      // Stage 1 — exact name lookup
      const byName = findBoneByMeshName(hitMesh.name);
      if (byName) return byName;

      // Stage 2 — nearest-bone by world-space distance
      return findNearestBone(hitPoint);
    },
    [castRay]
  );

  // ── Two-stage bone identification (hover) ──────────────────────────────
  const identifyHoveredBone = useCallback(
    (clientX: number, clientY: number): string | null => {
      const hit = castRay(clientX, clientY);
      if (!hit) { hoveredMeshUUIDRef.current = null; return null; }

      const { mesh: hitMesh, point: hitPoint } = hit;
      hoveredMeshUUIDRef.current = hitMesh.uuid;

      const boneId = (boneMap as Record<string, string>)[hitMesh.name];
      if (boneId) return boneId;

      return findNearestBone(hitPoint)?.id ?? null;
    },
    [castRay]
  );

  // ── DOM pointer event handlers ─────────────────────────────────────────
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
      // Tap: ≤ 400 ms, ≤ 15 px movement (mobile-thumb tolerant)
      if (dt < 400 && dx < 15 && dy < 15) {
        const bone = identifyBone(e.clientX, e.clientY);
        if (bone) {
          triggerHaptic();
          onSelectRef.current(bone);
        } else {
          clickedMeshUUIDRef.current = null;
          onClearRef.current();
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // hover is desktop-only
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

  useEffect(() => {
    if (!selectedPart) clickedMeshUUIDRef.current = null;
  }, [selectedPart]);

  // ── Per-frame material animation — Isolation Mode ─────────────────────
  //
  // SELECTED mesh  → deepskyblue emissive glow, opacity 1.0
  // HOVERED mesh   → subtle teal tint (desktop only)
  // ALL OTHER      → ghosted to opacity 0.1 when a selection is active
  // CLEAR (void)   → every mesh lerps back to its atlas colour, full opacity
  useFrame(() => {
    if (!preparedScene) return;

    const hasSelection = selectedPart !== null;
    const clickedUUID  = clickedMeshUUIDRef.current;
    const hoveredUUID  = hoveredMeshUUIDRef.current;

    materialsRef.current.forEach(({ mat, atlasColor }, meshUUID) => {
      const isSelected = hasSelection && meshUUID === clickedUUID;
      const isHovered  = !hasSelection && hoveredUUID === meshUUID;

      if (isSelected) {
        // ── SELECTED: persistent deepskyblue, emissiveIntensity 2.0 ──────
        mat.color.lerp(SELECTION_COLOR, 0.35);
        mat.emissive.lerp(SELECTION_EMISSIVE, 0.35);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 2.0, 0.35);
        mat.opacity    = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.35);
        mat.transparent = false;
        mat.depthWrite  = true;

      } else if (isHovered) {
        // ── HOVERED: subtle teal tint ─────────────────────────────────────
        mat.color.lerp(HOVER_COLOR, 0.1);
        mat.emissive.lerp(HOVER_EMISSIVE, 0.1);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.3, 0.1);
        mat.opacity    = THREE.MathUtils.lerp(mat.opacity, 0.95, 0.1);
        mat.transparent = false;
        mat.depthWrite  = true;

      } else if (hasSelection) {
        // ── GHOSTED: dim to 0.1 to isolate the selected bone ─────────────
        mat.color.lerp(atlasColor.clone().multiplyScalar(0.35), 0.05);
        mat.emissive.lerp(BLACK, 0.05);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.05);
        mat.opacity    = THREE.MathUtils.lerp(mat.opacity, 0.1, 0.04);
        mat.transparent = true;
        mat.depthWrite  = false;

      } else {
        // ── DEFAULT: full opacity, atlas colour restored ──────────────────
        mat.color.lerp(atlasColor, 0.06);
        mat.emissive.lerp(BLACK, 0.06);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.06);
        mat.opacity    = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.06);
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
          skullTopY={skullTopY}
          onOpenDrawer={onOpenDrawer}
        />
      )}
    </group>
  );
}

useGLTF.preload("/models/skeleton.glb");
