/**
 * muscularSystem.ts — TA98-standardized muscle data with 3D position data
 *
 * Single source of truth derived from Terminologia Anatomica 1998 (TA98).
 * Bilateral muscles are expanded into Left/Right pairs.
 * Positions are computed as the centroid of connected bone world-space coordinates
 * (sourced from the same positionDb used by the skeletal system).
 */

import musclesJson from "./muscles-ta98.json";
import { positionDb } from "./skeletalSystem";

export interface TA98Muscle {
  id: string;
  name_en: string;
  name_la: string;
  region: string;
  subregion: string;
  bilateral: boolean;
  origin: string;
  insertion: string;
  action: string;
  nerve: string;
  connected_bones: string[];
}

// MusclePart shares the same spatial interface as BonePart so it integrates
// seamlessly with the 3D viewer, ContextPanel, and PartsList.
export interface MusclePart {
  id: string;
  name: string;
  latinName: string;
  system: "Muscular";
  region: string;
  subregion: string;
  description: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  facts: string[];
  connections: string[];
  ta98Id: string;
  bilateral: boolean;
  side?: "left" | "right";
  // Muscle-specific anatomy fields
  origin: string;
  insertion: string;
  action: string;
  nerve: string;
  connected_bones: string[];
}

// ── Raw TA98 data ──────────────────────────────────────────────────────────
const rawMuscles: TA98Muscle[] = (musclesJson as { muscles: TA98Muscle[] }).muscles;

// ── Color by region ───────────────────────────────────────────────────────
function getMuscleColor(region: string): string {
  switch (region) {
    case "Back":       return "#b03a2e";
    case "Neck":       return "#c0392b";
    case "Thorax":     return "#8e2222";
    case "Abdomen":    return "#a93226";
    case "Lower limb": return "#b34040";
    case "Upper limb": return "#9c2828";
    default:           return "#b03a2e";
  }
}

// ── Compute world-space centroid from connected bone IDs ──────────────────
// Uses the same positionDb that normalises skeleton.glb to 7-unit height so
// muscle blobs are perfectly aligned with the GLB skeleton model.
function computeMusclePosition(connectedBones: string[]): [number, number, number] {
  const positions: [number, number, number][] = [];
  for (const boneId of connectedBones) {
    const posData = positionDb[boneId];
    if (posData) positions.push(posData.pos);
  }
  if (positions.length === 0) return [0, 1.0, 0];
  const [sx, sy, sz] = positions.reduce(
    ([ax, ay, az], [x, y, z]) => [ax + x, ay + y, az + z] as [number, number, number],
    [0, 0, 0] as [number, number, number]
  );
  return [sx / positions.length, sy / positions.length, sz / positions.length];
}

// ── Base radius by subregion ──────────────────────────────────────────────
function getBaseRadius(region: string, subregion: string): number {
  const s = subregion.toLowerCase();
  if (s.includes("gluteal"))             return 0.28;
  if (s.includes("intercostal"))         return 0.16;
  if (s.includes("thoracic floor"))      return 0.35; // Diaphragm
  if (region === "Back")                 return 0.26;
  if (region === "Thorax")               return 0.22;
  if (region === "Abdomen")              return 0.26;
  if (region === "Neck")                 return 0.13;
  if (s.includes("thigh"))               return 0.20;
  if (s.includes("leg"))                 return 0.14;
  if (s.includes("hip"))                 return 0.22;
  if (s.includes("deep hip"))            return 0.18;
  if (s.includes("upper arm"))           return 0.16;
  if (s.includes("forearm"))             return 0.12;
  return 0.18;
}

// ── Compute scale [rx, ry, rz] from bone span ─────────────────────────────
// ry (height) is proportional to the Y-span of the connected bones so long
// muscles (e.g. Sartorius) get a taller blob than compact ones (e.g. Platysma).
function computeMuscleScale(
  connectedBones: string[],
  baseRadius: number
): [number, number, number] {
  const positions: [number, number, number][] = [];
  for (const boneId of connectedBones) {
    const posData = positionDb[boneId];
    if (posData) positions.push(posData.pos);
  }
  if (positions.length < 2) return [baseRadius, baseRadius * 1.6, baseRadius];
  let minY = Infinity, maxY = -Infinity;
  for (const [, y] of positions) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const span = maxY - minY;
  const ry = Math.max(0.16, Math.min(0.90, span * 0.72));
  return [baseRadius, ry, baseRadius * 0.85];
}

