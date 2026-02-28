import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";

interface SkeletonModelProps {
  selectedPart: BonePart | null;
  hoveredPart: string | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
  onClearSelection: () => void;
  onOpenDrawer: () => void;
}

// Selection highlight color — persistent "blue glow"
const SELECTION_COLOR = new THREE.Color("#00bfff"); // deepskyblue
const SELECTION_EMISSIVE = new THREE.Color("#0088cc");
const HOVER_COLOR = new THREE.Color("#5eead4");
const HOVER_EMISSIVE = new THREE.Color("#2dd4bf");
const BLACK = new THREE.Color("#000000");

function findNearestBone(point: THREE.Vector3): BonePart | null {
  let nearest: BonePart | null = null;
  let minDist = Infinity;

  for (const bone of skeletalParts) {
    const bonePos = new THREE.Vector3(bone.position[0], bone.position[1], bone.position[2]);
    const dist = point.distanceTo(bonePos);
    if (dist < minDist) {
      minDist = dist;
      nearest = bone;
    }
  }

  // Forgiving hit radius — 5.0 units to handle small/mobile taps
  return minDist < 5.0 ? nearest : null;
}

function triggerHaptic() {
  try {
    if (navigator.vibrate) navigator.vibrate(10);
  } catch {
    // Haptic not supported, silent fail
  }
}

