import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";
import { boneMap } from "@/data/modelRegistry";

interface SkeletonModelProps {
  selectedPart: BonePart | null;
  hoveredPart: string | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
  onClearSelection: () => void;
  onOpenDrawer: () => void;
}

// ── Visual constants ──────────────────────────────────────────────────────────
// SELECTED: persistent "deep sky blue" glow as specified
const SELECTION_COLOR    = new THREE.Color("#00bfff"); // deepskyblue
const SELECTION_EMISSIVE = new THREE.Color("#0088cc");
// HOVERED / CONNECTED: subtle teal
const HOVER_COLOR        = new THREE.Color("#5eead4");
const HOVER_EMISSIVE     = new THREE.Color("#2dd4bf");
const BLACK              = new THREE.Color("#000000");

// ── Bone lookup helpers ───────────────────────────────────────────────────────

/**
 * Resolve a GLB mesh name → BonePart using the boneMap registry.
 * Returns the matched BonePart when found.
 */
function findBoneByMeshName(meshName: string): BonePart | null {
  const boneId = (boneMap as Record<string, string>)[meshName];
  if (!boneId) return null;
  return skeletalParts.find((b) => b.id === boneId) ?? null;
}

/**
 * Create a synthetic BonePart for meshes that are not yet in boneMap.
 * The floating label will display "Unknown Bone — <MeshName>" so the developer
 * can identify the mesh and add it to modelRegistry.js.
 */
function makeUnknownBone(meshName: string): BonePart {
  return {
    id: `unknown-${meshName}`,
    name: `Unknown Bone — ${meshName}`,
    latinName: "",
    system: "Skeletal",
    region: "Unidentified",
    description: `Mesh "${meshName}" has not been mapped yet. Check the browser console for the log line "[Anatomy] Clicked mesh: …" and add the correct entry to src/data/modelRegistry.js.`,
    position: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#d4b896",
    facts: [
      `Internal GLB mesh name: "${meshName}"`,
      "Add this mesh name → bone ID mapping to src/data/modelRegistry.js",
    ],
    connections: [],
  };
}

/**
 * Is this mesh the currently selected bone?
 * Handles both mapped bones (via boneMap ID) and unmapped "unknown" bones
 * (matched by raw mesh name stored in the synthetic ID).
 */
function isMeshSelected(meshName: string, selectedPart: BonePart | null): boolean {
  if (!selectedPart) return false;
  const mappedId = (boneMap as Record<string, string>)[meshName];
  if (mappedId) return mappedId === selectedPart.id;
  // Unknown bone — ID is `unknown-<meshName>`
  if (selectedPart.id.startsWith("unknown-")) {
    return meshName === selectedPart.id.slice("unknown-".length);
  }
  return false;
}

