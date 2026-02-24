import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Grid } from "@react-three/drei";
import { Suspense } from "react";
import { BoneModel } from "./BoneModel";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";

interface AnatomySceneProps {
  selectedPart: BonePart | null;
  hoveredPart: string | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
}

function SkeletonGroup({ selectedPart, hoveredPart, onSelectPart, onHoverPart }: AnatomySceneProps) {
  return (
    <group position={[0, 0, 0]}>
      {skeletalParts.map((bone) => (
        <BoneModel
          key={bone.id}
          bone={bone}
          isSelected={selectedPart?.id === bone.id}
          isHighlighted={hoveredPart === bone.id || (selectedPart?.connections.includes(bone.id) ?? false)}
          onClick={() => onSelectPart(bone)}
          onHover={(h) => onHoverPart(h ? bone.id : null)}
        />
      ))}
    </group>
  );
}

export function AnatomyScene({ selectedPart, hoveredPart, onSelectPart, onHoverPart }: AnatomySceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [4, 2, 6], fov: 45 }}
        dpr={[1, 2]}
        className="!bg-transparent"
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
          <directionalLight position={[-3, 4, -3]} intensity={0.3} />
          <pointLight position={[0, 2, 3]} intensity={0.4} color="#14b8a6" />

          <SkeletonGroup
            selectedPart={selectedPart}
            hoveredPart={hoveredPart}
            onSelectPart={onSelectPart}
            onHoverPart={onHoverPart}
          />

          <ContactShadows
            position={[0, -2.85, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
          />

          <Grid
            position={[0, -2.85, 0]}
            args={[20, 20]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#1a2744"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#1e3a5f"
            fadeDistance={15}
            fadeStrength={1}
            infiniteGrid
          />

          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={3}
            maxDistance={15}
            target={[0, 0.5, 0]}
          />

          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
