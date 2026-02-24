import { useRef, useState } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import type { BonePart } from "@/data/skeletalSystem";

interface BoneModelProps {
  bone: BonePart;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  onHover: (hovering: boolean) => void;
}

export function BoneModel({ bone, isSelected, isHighlighted, onClick, onHover }: BoneModelProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;
    const target = isSelected ? 1.08 : hovered ? 1.04 : 1;
    const s = meshRef.current.scale;
    s.x += (target * bone.scale[0] - s.x) * 0.1;
    s.y += (target * bone.scale[1] - s.y) * 0.1;
    s.z += (target * bone.scale[2] - s.z) * 0.1;
  });

  const getColor = () => {
    if (isSelected) return "#14b8a6";
    if (hovered || isHighlighted) return "#5eead4";
    return bone.color;
  };

  const emissiveIntensity = isSelected ? 0.4 : hovered ? 0.2 : 0;

  // Choose geometry based on bone shape
  const isFlat = bone.id.includes("scapula") || bone.id.includes("pelvis");
  const isRound = bone.id.includes("skull") || bone.id.includes("patella");
  const isFoot = bone.id.includes("foot") || bone.id.includes("hand");

  return (
    <mesh
      ref={meshRef}
      position={bone.position}
      scale={bone.scale}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); onHover(false); document.body.style.cursor = "default"; }}
    >
      {isRound ? (
        <sphereGeometry args={[1, 16, 16]} />
      ) : isFoot ? (
        <boxGeometry args={[1, 1, 1]} />
      ) : isFlat ? (
        <boxGeometry args={[1, 1, 1]} />
      ) : (
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
      )}
      <meshStandardMaterial
        color={getColor()}
        emissive={getColor()}
        emissiveIntensity={emissiveIntensity}
        roughness={0.6}
        metalness={0.1}
        transparent
        opacity={isSelected ? 1 : hovered ? 0.95 : 0.85}
      />
    </mesh>
  );
}
