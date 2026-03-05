/**
 * SkeletonViewer.tsx — Loads skeleton.glb with TA98-based bone identification
 */

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";
import type { ViewerMode } from "@/contexts/ViewModeContext";
import { boneMap } from "@/data/modelRegistry";

interface SkeletonViewerProps {
  selectedPart: BonePart | null;
  hoveredPart: string | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
  onClearSelection: () => void;
  onOpenDrawer: () => void;
  viewerMode?: ViewerMode;
}

const SELECTION_COLOR    = new THREE.Color("#00bfff");
const SELECTION_EMISSIVE = new THREE.Color("#0088cc");
const HOVER_COLOR        = new THREE.Color("#5eead4");
const HOVER_EMISSIVE     = new THREE.Color("#2dd4bf");
const BLACK              = new THREE.Color("#000000");

interface MatEntry {
  mat: THREE.MeshStandardMaterial;
  atlasColor: THREE.Color;
  meshName: string;
}

function getAtlasColor(boneId: string, region: string): THREE.Color {
  if (boneId.includes("A02.5.02.001")) return new THREE.Color("#ff2424"); // Femur
  if (boneId.includes("A02.5.06.001")) return new THREE.Color("#ffdd00"); // Tibia
  if (boneId.includes("A02.5.06.002")) return new THREE.Color("#22cc44"); // Fibula
  if (boneId.includes("A02.5.02.002")) return new THREE.Color("#ff6600"); // Patella
  if (boneId.includes("A02.4.02.001")) return new THREE.Color("#ff8c00"); // Humerus
  if (boneId.includes("A02.4.03.001")) return new THREE.Color("#ff6040"); // Radius
  if (boneId.includes("A02.4.03.002")) return new THREE.Color("#e84830"); // Ulna
  if (boneId.includes("A02.4.01.001")) return new THREE.Color("#87ceeb"); // Clavicle
  if (boneId.includes("A02.4.01.002")) return new THREE.Color("#4f94cd"); // Scapula
  if (boneId.includes("A02.2.05.001")) return new THREE.Color("#b8860b"); // Sacrum
  if (boneId.includes("A02.2.06.001")) return new THREE.Color("#9a7010"); // Coccyx
  if (boneId.includes("A02.3.01.001")) return new THREE.Color("#d4c090"); // Sternum

  switch (region) {
    case "Skull": return new THREE.Color("#add8e6");
    case "Vertebral column": return new THREE.Color("#dba870");
    case "Thoracic cage": return new THREE.Color("#d4a87a");
    case "Upper limb": return new THREE.Color("#ff8c00");
    case "Lower limb": return new THREE.Color("#ff2424");
    default: return new THREE.Color("#d4b896");
  }
}

function getMeshBaseColor(meshName: string): THREE.Color {
  const lower = meshName.toLowerCase();
  if (lower === "sub02") return new THREE.Color("#d4a87a");
  if (lower === "sub01") return new THREE.Color("#d4b896");

  const boneId = (boneMap as Record<string, string>)[meshName];
  if (boneId) {
    const bone = skeletalParts.find((b) => b.id === boneId);
    if (bone) return getAtlasColor(bone.id, bone.region);
  }
  return new THREE.Color("#d4b896");
}

function findBoneByMeshName(meshName: string): BonePart | null {
  const boneId = (boneMap as Record<string, string>)[meshName];
  if (!boneId) return null;
  return skeletalParts.find((b) => b.id === boneId) ?? null;
}

function findNearestBone(worldPoint: THREE.Vector3): BonePart | null {
  let nearest: BonePart | null = null;
  let minDist = Infinity;

  for (const bone of skeletalParts) {
    const [bx, by, bz] = bone.position;
    const dist = Math.hypot(
      (worldPoint.x - bx) * 0.6,
      (worldPoint.y - by) * 1.2,
      (worldPoint.z - bz) * 0.6
    );
    if (dist < minDist) { minDist = dist; nearest = bone; }
  }
  return nearest;
}

