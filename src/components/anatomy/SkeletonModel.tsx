/**
 * SkeletonModel — Isolation Study Mode
 *
 * Key design decisions:
 *  1. Pre-computed mesh→bone map (built once during useMemo, O(1) per frame)
 *     – eliminates the O(n×m) per-frame findNearestBone scan of the old code
 *  2. Ghost effect: emissive:"blue" emissiveIntensity:2 on selected mesh;
 *     transparent:true opacity:0.1 on all others (per spec)
 *  3. Void-tap resets all bones to opacity:1 (per spec)
 *  4. FloatingBoneLabel stays as Step-1 UI (tap → opens InfoDrawer)
 */
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

// ── Isolation Study Mode colours ──────────────────────────────────────────────
const ISOLATION_BASE     = new THREE.Color("#00001a"); // near-black blue tint so emissive dominates
const ISOLATION_EMISSIVE = new THREE.Color("#0000ff"); // spec: emissive "blue"
const HOVER_EMISSIVE     = new THREE.Color("#00aaff"); // preview glow on desktop hover
const BLACK              = new THREE.Color("#000000");

/**
 * Nearest-bone search with NO distance cap — used once at scene-prep time
 * so every mesh is guaranteed to map to a BonePart (no null returns).
 */
function nearestBone(point: THREE.Vector3): BonePart {
  let nearest = skeletalParts[0];
  let best = Infinity;
  for (const bone of skeletalParts) {
    const d = point.distanceTo(
      new THREE.Vector3(bone.position[0], bone.position[1], bone.position[2])
    );
    if (d < best) { best = d; nearest = bone; }
  }
  return nearest;
}

function triggerHaptic() {
  try { if (navigator.vibrate) navigator.vibrate(10); } catch { /* silent */ }
}

