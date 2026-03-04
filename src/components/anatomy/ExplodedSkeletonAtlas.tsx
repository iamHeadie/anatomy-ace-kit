/**
 * ExplodedSkeletonAtlas.tsx
 *
 * Renders the full 206-bone skeleton in an "exploded atlas" formation:
 * each bone is an individually coloured, interactive mesh positioned in
 * anatomical space with a slight horizontal spread so every bone is
 * visible as a distinct element — mirroring the multi-coloured dissected-
 * atlas reference image.
 *
 * Colour coding (by bone region / ID):
 *   Femur            → Bright Red      (#ff2424)
 *   Tibia            → Bright Yellow   (#ffdd00)
 *   Fibula           → Bright Green    (#22cc44)
 *   Patella          → Orange          (#ff6600)
 *   Hip Bone         → Purple          (#9370db)
 *   Humerus          → Orange          (#ff8c00)
 *   Radius           → Coral           (#ff6040)
 *   Ulna             → Dark Coral      (#e84830)
 *   Clavicle         → Sky Blue        (#87ceeb)
 *   Scapula          → Steel Blue      (#4f94cd)
 *   Hand Phalanges   → Magenta/Pink    (#ff00cc)
 *   Foot Phalanges   → Magenta/Pink    (#ff00cc)
 *   Foot Tarsals     → Cyan            (#00ccdd)
 *   Foot Metatarsals → Teal            (#00aaaa)
 *   Wrist Carpals    → Light Pink      (#ffb3c6)
 *   Hand Metacarpals → Hot Pink        (#ff69b4)
 *   Cranium          → Ivory           (#f5f0e8)
 *   Face             → Warm Ivory      (#edddd0)
 *   Ear Ossicles     → Gold            (#ffd700)
 *   Vertebral Column → Warm Sand       (#dba870)
 *   Thorax / Ribs    → Sandy Tan       (#d4a87a)
 *
 * Quiz Mode:
 *   When hoveredPart is set, all bones sharing the same anatomical region
 *   as the hovered bone pulse with the app's signature teal (#14b8a6) glow.
 *
 * Material:
 *   roughness 0.8 — matte, bone-like; metalness 0.02.
 */

