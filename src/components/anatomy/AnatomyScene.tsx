import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Grid, Bounds, useBounds } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import { SkeletonModel } from "./SkeletonModel";
import { BoneModel } from "./BoneModel";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";

interface AnatomySceneProps {
  selectedPart: BonePart | null;
  hoveredPart: string | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
  onClearSelection: () => void;
  onOpenDrawer: () => void;
  drawerOpen: boolean;
}

// Fallback primitive skeleton when GLB fails to load
function PrimitiveSkeletonGroup({
  selectedPart,
  hoveredPart,
  onSelectPart,
  onHoverPart,
}: Pick<AnatomySceneProps, "selectedPart" | "hoveredPart" | "onSelectPart" | "onHoverPart">) {
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

// Camera controller — shifts orbit target when drawer opens so the selected
// bone stays visible in the upper viewport above the bottom sheet
function CameraController({
  drawerOpen,
  selectedPart,
}: {
  drawerOpen: boolean;
  selectedPart: BonePart | null;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controls = useThree((state) => state.controls) as any;
  const prevDrawerOpen = useRef(false);

  useEffect(() => {
    if (!controls || drawerOpen === prevDrawerOpen.current) return;
    prevDrawerOpen.current = drawerOpen;

    if (drawerOpen && selectedPart) {
      // InfoDrawer occupies the bottom 30 % of the screen.
      // Shifting the target downward pushes the skeleton into the clear top 70 %.
      // (-0.4 ≈ half the proportional shift needed vs the old 62 vh drawer at -0.8)
      controls.target.set(0, -0.4, 0);
    } else {
      controls.target.set(0, 0.5, 0);
    }
    controls.update();
  }, [drawerOpen, selectedPart, controls]);

  return null;
}

// Auto-framing component that responds to selectedPart changes
function AutoFramer({ selectedPart }: { selectedPart: BonePart | null }) {
  const bounds = useBounds();
  const prevPartId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedPart && selectedPart.id !== prevPartId.current) {
      prevPartId.current = selectedPart.id;
      bounds.refresh().clip().fit();
    } else if (!selectedPart && prevPartId.current) {
      prevPartId.current = null;
      bounds.refresh().clip().fit();
    }
  }, [selectedPart, bounds]);

  return null;
}

function SceneContent({
  selectedPart,
  hoveredPart,
  onSelectPart,
  onHoverPart,
  onClearSelection,
  onOpenDrawer,
}: Omit<AnatomySceneProps, "drawerOpen">) {
  return (
    <SkeletonModel
      selectedPart={selectedPart}
      hoveredPart={hoveredPart}
      onSelectPart={onSelectPart}
      onHoverPart={onHoverPart}
      onClearSelection={onClearSelection}
      onOpenDrawer={onOpenDrawer}
    />
  );
}

export function AnatomyScene({
  selectedPart,
  hoveredPart,
  onSelectPart,
  onHoverPart,
  onClearSelection,
  onOpenDrawer,
  drawerOpen,
}: AnatomySceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1, 5.5], fov: 50 }}
        dpr={[1, 2]}
        className="!bg-transparent"
        style={{ touchAction: "none" }}
      >
        <Suspense
          fallback={
            <PrimitiveSkeletonGroup
              selectedPart={selectedPart}
              hoveredPart={hoveredPart}
              onSelectPart={onSelectPart}
              onHoverPart={onHoverPart}
            />
          }
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 8, 5]} intensity={0.9} castShadow />
          <directionalLight position={[-3, 4, -3]} intensity={0.3} />
          <pointLight position={[0, 2, 3]} intensity={0.4} color="#14b8a6" />

          <Bounds fit clip observe margin={1.8}>
            <SceneContent
              selectedPart={selectedPart}
              hoveredPart={hoveredPart}
              onSelectPart={onSelectPart}
              onHoverPart={onHoverPart}
              onClearSelection={onClearSelection}
              onOpenDrawer={onOpenDrawer}
            />
            <AutoFramer selectedPart={selectedPart} />
          </Bounds>

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
            minDistance={1}
            maxDistance={15}
            target={[0, 0.5, 0]}
            makeDefault
          />

          {/* Shifts camera target when the study drawer opens */}
          <CameraController drawerOpen={drawerOpen} selectedPart={selectedPart} />

          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