// ── Floating 3D label — Step 1 UI ────────────────────────────────────────────
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
  // Convert bone-data position (bone space) → world space
  const worldPos: [number, number, number] = [
    part.position[0] * transformScale + transformOffset.x,
    part.position[1] * transformScale + transformOffset.y + 0.55,
    part.position[2] * transformScale + transformOffset.z,
  ];

  return (
    <Html position={worldPos} center zIndexRange={[200, 100]}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenDrawer();
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
          boxShadow: "0 4px 18px rgba(14, 165, 233, 0.45), 0 0 0 3px rgba(14,165,233,0.15)",
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          whiteSpace: "nowrap",
          userSelect: "none",
          transition: "background 0.15s, transform 0.1s",
          letterSpacing: "0.03em",
          lineHeight: 1.4,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(14, 165, 233, 1)";
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(14, 165, 233, 0.88)";
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        {part.name}
      </button>
    </Html>
  );
}

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
  const materialsRef = useRef<Map<string, { mat: THREE.MeshStandardMaterial; original: THREE.Color }>>(new Map());
  const transformRef = useRef({ scale: 1, offset: new THREE.Vector3() });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const [ready, setReady] = useState(false);

  // Stable refs for callbacks
  const onSelectPartRef = useRef(onSelectPart);
  const onHoverPartRef = useRef(onHoverPart);
  const onClearSelectionRef = useRef(onClearSelection);
  useEffect(() => { onSelectPartRef.current = onSelectPart; }, [onSelectPart]);
  useEffect(() => { onHoverPartRef.current = onHoverPart; }, [onHoverPart]);
  useEffect(() => { onClearSelectionRef.current = onClearSelection; }, [onClearSelection]);

  // Prepare the scene once — deep traverse all child meshes
  const preparedScene = useMemo(() => {
    const clone = scene.clone();

    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetHeight = 7;
    const scaleFactor = targetHeight / maxDim;

    clone.scale.setScalar(scaleFactor);
    clone.position.set(
      -center.x * scaleFactor,
      -center.y * scaleFactor + targetHeight / 2 - 2.85,
      -center.z * scaleFactor
    );

    transformRef.current = {
      scale: scaleFactor,
      offset: new THREE.Vector3(
        -center.x * scaleFactor,
        -center.y * scaleFactor + targetHeight / 2 - 2.85,
        -center.z * scaleFactor
      ),
    };

    // Deep traverse — assign interactive materials to EVERY mesh
    const matsMap = new Map<string, { mat: THREE.MeshStandardMaterial; original: THREE.Color }>();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const originalMat = mesh.material;
        const baseColor =
          originalMat instanceof THREE.MeshStandardMaterial
            ? originalMat.color?.clone()
            : new THREE.Color("#d4b896");

        const mat = new THREE.MeshStandardMaterial({
          color: baseColor,
          roughness: 0.5,
          metalness: 0.05,
          transparent: true,
          opacity: 0.9,
          depthWrite: true,
          side: THREE.DoubleSide,
        });
        const origColor = mat.color.clone();
        mesh.material = mat;
        matsMap.set(mesh.uuid, { mat, original: origColor });
      }
    });
    materialsRef.current = matsMap;

    return clone;
  }, [scene]);

  useEffect(() => {
    setReady(true);
  }, [preparedScene]);

  const pointToBoneSpace = useCallback((point: THREE.Vector3) => {
    const { scale, offset } = transformRef.current;
    return point.clone().sub(offset).divideScalar(scale);
  }, []);

  // Collect ALL meshes recursively for raycasting — no bone ignored
  const meshesRef = useRef<THREE.Mesh[]>([]);
  useEffect(() => {
    if (!preparedScene) return;
    const meshes: THREE.Mesh[] = [];
    preparedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
    });
    meshesRef.current = meshes;
  }, [preparedScene]);

  // Manual raycasting — recursive intersection for full 206-bone coverage
  const doRaycast = useCallback((clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const intersects = raycasterRef.current.intersectObjects(meshesRef.current, true);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      const boneSpace = pointToBoneSpace(hitPoint);
      return findNearestBone(boneSpace);
    }
    return null;
  }, [gl, camera, pointToBoneSpace]);

  // Pointer/touch — gesture recognition (tap vs. drag)
  useEffect(() => {
    const canvas = gl.domElement;

    let pointerDownTime = 0;
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownTime = Date.now();
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dt = Date.now() - pointerDownTime;
      const dx = Math.abs(e.clientX - pointerDownPos.x);
      const dy = Math.abs(e.clientY - pointerDownPos.y);
      // Forgiving tap detection — 400ms window, 15px move tolerance for mobile thumbs
      if (dt < 400 && dx < 15 && dy < 15) {
        const bone = doRaycast(e.clientX, e.clientY);
        if (bone) {
          triggerHaptic();
          onSelectPartRef.current(bone);
        } else {
          // Tapped void — clear blue highlight and hide all labels/drawers
          onClearSelectionRef.current();
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      // Only track hover on non-touch devices
      if (e.pointerType === "touch") return;
      const bone = doRaycast(e.clientX, e.clientY);
      if (bone) {
        canvas.style.cursor = "pointer";
        onHoverPartRef.current(bone.id);
      } else {
        canvas.style.cursor = "default";
        onHoverPartRef.current(null);
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
    };
  }, [gl, doRaycast]);

  // Persistent highlight + ghosting — smooth lerp each frame
  useFrame(() => {
    if (!preparedScene) return;

    const hasSelection = selectedPart !== null;

    preparedScene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const entry = materialsRef.current.get(mesh.uuid);
      if (!entry) return;

      const { mat, original } = entry;
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const boneSpacePos = pointToBoneSpace(worldPos);
      const bone = findNearestBone(boneSpacePos);

      if (bone && selectedPart?.id === bone.id) {
        // ── SELECTED: Persistent deep sky blue — fast lerp for immediate feedback ──
        mat.color.lerp(SELECTION_COLOR, 0.35);
        mat.emissive.lerp(SELECTION_EMISSIVE, 0.35);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.75, 0.35);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.35);
      } else if (
        bone &&
        (hoveredPart === bone.id || (selectedPart?.connections.includes(bone.id) ?? false))
      ) {
        // ── HOVERED or CONNECTED: subtle teal ──
        mat.color.lerp(HOVER_COLOR, 0.08);
        mat.emissive.lerp(HOVER_EMISSIVE, 0.08);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.3, 0.08);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, hasSelection ? 0.45 : 0.95, 0.08);
      } else if (hasSelection) {
        // ── GHOSTED: visible but faded ──
        mat.color.lerp(original.clone().multiplyScalar(0.35), 0.05);
        mat.emissive.lerp(BLACK, 0.05);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.05);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.15, 0.04);
      } else {
        // ── DEFAULT: neutral bone ──
        mat.color.lerp(original, 0.06);
        mat.emissive.lerp(BLACK, 0.06);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.06);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.9, 0.06);
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