function triggerHaptic() {
  try {
    if (navigator.vibrate) navigator.vibrate(10);
  } catch {
    // Haptic not supported
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
  // Convert bone-data position (bone-data space) → world space
  const worldPos: [number, number, number] = [
    part.position[0] * transformScale + transformOffset.x,
    part.position[1] * transformScale + transformOffset.y + 0.55,
    part.position[2] * transformScale + transformOffset.z,
  ];

  const isUnknown = part.id.startsWith("unknown-");

  return (
    <Html position={worldPos} center zIndexRange={[200, 100]}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Unknown bones still open the drawer — shows the "not mapped" helper text
          onOpenDrawer();
        }}
        style={{
          pointerEvents: "auto",
          padding: "4px 12px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#fff",
          background: isUnknown
            ? "rgba(239, 68, 68, 0.75)"   // red tint for unknown bones
            : "rgba(14, 165, 233, 0.88)",  // sky blue for known bones
          border: isUnknown
            ? "1.5px solid rgba(252, 165, 165, 0.65)"
            : "1.5px solid rgba(125, 211, 252, 0.65)",
          boxShadow: isUnknown
            ? "0 4px 18px rgba(239, 68, 68, 0.35)"
            : "0 4px 18px rgba(14, 165, 233, 0.45), 0 0 0 3px rgba(14,165,233,0.15)",
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          whiteSpace: "nowrap",
          userSelect: "none",
          transition: "background 0.15s, transform 0.1s",
          letterSpacing: "0.03em",
          lineHeight: 1.4,
          maxWidth: "180px",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        }}
      >
        {part.name}
      </button>
    </Html>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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
  const materialsRef = useRef<
    Map<string, { mat: THREE.MeshStandardMaterial; original: THREE.Color; meshName: string }>
  >(new Map());
  const transformRef = useRef({ scale: 1, offset: new THREE.Vector3() });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const [ready, setReady] = useState(false);

  // Stable callback refs — avoids stale closures in event listeners
  const onSelectPartRef = useRef(onSelectPart);
  const onHoverPartRef = useRef(onHoverPart);
  const onClearSelectionRef = useRef(onClearSelection);
  useEffect(() => { onSelectPartRef.current = onSelectPart; }, [onSelectPart]);
  useEffect(() => { onHoverPartRef.current = onHoverPart; }, [onHoverPart]);
  useEffect(() => { onClearSelectionRef.current = onClearSelection; }, [onClearSelection]);

  // ── Prepare the cloned scene once ──────────────────────────────────────────
  const preparedScene = useMemo(() => {
    const clone = scene.clone();

    // Normalise height to 7 units so the skeleton fills the viewport
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

    // Deep traverse — assign fresh interactive MeshStandardMaterial to every mesh
    const matsMap = new Map<
      string,
      { mat: THREE.MeshStandardMaterial; original: THREE.Color; meshName: string }
    >();

    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
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
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        side: THREE.DoubleSide,
      });
      const origColor = mat.color.clone();
      mesh.material = mat;
      matsMap.set(mesh.uuid, { mat, original: origColor, meshName: mesh.name });
    });

    materialsRef.current = matsMap;
    return clone;
  }, [scene]);

  useEffect(() => { setReady(true); }, [preparedScene]);

  // ── Collect ALL meshes for raycasting ──────────────────────────────────────
  const meshesRef = useRef<THREE.Mesh[]>([]);
  useEffect(() => {
    if (!preparedScene) return;
    const meshes: THREE.Mesh[] = [];
    preparedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
    });
    meshesRef.current = meshes;
  }, [preparedScene]);

  // ── Raycasting — mesh-name → boneMap lookup ────────────────────────────────
  /**
   * Cast a ray into the scene and resolve the hit mesh to a BonePart.
   *
   * Data Integrity flow:
   *   1. Log the raw GLB mesh name so developers can populate boneMap.
   *   2. If the mesh name IS in boneMap → return the correct BonePart.
   *   3. If NOT in boneMap → return a synthetic "Unknown Bone" BonePart so the
   *      label shows "Unknown Bone — <MeshName>" instead of silently failing.
   */
  const doRaycast = useCallback(
    (clientX: number, clientY: number): BonePart | null => {
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      const intersects = raycasterRef.current.intersectObjects(meshesRef.current, true);
      if (intersects.length === 0) return null;

      const hitObject = intersects[0].object;
      const meshName = hitObject.name;

      // ── Mesh Name Inspection (Data Integrity requirement) ──
      // Logs exact GLB internal name so you can populate modelRegistry.js
      console.log(`[Anatomy] Clicked mesh: "${meshName}"`, hitObject);

      // ── boneMap validation ──
      const bone = findBoneByMeshName(meshName);
      if (bone) return bone; // ✅ Known bone — show correct name

      // ⚠️ Unknown bone — show diagnostic label so developer can add mapping
      if (meshName) return makeUnknownBone(meshName);

      return null;
    },
    [gl, camera]
  );

  /**
   * Lightweight hover raycast — only sets hoveredPart for mapped bones.
   * Unknown bones don't get hover IDs (they'd have no matching entry in skeletalParts).
   */
  const doRaycastHover = useCallback(
    (clientX: number, clientY: number): string | null => {
      const rect = gl.domElement.getBoundingClientRect();
      mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      const intersects = raycasterRef.current.intersectObjects(meshesRef.current, true);
      if (intersects.length === 0) return null;

      const meshName = intersects[0].object.name;
      return (boneMap as Record<string, string>)[meshName] ?? null;
    },
    [gl, camera]
  );

  // ── Pointer / touch event handlers ─────────────────────────────────────────
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
      // Tap recognition: ≤ 400 ms, ≤ 15 px movement (tolerant for mobile thumbs)
      if (dt < 400 && dx < 15 && dy < 15) {
        const bone = doRaycast(e.clientX, e.clientY);
        if (bone) {
          triggerHaptic();
          onSelectPartRef.current(bone);
        } else {
          // Tapped void — clear isolation mode, restore all opacities to 1.0
          onClearSelectionRef.current();
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // hover is desktop-only
      const boneId = doRaycastHover(e.clientX, e.clientY);
      if (boneId) {
        canvas.style.cursor = "pointer";
        onHoverPartRef.current(boneId);
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
  }, [gl, doRaycast, doRaycastHover]);

  // ── Per-frame material update — Isolation Mode ────────────────────────────
  //
  // Visual "Isolation Mode" rules:
  //   SELECTED     → emissive: deepskyblue, emissiveIntensity: 2, opacity: 1.0
  //   HOVERED/CONN → teal tint, partial opacity when selection active
  //   GHOSTED      → opacity: 0.1, transparent: true (all non-selected meshes)
  //   DEFAULT      → original color, opacity: 1.0, transparent: false
  //
  // Smooth lerp transitions are applied each frame to prevent jarring snaps.
  useFrame(() => {
    if (!preparedScene) return;

    const hasSelection = selectedPart !== null;

    materialsRef.current.forEach(({ mat, original, meshName }) => {
      const isSelected = isMeshSelected(meshName, selectedPart);
      const mappedBoneId = (boneMap as Record<string, string>)[meshName] ?? null;
      const isHoveredOrConnected =
        !isSelected &&
        mappedBoneId !== null &&
        (hoveredPart === mappedBoneId ||
          (selectedPart?.connections.includes(mappedBoneId) ?? false));

      if (isSelected) {
        // ── SELECTED: Persistent deep sky blue glow — emissive intensity 2 ──
        mat.color.lerp(SELECTION_COLOR, 0.35);
        mat.emissive.lerp(SELECTION_EMISSIVE, 0.35);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 2.0, 0.35);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.35);
        mat.transparent = false;
        mat.depthWrite = true;
      } else if (isHoveredOrConnected) {
        // ── HOVERED / CONNECTED: subtle teal accent ──
        mat.color.lerp(HOVER_COLOR, 0.08);
        mat.emissive.lerp(HOVER_EMISSIVE, 0.08);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.3, 0.08);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, hasSelection ? 0.45 : 0.95, 0.08);
        mat.transparent = hasSelection;
        mat.depthWrite = !hasSelection;
      } else if (hasSelection) {
        // ── GHOSTED: opacity 0.1, transparent: true ──
        // "Ghosts out" the rest of the body so the selected bone is in focus
        mat.color.lerp(original.clone().multiplyScalar(0.35), 0.05);
        mat.emissive.lerp(BLACK, 0.05);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.05);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.1, 0.04);
        mat.transparent = true;
        mat.depthWrite = false;
      } else {
        // ── DEFAULT (no selection): full opacity 1.0, clear highlights ──
        // "Tapping the empty void" resets everything here via the lerp
        mat.color.lerp(original, 0.06);
        mat.emissive.lerp(BLACK, 0.06);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.06);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.06);
        mat.transparent = false;
        mat.depthWrite = true;
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
