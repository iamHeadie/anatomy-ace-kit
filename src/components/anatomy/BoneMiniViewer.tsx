/**
 * BoneMiniViewer — a small, self-contained 3D Canvas that shows the full
 * skeleton with only the target bone highlighted (deepskyblue glow) and
 * everything else ghosted. Auto-rotates so the student sees all angles.
 *
 * Usage: <BoneMiniViewer boneId="femur-l" className="h-40 w-full" />
 */

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { skeletalParts } from "@/data/skeletalSystem";
import { Bone as BoneIcon } from "lucide-react";

// ── Isolated skeleton that highlights a single bone ────────────────────────
function IsolatedSkeleton({ boneId }: { boneId: string }) {
  const { scene } = useGLTF("/models/skeleton.glb");
  const groupRef = useRef<THREE.Group>(null);

  const preparedScene = useMemo(() => {
    const clone = scene.clone();

    // Normalise to 7-unit height (matches main viewer)
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const s = 7 / Math.max(size.x, size.y, size.z);
    clone.scale.setScalar(s);
    clone.position.set(
      -center.x * s,
      -center.y * s + 7 / 2 - 2.85,
      -center.z * s
    );

    // Find the target bone's world position so we can centre the camera on it
    const bone = skeletalParts.find((b) => b.id === boneId);
    const bonePos = bone
      ? new THREE.Vector3(...bone.position)
      : new THREE.Vector3(0, 1, 0);

    // Ghost every mesh; highlight meshes nearest to the target bone
    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;

      // Get the mesh's world-space center after transform
      const meshBox = new THREE.Box3().setFromObject(mesh);
      const meshCenter = meshBox.getCenter(new THREE.Vector3());

      const dist = meshCenter.distanceTo(bonePos);
      const isTarget = dist < 0.6; // close enough to the bone position

      const mat = new THREE.MeshStandardMaterial({
        color: isTarget ? new THREE.Color("#00bfff") : new THREE.Color("#a0a0a0"),
        emissive: isTarget ? new THREE.Color("#0088cc") : new THREE.Color("#000000"),
        emissiveIntensity: isTarget ? 1.5 : 0,
        roughness: 0.5,
        metalness: 0.05,
        transparent: !isTarget,
        opacity: isTarget ? 1.0 : 0.08,
        depthWrite: isTarget,
        side: THREE.DoubleSide,
      });
      mesh.material = mat;
    });

    return { clone, bonePos };
  }, [scene, boneId]);

  // Auto-rotate
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={groupRef} position={[0, -preparedScene.bonePos.y, 0]}>
      <primitive object={preparedScene.clone} />
    </group>
  );
}

// ── Loading fallback ──────────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <BoneIcon size={32} className="text-primary/40 animate-pulse" />
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────
interface BoneMiniViewerProps {
  boneId: string;
  className?: string;
}

export function BoneMiniViewer({ boneId, className = "" }: BoneMiniViewerProps) {
  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 1, 4], fov: 30, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
          resize={{ debounce: 100 }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 4]} intensity={1.2} />
          <directionalLight position={[-2, 3, -3]} intensity={0.4} />
          <IsolatedSkeleton boneId={boneId} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
