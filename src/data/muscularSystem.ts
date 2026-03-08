/**
 * muscularSystem.ts — TA98-standardized muscle data
 *
 * Single source of truth derived from Terminologia Anatomica 1998 (TA98).
 * Bilateral muscles are expanded into Left/Right pairs for completeness.
 */

import musclesJson from "./muscles-ta98.json";

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

// ── Raw TA98 data ──────────────────────────────────────────────────────────
const rawMuscles: TA98Muscle[] = (musclesJson as { muscles: TA98Muscle[] }).muscles;

// ── Unique regions & subregions for filtering ─────────────────────────────
export const muscleRegions: string[] = [...new Set(rawMuscles.map((m) => m.region))];
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
