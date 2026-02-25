import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, ThreeEvent } from "@react-three/fiber";
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

  return minDist < 2.5 ? nearest : null;
}

export function SkeletonModel({
  selectedPart,
  hoveredPart,
  onSelectPart,
  onHoverPart,
}: SkeletonModelProps) {
  const { scene } = useGLTF("/models/skeleton.glb");
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<Map<string, { mat: THREE.MeshStandardMaterial; original: THREE.Color }>>(new Map());
  const transformRef = useRef({ scale: 1, offset: new THREE.Vector3() });
  const [ready, setReady] = useState(false);

  // Prepare the scene once
  const preparedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Compute bounds
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

    // Setup materials
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

  // Convert screen hit point to bone-space coordinates
  const pointToBoneSpace = useCallback((point: THREE.Vector3) => {
    const { scale, offset } = transformRef.current;
    return point.clone().sub(offset).divideScalar(scale);
  }, []);

  // Highlight logic
  useFrame(() => {
    if (!preparedScene) return;
    
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
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.5, 0.12);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 1, 0.12);
      } else if (
        bone &&
        (hoveredPart === bone.id || (selectedPart?.connections.includes(bone.id) ?? false))
      ) {
        mat.color.lerp(new THREE.Color("#5eead4"), 0.12);
        mat.emissive.lerp(new THREE.Color("#5eead4"), 0.12);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.25, 0.12);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.95, 0.12);
      } else {
        mat.color.lerp(original, 0.08);
        mat.emissive.lerp(new THREE.Color("#000000"), 0.08);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0, 0.08);
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.88, 0.08);
      }
    });
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const bone = findNearestBone(pointToBoneSpace(e.point));
      if (bone) onSelectPart(bone);
    },
    [onSelectPart, pointToBoneSpace]
  );

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      document.body.style.cursor = "pointer";
      const bone = findNearestBone(pointToBoneSpace(e.point));
      if (bone) onHoverPart(bone.id);
    },
    [onHoverPart, pointToBoneSpace]
  );

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = "default";
    onHoverPart(null);
  }, [onHoverPart]);

  if (!ready) return null;

  return (
    <group ref={groupRef}>
      <primitive
        object={preparedScene}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  );
}

useGLTF.preload("/models/skeleton.glb");