// ── Description & facts ───────────────────────────────────────────────────
function generateMuscleDescription(muscle: TA98Muscle): string {
  const paired = muscle.bilateral ? "It is a paired (bilateral) muscle." : "It is an unpaired muscle.";
  return `The ${muscle.name_en} is located in the ${muscle.subregion.toLowerCase()} of the ${muscle.region.toLowerCase()}. ${paired}`;
}

function generateMuscleFacts(muscle: TA98Muscle): string[] {
  return [
    `Region: ${muscle.region}`,
    `Subregion: ${muscle.subregion}`,
    `Action: ${muscle.action}`,
    `Nerve: ${muscle.nerve}`,
    muscle.bilateral ? "Bilateral (paired) muscle" : "Unpaired muscle",
  ];
}

// ── Expand bilateral muscles into Left / Right pairs ─────────────────────
function expandMuscles(): MusclePart[] {
  const parts: MusclePart[] = [];

  for (const muscle of rawMuscles) {
    const basePos    = computeMusclePosition(muscle.connected_bones);
    const baseRadius = getBaseRadius(muscle.region, muscle.subregion);
    const baseScale  = computeMuscleScale(muscle.connected_bones, baseRadius);
    const color      = getMuscleColor(muscle.region);
    const description = generateMuscleDescription(muscle);
    const facts       = generateMuscleFacts(muscle);

    if (muscle.bilateral) {
      // Bilateral: ensure left/right are clearly separated even for midline muscles.
      // Math.abs guarantees positive X; minimum 0.15 prevents total overlap.
      const xAbs = Math.max(Math.abs(basePos[0]), 0.15);
      const common = {
        latinName: "",
        system: "Muscular" as const,
        region: muscle.region,
        subregion: muscle.subregion,
        description,
        scale: baseScale,
        color,
        facts,
        connections: muscle.connected_bones,
        ta98Id: muscle.id,
        bilateral: true,
        origin: muscle.origin,
        insertion: muscle.insertion,
        action: muscle.action,
        nerve: muscle.nerve,
        connected_bones: muscle.connected_bones,
      };

      parts.push({
        ...common,
        id: `${muscle.id}-L`,
        name: `Left ${muscle.name_en}`,
        latinName: `${muscle.name_la} (sinister)`,
        position: [xAbs, basePos[1], basePos[2]],
        side: "left",
      });
      parts.push({
        ...common,
        id: `${muscle.id}-R`,
        name: `Right ${muscle.name_en}`,
        latinName: `${muscle.name_la} (dexter)`,
        position: [-xAbs, basePos[1], basePos[2]],
        side: "right",
      });
    } else {
      parts.push({
        id: muscle.id,
        name: muscle.name_en,
        latinName: muscle.name_la,
        system: "Muscular",
        region: muscle.region,
        subregion: muscle.subregion,
        description,
        position: basePos,
        scale: baseScale,
        color,
        facts,
        connections: muscle.connected_bones,
        ta98Id: muscle.id,
        bilateral: false,
        origin: muscle.origin,
        insertion: muscle.insertion,
        action: muscle.action,
        nerve: muscle.nerve,
        connected_bones: muscle.connected_bones,
      });
    }
  }

  return parts;
}

export const muscularParts: MusclePart[] = expandMuscles();

// ── Unique regions & subregions for filtering ─────────────────────────────
export const muscleRegions: string[]    = [...new Set(rawMuscles.map((m) => m.region))];
export const muscleSubregions: string[] = [...new Set(rawMuscles.map((m) => m.subregion))];

// ── Raw TA98 muscles (unexpanded) for quiz/flashcard generation ───────────
export const ta98Muscles: TA98Muscle[] = rawMuscles;

// ── Lookup helpers ────────────────────────────────────────────────────────
export function findMuscleById(id: string): TA98Muscle | undefined {
  return rawMuscles.find((m) => m.id === id);
}

export function findMusclesByRegion(region: string): TA98Muscle[] {
  return rawMuscles.filter((m) => m.region === region);
}

export function findMusclePartById(id: string): MusclePart | undefined {
  return muscularParts.find((m) => m.id === id);
}