function triggerHaptic() {
  try { if (navigator.vibrate) navigator.vibrate(10); } catch { /**/ }
}

function FloatingBoneLabel({ part, skullTopY, onOpenDrawer }: {
  part: BonePart; skullTopY: number | null; onOpenDrawer: () => void;
}) {
  const isCranial = part.region === "Skull";
  const worldPos: [number, number, number] = isCranial && skullTopY !== null
    ? [part.position[0], skullTopY + 0.3, part.position[2]]
    : [part.position[0], part.position[1] + part.scale[1] * 0.5 + 0.55, part.position[2]];

  return (
    <Html position={worldPos} center zIndexRange={[200, 100]}>
      <button
        onClick={(e) => { e.stopPropagation(); onOpenDrawer(); }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
        style={{
          pointerEvents: "auto", padding: "4px 12px", borderRadius: "999px",
          fontSize: "11px", fontWeight: 700, color: "#fff",
          background: "rgba(14, 165, 233, 0.88)",
          border: "1.5px solid rgba(125, 211, 252, 0.65)",
          boxShadow: "0 4px 18px rgba(14,165,233,0.45), 0 0 0 3px rgba(14,165,233,0.15)",
          backdropFilter: "blur(8px)", cursor: "pointer", whiteSpace: "nowrap",
          userSelect: "none" as const, letterSpacing: "0.03em", lineHeight: 1.4,
          maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", transition: "transform 0.1s",
        }}
      >
        {part.name}
      </button>
    </Html>
  );
}

export function SkeletonViewer({
  selectedPart, hoveredPart, onSelectPart, onHoverPart, onClearSelection, onOpenDrawer, viewerMode = "moveable",
}: SkeletonViewerProps) {
  const { scene } = useGLTF("/models/skeleton.glb");
  const { gl, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<Map<string, MatEntry>>(new Map());
  const clickedMeshUUIDRef = useRef<string | null>(null);
  const hoveredMeshUUIDRef = useRef<string | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const [ready, setReady] = useState(false);
  const [skullTopY, setSkullTopY] = useState<number | null>(null);

  const onSelectRef = useRef(onSelectPart);
  const onHoverRef = useRef(onHoverPart);
  const onClearRef = useRef(onClearSelection);
  useEffect(() => { onSelectRef.current = onSelectPart; }, [onSelectPart]);
  useEffect(() => { onHoverRef.current = onHoverPart; }, [onHoverPart]);
  useEffect(() => { onClearRef.current = onClearSelection; }, [onClearSelection]);

  const preparedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const s = 7 / Math.max(size.x, size.y, size.z);
    clone.scale.setScalar(s);
    clone.position.set(-center.x * s, -center.y * s + 7 / 2 - 2.85, -center.z * s);

    const matsMap = new Map<string, MatEntry>();
    let highestY = -Infinity;

    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const atlasColor = getMeshBaseColor(mesh.name);
      const mat = new THREE.MeshStandardMaterial({
        color: atlasColor.clone(), roughness: 0.7, metalness: 0.02,
        transparent: false, opacity: 1.0, depthWrite: true, side: THREE.DoubleSide,
      });
      mesh.material = mat;
      matsMap.set(mesh.uuid, { mat, atlasColor: atlasColor.clone(), meshName: mesh.name });
      const meshBox = new THREE.Box3().setFromObject(mesh);
      if (meshBox.max.y > highestY) highestY = meshBox.max.y;
    });

    materialsRef.current = matsMap;
    if (isFinite(highestY)) setTimeout(() => setSkullTopY(highestY), 0);
    return clone;
  }, [scene]);

  useEffect(() => { setReady(true); }, [preparedScene]);

  const meshesRef = useRef<THREE.Mesh[]>([]);
  useEffect(() => {
    const meshes: THREE.Mesh[] = [];
    preparedScene.traverse((child) => { if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh); });
    meshesRef.current = meshes;
  }, [preparedScene]);

  const castRay = useCallback((clientX: number, clientY: number): { mesh: THREE.Mesh; point: THREE.Vector3 } | null => {
    const rect = gl.domElement.getBoundingClientRect();
    mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const hits = raycasterRef.current.intersectObjects(meshesRef.current, true);
    if (!hits.length) return null;
    return { mesh: hits[0].object as THREE.Mesh, point: hits[0].point };
  }, [gl, camera]);

  const identifyBone = useCallback((clientX: number, clientY: number): BonePart | null => {
    const hit = castRay(clientX, clientY);
    if (!hit) return null;
    clickedMeshUUIDRef.current = hit.mesh.uuid;
    const byName = findBoneByMeshName(hit.mesh.name);
    if (byName) return byName;
    return findNearestBone(hit.point);
  }, [castRay]);

  const identifyHoveredBone = useCallback((clientX: number, clientY: number): string | null => {
    const hit = castRay(clientX, clientY);
    if (!hit) { hoveredMeshUUIDRef.current = null; return null; }
    hoveredMeshUUIDRef.current = hit.mesh.uuid;
    const boneId = (boneMap as Record<string, string>)[hit.mesh.name];
    if (boneId) return boneId;
    return findNearestBone(hit.point)?.id ?? null;
  }, [castRay]);

  useEffect(() => {
    const canvas = gl.domElement;
    let downTime = 0, downX = 0, downY = 0;

    const onPointerDown = (e: PointerEvent) => { downTime = Date.now(); downX = e.clientX; downY = e.clientY; };
    const onPointerUp = (e: PointerEvent) => {
      if (Date.now() - downTime < 400 && Math.abs(e.clientX - downX) < 15 && Math.abs(e.clientY - downY) < 15) {
        const bone = identifyBone(e.clientX, e.clientY);
        if (bone) { triggerHaptic(); onSelectRef.current(bone); }
        else { clickedMeshUUIDRef.current = null; onClearRef.current(); }
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const boneId = identifyHoveredBone(e.clientX, e.clientY);
      canvas.style.cursor = boneId ? "pointer" : "default";
      onHoverRef.current(boneId);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
    };
  }, [gl, identifyBone, identifyHoveredBone]);

  useEffect(() => { if (!selectedPart) clickedMeshUUIDRef.current = null; }, [selectedPart]);

  useFrame(() => {
    if (!preparedScene) return;
    const hasSelection = selectedPart !== null;
    const clickedUUID = clickedMeshUUIDRef.current;
    const hoveredUUID = hoveredMeshUUIDRef.current;

    materialsRef.current.forEach(({ mat, atlasColor }, meshUUID) => {
      const isSelected = hasSelection && meshUUID === clickedUUID;
      const isHovered = !hasSelection && hoveredUUID === meshUUID;

      if (isSelected) {
        mat.color.lerp(SELECTION_COLOR, 0.35);
        mat.emissive.lerp(SELECTION_EMISSIVE, 0.35);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 2.0, 0.35);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.35);
        mat.transparent = false; mat.depthWrite = true;
      } else if (isHovered) {
        mat.color.lerp(HOVER_COLOR, 0.1);
        mat.emissive.lerp(HOVER_EMISSIVE, 0.1);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.3, 0.1);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.95, 0.1);
        mat.transparent = false; mat.depthWrite = true;
      } else if (hasSelection) {
        mat.color.lerp(atlasColor.clone().multiplyScalar(0.35), 0.05);
        mat.emissive.lerp(BLACK, 0.05);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.05);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.1, 0.04);
        mat.transparent = true; mat.depthWrite = false;
      } else {
        mat.color.lerp(atlasColor, 0.06);
        mat.emissive.lerp(BLACK, 0.06);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.06);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.06);
        mat.transparent = false; mat.depthWrite = true;
      }
    });
  });

  if (!ready) return null;

  return (
    <group ref={groupRef}>
      <primitive object={preparedScene} />
      {selectedPart && viewerMode === "moveable" && (
        <FloatingBoneLabel part={selectedPart} skullTopY={skullTopY} onOpenDrawer={onOpenDrawer} />
      )}
    </group>
  );
}

useGLTF.preload("/models/skeleton.glb");