// ── Floating 3D label (Step 1 UI) ────────────────────────────────────────────
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
  // Convert bone-data position (bone-space) → world-space
  const wp: [number, number, number] = [
    part.position[0] * transformScale + transformOffset.x,
    part.position[1] * transformScale + transformOffset.y + 0.55,
    part.position[2] * transformScale + transformOffset.z,
  ];

  return (
    <Html position={wp} center zIndexRange={[200, 100]}>
      <button
        onClick={(e) => { e.stopPropagation(); onOpenDrawer(); }}
        style={{
          pointerEvents: "auto",
          padding: "4px 12px",
          borderRadius: "999px",
          fontSize: "11px",
          fontWeight: 700,
          color: "#fff",
          background: "rgba(14,165,233,0.88)",
          border: "1.5px solid rgba(125,211,252,0.65)",
          boxShadow: "0 4px 18px rgba(14,165,233,0.45),0 0 0 3px rgba(14,165,233,0.15)",
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          whiteSpace: "nowrap",
          userSelect: "none",
          transition: "background 0.15s,transform 0.1s",
          letterSpacing: "0.03em",
          lineHeight: 1.4,
        }}
        onMouseEnter={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = "rgba(14,165,233,1)";
          b.style.transform  = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          const b = e.currentTarget as HTMLButtonElement;
          b.style.background = "rgba(14,165,233,0.88)";
          b.style.transform  = "scale(1)";
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
  const { scene }  = useGLTF("/models/skeleton.glb");
  const { gl, camera } = useThree();

  const groupRef       = useRef<THREE.Group>(null);
  const materialsRef   = useRef<Map<string, { mat: THREE.MeshStandardMaterial; original: THREE.Color }>>(new Map());
  /** Pre-computed: meshUUID → BonePart (built once, used O(1) per frame/click) */
  const meshToBoneRef  = useRef<Map<string, BonePart>>(new Map());
  const meshesRef      = useRef<THREE.Mesh[]>([]);
  const transformRef   = useRef({ scale: 1, offset: new THREE.Vector3() });
  const raycasterRef   = useRef(new THREE.Raycaster());
  const mouseRef       = useRef(new THREE.Vector2());
  const [ready, setReady] = useState(false);

  // Stable refs — callbacks never go stale inside event listeners
  const onSelectRef = useRef(onSelectPart);
  const onHoverRef  = useRef(onHoverPart);
  const onClearRef  = useRef(onClearSelection);
  useEffect(() => { onSelectRef.current = onSelectPart; }, [onSelectPart]);
  useEffect(() => { onHoverRef.current  = onHoverPart;  }, [onHoverPart]);
  useEffect(() => { onClearRef.current  = onClearSelection; }, [onClearSelection]);

  // ── Scene preparation ──────────────────────────────────────────────────────
  // Run once per GLB load: clone, normalise scale, assign interactive
  // MeshStandardMaterials, and pre-compute a mesh-UUID → BonePart map.
  const preparedScene = useMemo(() => {
    const clone = scene.clone();

    // Auto-scale so the full skeleton is exactly 7 world-units tall
    const box    = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const sf     = 7 / Math.max(size.x, size.y, size.z); // scaleFactor

    const offset = new THREE.Vector3(
      -center.x * sf,
      -center.y * sf + 3.5 - 2.85, // 3.5 = half of 7 (target height)
      -center.z * sf
    );

    clone.scale.setScalar(sf);
    clone.position.copy(offset);

    // Force world-matrix computation so getWorldPosition() works on all children
    clone.updateMatrixWorld(true);

    transformRef.current = { scale: sf, offset };

    const matsMap   = new Map<string, { mat: THREE.MeshStandardMaterial; original: THREE.Color }>();
    const boneMap   = new Map<string, BonePart>();
    const meshList: THREE.Mesh[] = [];

    // Recursive traversal — covers every mesh in the GLB (all 206 bones)
    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;

      // Build a fresh interactive material per mesh
      const srcMat  = mesh.material;
      const baseCol = srcMat instanceof THREE.MeshStandardMaterial
        ? srcMat.color.clone()
        : new THREE.Color("#d4b896");

      const mat = new THREE.MeshStandardMaterial({
        color:       baseCol,
        roughness:   0.5,
        metalness:   0.05,
        transparent: true,   // always transparent so opacity lerps work without needsUpdate
        opacity:     1.0,    // spec reset target: opacity:1
        depthWrite:  true,
        side:        THREE.DoubleSide,
      });

      mesh.material = mat;
      matsMap.set(mesh.uuid, { mat, original: baseCol.clone() });
      meshList.push(mesh);

      // Map this mesh to its nearest bone in data-space (no distance cap —
      // every mesh must map to exactly one bone)
      const wp = new THREE.Vector3();
      mesh.getWorldPosition(wp);
      const boneSpacePos = wp.clone().sub(offset).divideScalar(sf);
      boneMap.set(mesh.uuid, nearestBone(boneSpacePos));
    });

    materialsRef.current  = matsMap;
    meshToBoneRef.current = boneMap;
    meshesRef.current     = meshList;

    return clone;
  }, [scene]);

  useEffect(() => { setReady(true); }, [preparedScene]);

  // ── Raycasting — O(1) lookup via pre-computed map ─────────────────────────
  const doRaycast = useCallback((cx: number, cy: number): BonePart | null => {
    const rect = gl.domElement.getBoundingClientRect();
    mouseRef.current.set(
      ((cx - rect.left) / rect.width)  *  2 - 1,
      ((cy - rect.top)  / rect.height) * -2 + 1
    );
    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const hits = raycasterRef.current.intersectObjects(meshesRef.current, true);
    if (!hits.length) return null;
    return meshToBoneRef.current.get((hits[0].object as THREE.Mesh).uuid) ?? null;
  }, [gl, camera]);

  // ── Pointer events: tap-vs-drag recognition ───────────────────────────────
  useEffect(() => {
    const canvas = gl.domElement;
    let t0 = 0, x0 = 0, y0 = 0;

    const onDown = (e: PointerEvent) => { t0 = Date.now(); x0 = e.clientX; y0 = e.clientY; };
    const onUp   = (e: PointerEvent) => {
      // Forgiving tap: 400ms window, 15px radius — works on mobile thumbs
      if (Date.now() - t0 < 400 && Math.hypot(e.clientX - x0, e.clientY - y0) < 15) {
        const bone = doRaycast(e.clientX, e.clientY);
        if (bone) { triggerHaptic(); onSelectRef.current(bone); }
        else       { onClearRef.current(); }        // void tap → reset
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const bone = doRaycast(e.clientX, e.clientY);
      canvas.style.cursor = bone ? "pointer" : "default";
      onHoverRef.current(bone ? bone.id : null);
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup",   onUp);
    canvas.addEventListener("pointermove", onMove);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup",   onUp);
      canvas.removeEventListener("pointermove", onMove);
    };
  }, [gl, doRaycast]);

  // ── Per-frame material updates: Isolation Study Mode ─────────────────────
  //
  // States (priority order):
  //   ISOLATED  — clicked bone:  emissive "blue" intensity 2, opacity 1   (spec)
  //   GHOST     — all others:    transparent:true  opacity 0.1             (spec)
  //   HOVER     — no selection:  subtle blue preview
  //   RESET     — no selection:  opacity 1, no emissive                    (spec)
  useFrame(() => {
    if (!preparedScene) return;
    const hasSel = selectedPart !== null;

    preparedScene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const entry = materialsRef.current.get((child as THREE.Mesh).uuid);
      if (!entry) return;

      const { mat, original } = entry;
      const bone   = meshToBoneRef.current.get((child as THREE.Mesh).uuid);
      const isSel  = !!bone && selectedPart?.id === bone.id;
      const isConn = !!bone && (selectedPart?.connections.includes(bone.id) ?? false);
      const isHov  = !!bone && hoveredPart === bone.id;

      if (isSel) {
        // ── ISOLATED ── emissive:"blue" emissiveIntensity:2  (per spec)
        mat.color.lerp(ISOLATION_BASE, 0.4);
        mat.emissive.lerp(ISOLATION_EMISSIVE, 0.4);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 2.0, 0.4);
        mat.opacity           = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.4);
        mat.depthWrite        = true;

      } else if (isHov && !hasSel) {
        // ── HOVER PREVIEW (desktop, no selection active) ──
        mat.color.lerp(original, 0.1);
        mat.emissive.lerp(HOVER_EMISSIVE, 0.12);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.5, 0.12);
        mat.opacity           = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.12);
        mat.depthWrite        = true;

      } else if (isConn && hasSel) {
        // ── CONNECTED: ghosted but slightly brighter than background ──
        mat.color.lerp(original, 0.08);
        mat.emissive.lerp(HOVER_EMISSIVE, 0.04);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.15, 0.04);
        mat.opacity           = THREE.MathUtils.lerp(mat.opacity, 0.22, 0.08);
        mat.depthWrite        = false;

      } else if (hasSel) {
        // ── GHOST ── transparent:true opacity:0.1  (per spec)
        mat.color.lerp(original, 0.08);
        mat.emissive.lerp(BLACK, 0.25);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.25);
        mat.opacity           = THREE.MathUtils.lerp(mat.opacity, 0.1, 0.12);
        mat.depthWrite        = false;

      } else {
        // ── RESET / DEFAULT ── opacity:1  (per spec on void-tap reset)
        mat.color.lerp(original, 0.08);
        mat.emissive.lerp(BLACK, 0.08);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.08);
        mat.opacity           = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.08);
        mat.depthWrite        = true;
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