import { useRef, useCallback, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { skeletalParts, type BonePart } from "@/data/skeletalSystem";

// ── Props ─────────────────────────────────────────────────────────────────────
interface ExplodedSkeletonAtlasProps {
  selectedPart: BonePart | null;
  hoveredPart: string | null;
  onSelectPart: (part: BonePart) => void;
  onHoverPart: (id: string | null) => void;
  onClearSelection: () => void;
  onOpenDrawer: () => void;
}

// ── Shared Three.js colour objects (reused across frames) ─────────────────────
const C_SELECT   = new THREE.Color("#00bfff"); // deep sky blue — selected
const C_SEL_EMI  = new THREE.Color("#0088cc");
const C_HOVER    = new THREE.Color("#5eead4"); // soft teal — hovered
const C_HOVER_E  = new THREE.Color("#2dd4bf");
const C_QUIZ     = new THREE.Color("#14b8a6"); // teal — quiz group glow
const C_BLACK    = new THREE.Color("#000000");

// ── Per-bone atlas colour ──────────────────────────────────────────────────────
function getAtlasColor(bone: BonePart): string {
  const id     = bone.id;
  const region = bone.region;

  // ── Specific long-bone matches (highest priority) ─────────────────────────
  if (id.startsWith("femur"))   return "#ff2424";
  if (id.startsWith("tibia"))   return "#ffdd00";
  if (id.startsWith("fibula"))  return "#22cc44";
  if (id.startsWith("patella")) return "#ff6600";
  if (id.startsWith("hipbone")) return "#9370db";
  if (id.startsWith("humerus")) return "#ff8c00";
  if (id.startsWith("radius"))  return "#ff6040";
  if (id.startsWith("ulna"))    return "#e84830";
  if (id.startsWith("clavicle")) return "#87ceeb";
  if (id.startsWith("scapula"))  return "#4f94cd";

  // ── Axial specials ────────────────────────────────────────────────────────
  if (id === "sacrum")  return "#b8860b";
  if (id === "coccyx")  return "#9a7010";
  if (id === "sternum") return "#d4c090";
  if (id === "hyoid")   return "#88aacc";

  // ── Ear ossicles ──────────────────────────────────────────────────────────
  if (id.startsWith("malleus") || id.startsWith("incus") || id.startsWith("stapes"))
    return "#ffd700";

  // ── Region-based fallback ─────────────────────────────────────────────────
  switch (region) {
    case "Cranium":             return "#f5f0e8";
    case "Face":                return "#edddd0";
    case "Ear Ossicles":        return "#ffd700";
    case "Axial":               return "#88aacc"; // hyoid
    case "Vertebral Column":    return "#dba870";
    case "Thorax":              return "#d4a87a";
    case "Pectoral Girdle":     return "#87ceeb";
    case "Pelvic Girdle":       return "#9370db";
    case "Upper Limb":          return "#ff8c00";
    case "Wrist (Carpals)":     return "#ffb3c6";
    case "Hand (Metacarpals)":  return "#ff69b4";
    case "Hand (Phalanges)":    return "#ff00cc";
    case "Lower Limb":          return "#ff2424";
    case "Foot (Tarsals)":      return "#00ccdd";
    case "Foot (Metatarsals)":  return "#00aaaa";
    case "Foot (Phalanges)":    return "#ff00cc";
    default:                    return "#d4b896";
  }
}

// ── Geometry type selector ────────────────────────────────────────────────────
type GeoType = "sphere" | "capsule" | "box" | "flat";

function getGeoType(bone: BonePart): GeoType {
  const { id, region } = bone;
  if (region === "Cranium" || id.startsWith("patella")) return "sphere";
  if (region === "Ear Ossicles") return "sphere";
  if (region === "Hand (Phalanges)" || region === "Foot (Phalanges)") return "sphere";
  if (region === "Wrist (Carpals)" || region === "Foot (Tarsals)") return "box";
  if (id.startsWith("scapula") || id === "sternum" || id.startsWith("hipbone")) return "flat";
  if (id === "sacrum" || id === "vomer" || region === "Face") return "flat";
  return "capsule";
}

// ── Explosion-spread helper ───────────────────────────────────────────────────
// Push bones slightly outward from anatomical centre on X/Z so each bone
// is clearly visible as a distinct element (the "exploded atlas" effect).
const SPREAD = 1.25;
function explodePos(pos: [number, number, number]): [number, number, number] {
  return [pos[0] * SPREAD, pos[1], pos[2] * SPREAD];
}

// ─────────────────────────────────────────────────────────────────────────────
// AtlasBone — individual interactive bone mesh
// ─────────────────────────────────────────────────────────────────────────────
interface AtlasBoneProps {
  bone: BonePart;
  isSelected: boolean;
  isHovered: boolean;
  isQuizGlow: boolean;   // true when this bone's region is "quiz-highlighted"
  pulseRef: React.MutableRefObject<number>;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}

function AtlasBone({
  bone,
  isSelected,
  isHovered,
  isQuizGlow,
  pulseRef,
  onClick,
  onPointerOver,
  onPointerOut,
}: AtlasBoneProps) {
  const matRef    = useRef<THREE.MeshStandardMaterial>(null);
  const baseColor = useMemo(() => new THREE.Color(getAtlasColor(bone)), [bone]);
  const geoType   = getGeoType(bone);
  const position  = explodePos(bone.position);

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;

    if (isSelected) {
      // Deep sky-blue glow — selected state
      mat.color.lerp(C_SELECT, 0.35);
      mat.emissive.lerp(C_SEL_EMI, 0.35);
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 2.0, 0.35);
      mat.opacity    = 1.0;
      mat.transparent = false;
      mat.depthWrite  = true;

    } else if (isQuizGlow) {
      // Pulsing teal glow — quiz group highlight
      const pulse = (Math.sin(pulseRef.current * 3.5) + 1) * 0.5;
      mat.color.lerp(C_QUIZ, 0.35);
      mat.emissive.copy(C_QUIZ);
      mat.emissiveIntensity = 0.6 + pulse * 1.4;
      mat.opacity    = 1.0;
      mat.transparent = false;
      mat.depthWrite  = true;

    } else if (isHovered) {
      // Soft teal — hover
      mat.color.lerp(C_HOVER, 0.15);
      mat.emissive.lerp(C_HOVER_E, 0.15);
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.5, 0.15);
      mat.opacity    = 1.0;
      mat.transparent = false;
      mat.depthWrite  = true;

    } else {
      // Resting state — return to atlas colour
      mat.color.lerp(baseColor, 0.08);
      mat.emissive.lerp(C_BLACK, 0.08);
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.0, 0.08);
      mat.opacity    = THREE.MathUtils.lerp(mat.opacity, 1.0, 0.06);
      mat.transparent = mat.opacity < 0.995;
      mat.depthWrite  = !mat.transparent;
    }
  });

  return (
    <mesh
      position={position}
      scale={bone.scale}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); }}
      onPointerOut={onPointerOut}
    >
      {geoType === "sphere"  && <sphereGeometry  args={[1, 10, 10]} />}
      {geoType === "capsule" && <capsuleGeometry args={[0.5, 1, 6, 12]} />}
      {geoType === "box"     && <boxGeometry     args={[1, 1, 1]} />}
      {geoType === "flat"    && <boxGeometry     args={[1, 1, 0.35]} />}
      <meshStandardMaterial
        ref={matRef}
        color={getAtlasColor(bone)}
        roughness={0.8}
        metalness={0.02}
        transparent={false}
        opacity={1.0}
        depthWrite
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ExplodedSkeletonAtlas
// ─────────────────────────────────────────────────────────────────────────────
export function ExplodedSkeletonAtlas({
  selectedPart,
  hoveredPart,
  onSelectPart,
  onHoverPart,
  onClearSelection,
  onOpenDrawer,
}: ExplodedSkeletonAtlasProps) {
  const pulseRef = useRef(0);
  const { gl } = useThree();

  // Advance pulse clock every frame
  useFrame((_, delta) => { pulseRef.current += delta; });

  // Region of the currently hovered bone (drives quiz group glow)
  const hoveredRegion = useMemo(
    () => skeletalParts.find((b) => b.id === hoveredPart)?.region ?? null,
    [hoveredPart]
  );

  const handleCanvasClick = useCallback(() => {
    onClearSelection();
  }, [onClearSelection]);

  // Update cursor style when hovering a bone
  const setCursorPointer  = useCallback(() => { gl.domElement.style.cursor = "pointer"; }, [gl]);
  const setCursorDefault  = useCallback(() => { gl.domElement.style.cursor = "default";  }, [gl]);

  return (
    <group onClick={handleCanvasClick}>
      {skeletalParts.map((bone) => {
        const isSelected = selectedPart?.id === bone.id;
        const isHovered  = hoveredPart === bone.id;
        // Quiz group glow: bone is in the same region as the hovered bone,
        // but is not the hovered bone itself (that gets isHovered) and not the
        // selected bone (which has its own blue highlight).
        const isQuizGlow =
          !isSelected &&
          !isHovered &&
          hoveredRegion !== null &&
          bone.region === hoveredRegion;

        return (
          <AtlasBone
            key={bone.id}
            bone={bone}
            isSelected={isSelected}
            isHovered={isHovered}
            isQuizGlow={isQuizGlow}
            pulseRef={pulseRef}
            onClick={() => onSelectPart(bone)}
            onPointerOver={() => { onHoverPart(bone.id); setCursorPointer(); }}
            onPointerOut={() => { onHoverPart(null); setCursorDefault(); }}
          />
        );
      })}

      {/* Floating label above the selected bone */}
      {selectedPart && (
        <Html
          position={[
            explodePos(selectedPart.position)[0],
            explodePos(selectedPart.position)[1] + selectedPart.scale[1] * 0.7 + 0.4,
            explodePos(selectedPart.position)[2],
          ]}
          center
          zIndexRange={[200, 100]}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onOpenDrawer(); }}
            style={{
              pointerEvents: "auto",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#fff",
              background: "rgba(14, 165, 233, 0.88)",
              border: "1.5px solid rgba(125, 211, 252, 0.65)",
              boxShadow: "0 4px 18px rgba(14,165,233,0.45), 0 0 0 3px rgba(14,165,233,0.15)",
              backdropFilter: "blur(8px)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              userSelect: "none",
              letterSpacing: "0.03em",
              lineHeight: 1.4,
            }}
          >
            {selectedPart.name}
          </button>
        </Html>
      )}
    </group>
  );
}
