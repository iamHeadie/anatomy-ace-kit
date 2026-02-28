import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";

interface SkeletonModelProps {
  selectedPart: BonePart | null;
  hoveredPart: string | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
}

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

  return minDist < 4.0 ? nearest : null;
}

export function SkeletonModel({
  selectedPart,
  hoveredPart,
  onSelectPart,
  onHoverPart,
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
  useEffect(() => { onSelectPartRef.current = onSelectPart; }, [onSelectPart]);
  useEffect(() => { onHoverPartRef.current = onHoverPart; }, [onHoverPart]);

  // Prepare the scene once
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

    const matsMap = new Map<string, { mat: THREE.MeshStandardMaterial; original: THREE.Color }>();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material instanceof THREE.Material) {
          const mat = new THREE.MeshStandardMaterial({
            color: (mesh.material as THREE.MeshStandardMaterial).color?.clone() || new THREE.Color("#d4b896"),
            roughness: 0.55,
            metalness: 0.05,
            transparent: true,
            opacity: 0.9,
          });
          const origColor = mat.color.clone();
          mesh.material = mat;
          matsMap.set(mesh.uuid, { mat, original: origColor });
        }
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

  // Collect all meshes for raycasting
  const meshesRef = useRef<THREE.Mesh[]>([]);
  useEffect(() => {
    if (!preparedScene) return;
    const meshes: THREE.Mesh[] = [];
    preparedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
    });
    meshesRef.current = meshes;
  }, [preparedScene]);

  // Manual raycasting via native DOM events
  const doRaycast = useCallback((clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    const intersects = raycasterRef.current.intersectObjects(meshesRef.current, false);
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      const boneSpace = pointToBoneSpace(hitPoint);
      return findNearestBone(boneSpace);
    }
    return null;
  }, [gl, camera, pointToBoneSpace]);

  // Pointer/touch down => select
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
      // Only select on tap/click (not drag for orbit)
      if (dt < 300 && dx < 10 && dy < 10) {
        const bone = doRaycast(e.clientX, e.clientY);
        if (bone) {
          onSelectPartRef.current(bone);
        }
      }
    };
    
    const onPointerMove = (e: PointerEvent) => {
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

  // Highlight + GHOSTING logic
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
        mat.color.lerp(new THREE.Color("#14b8a6"), 0.12);
        mat.emissive.lerp(new THREE.Color("#14b8a6"), 0.12);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.6, 0.12);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1, 0.12);
      } else if (
        bone &&
        (hoveredPart === bone.id || (selectedPart?.connections.includes(bone.id) ?? false))
      ) {
        mat.color.lerp(new THREE.Color("#5eead4"), 0.12);
        mat.emissive.lerp(new THREE.Color("#5eead4"), 0.12);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.25, 0.12);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, hasSelection ? 0.35 : 0.95, 0.12);
      } else if (hasSelection) {
        mat.color.lerp(original.clone().multiplyScalar(0.3), 0.08);
        mat.emissive.lerp(new THREE.Color("#000000"), 0.08);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.08);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.08, 0.06);
      } else {
        mat.color.lerp(original, 0.08);
        mat.emissive.lerp(new THREE.Color("#000000"), 0.08);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.08);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.88, 0.08);
      }
    });
  });

  if (!ready) return null;

  return (
    <group ref={groupRef}>
      <primitive object={preparedScene} />
    </group>
  );
}

useGLTF.preload("/models/skeleton.glb");
