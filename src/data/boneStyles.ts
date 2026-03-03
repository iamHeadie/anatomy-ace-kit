/**
 * Master Skeleton Atlas — CSS Sprite Coordinate Map
 *
 * Each entry maps a boneId → { x, y, zoom } where:
 *   x    : horizontal centre of the bone on the master image (0 = left, 100 = right)
 *   y    : vertical centre of the bone on the master image  (0 = top, 100 = bottom)
 *   zoom : background-size multiplier (2 = 200%, 3 = 300%, …)
 *
 * Anatomical convention used by the image:
 *   Patient's LEFT  side → RIGHT side of image  (higher x)
 *   Patient's RIGHT side → LEFT  side of image  (lower  x)
 *
 * All coordinates are initial estimates based on a standard front-view
 * exploded-skeleton diagram. Fine-tune them once the real image is in place.
 *
 * Image path: /public/images/master_skeleton.jpg
 */

import type { CSSProperties } from "react";

export interface BoneStyle {
  /** Horizontal centre on master image, 0–100 (left → right) */
  x: number;
  /** Vertical centre on master image, 0–100 (top → bottom) */
  y: number;
  /** Zoom factor — e.g. 3 means background-size: 300% */
  zoom: number;
}

// ---------------------------------------------------------------------------
// Coordinate map for all 206 bones
// ---------------------------------------------------------------------------
export const boneStyles: Record<string, BoneStyle> = {

  // ── CRANIAL BONES (8) ───────────────────────────────────────────────────
  frontal:     { x: 50, y:  6, zoom: 3 },
  "parietal-l":{ x: 55, y:  5, zoom: 3 },   // patient's left → viewer's right
  "parietal-r":{ x: 45, y:  5, zoom: 3 },
  occipital:   { x: 50, y:  8, zoom: 3 },
  "temporal-l":{ x: 57, y:  7, zoom: 3 },
  "temporal-r":{ x: 43, y:  7, zoom: 3 },
  sphenoid:    { x: 50, y: 10, zoom: 3 },
  ethmoid:     { x: 50, y:  9, zoom: 4 },

  // ── FACIAL BONES (14) ───────────────────────────────────────────────────
  mandible:          { x: 50, y: 16, zoom: 3 },
  "maxilla-l":       { x: 52, y: 13, zoom: 4 },
  "maxilla-r":       { x: 48, y: 13, zoom: 4 },
  "zygomatic-l":     { x: 56, y: 12, zoom: 4 },
  "zygomatic-r":     { x: 44, y: 12, zoom: 4 },
  "nasal-l":         { x: 51, y: 11, zoom: 5 },
  "nasal-r":         { x: 49, y: 11, zoom: 5 },
  "lacrimal-l":      { x: 53, y: 11, zoom: 5 },
  "lacrimal-r":      { x: 47, y: 11, zoom: 5 },
  "palatine-l":      { x: 52, y: 14, zoom: 5 },
  "palatine-r":      { x: 48, y: 14, zoom: 5 },
  "inf-nasal-concha-l": { x: 52, y: 13, zoom: 5 },
  "inf-nasal-concha-r": { x: 48, y: 13, zoom: 5 },
  vomer:             { x: 50, y: 13, zoom: 5 },

  // ── HYOID (1) ───────────────────────────────────────────────────────────
  hyoid: { x: 50, y: 18, zoom: 4 },

  // ── AUDITORY OSSICLES (6) ───────────────────────────────────────────────
  "malleus-l": { x: 58, y:  8, zoom: 5 },
  "malleus-r": { x: 42, y:  8, zoom: 5 },
  "incus-l":   { x: 58, y:  8, zoom: 5 },
  "incus-r":   { x: 42, y:  8, zoom: 5 },
  "stapes-l":  { x: 58, y:  9, zoom: 5 },
  "stapes-r":  { x: 42, y:  9, zoom: 5 },

  // ── VERTEBRAL COLUMN (26) ───────────────────────────────────────────────
  // Cervical (7)
  "c1-atlas": { x: 50, y: 19, zoom: 4 },
  "c2-axis":  { x: 50, y: 20, zoom: 4 },
  c3:         { x: 50, y: 21, zoom: 4 },
  c4:         { x: 50, y: 22, zoom: 4 },
  c5:         { x: 50, y: 23, zoom: 4 },
  c6:         { x: 50, y: 24, zoom: 4 },
  c7:         { x: 50, y: 25, zoom: 4 },
  // Thoracic (12)
  t1:  { x: 50, y: 26, zoom: 4 },
  t2:  { x: 50, y: 27, zoom: 4 },
  t3:  { x: 50, y: 28, zoom: 4 },
  t4:  { x: 50, y: 29, zoom: 4 },
  t5:  { x: 50, y: 30, zoom: 4 },
  t6:  { x: 50, y: 31, zoom: 4 },
  t7:  { x: 50, y: 32, zoom: 4 },
  t8:  { x: 50, y: 33, zoom: 4 },
  t9:  { x: 50, y: 34, zoom: 4 },
  t10: { x: 50, y: 35, zoom: 4 },
  t11: { x: 50, y: 36, zoom: 4 },
  t12: { x: 50, y: 37, zoom: 4 },
  // Lumbar (5)
  l1: { x: 50, y: 39, zoom: 4 },
  l2: { x: 50, y: 41, zoom: 4 },
  l3: { x: 50, y: 43, zoom: 4 },
  l4: { x: 50, y: 45, zoom: 4 },
  l5: { x: 50, y: 47, zoom: 4 },
  // Sacrum + Coccyx
  sacrum: { x: 50, y: 52, zoom: 3 },
  coccyx: { x: 50, y: 56, zoom: 4 },

  // ── STERNUM (1) ─────────────────────────────────────────────────────────
  sternum: { x: 50, y: 32, zoom: 3 },

  // ── RIBS (24) ───────────────────────────────────────────────────────────
  // -l = patient's left → viewer's right (higher x)
  // -r = patient's right → viewer's left (lower x)
  "rib-l-1":  { x: 57, y: 27, zoom: 4 }, "rib-r-1":  { x: 43, y: 27, zoom: 4 },
  "rib-l-2":  { x: 59, y: 28, zoom: 4 }, "rib-r-2":  { x: 41, y: 28, zoom: 4 },
  "rib-l-3":  { x: 61, y: 29, zoom: 3 }, "rib-r-3":  { x: 39, y: 29, zoom: 3 },
  "rib-l-4":  { x: 62, y: 30, zoom: 3 }, "rib-r-4":  { x: 38, y: 30, zoom: 3 },
  "rib-l-5":  { x: 63, y: 31, zoom: 3 }, "rib-r-5":  { x: 37, y: 31, zoom: 3 },
  "rib-l-6":  { x: 63, y: 32, zoom: 3 }, "rib-r-6":  { x: 37, y: 32, zoom: 3 },
  "rib-l-7":  { x: 63, y: 33, zoom: 3 }, "rib-r-7":  { x: 37, y: 33, zoom: 3 },
  "rib-l-8":  { x: 62, y: 34, zoom: 3 }, "rib-r-8":  { x: 38, y: 34, zoom: 3 },
  "rib-l-9":  { x: 61, y: 35, zoom: 3 }, "rib-r-9":  { x: 39, y: 35, zoom: 3 },
  "rib-l-10": { x: 60, y: 36, zoom: 3 }, "rib-r-10": { x: 40, y: 36, zoom: 3 },
  "rib-l-11": { x: 60, y: 37, zoom: 3 }, "rib-r-11": { x: 40, y: 37, zoom: 3 },
  "rib-l-12": { x: 59, y: 38, zoom: 3 }, "rib-r-12": { x: 41, y: 38, zoom: 3 },

  // ── PECTORAL GIRDLE (4) ─────────────────────────────────────────────────
  "clavicle-l": { x: 60, y: 24, zoom: 3 },
  "clavicle-r": { x: 40, y: 24, zoom: 3 },
  "scapula-l":  { x: 65, y: 29, zoom: 2 },
  "scapula-r":  { x: 35, y: 29, zoom: 2 },

  // ── UPPER LIMB — long bones (6) ─────────────────────────────────────────
  "humerus-l": { x: 70, y: 37, zoom: 2 },
  "humerus-r": { x: 30, y: 37, zoom: 2 },
  "radius-l":  { x: 73, y: 50, zoom: 2 },
  "radius-r":  { x: 27, y: 50, zoom: 2 },
  "ulna-l":    { x: 72, y: 51, zoom: 2 },
  "ulna-r":    { x: 28, y: 51, zoom: 2 },

  // ── CARPALS (16) ────────────────────────────────────────────────────────
  "scaphoid-l":   { x: 73, y: 59, zoom: 5 }, "scaphoid-r":   { x: 27, y: 59, zoom: 5 },
  "lunate-l":     { x: 72, y: 59, zoom: 5 }, "lunate-r":     { x: 28, y: 59, zoom: 5 },
  "triquetrum-l": { x: 71, y: 60, zoom: 5 }, "triquetrum-r": { x: 29, y: 60, zoom: 5 },
  "pisiform-l":   { x: 71, y: 61, zoom: 5 }, "pisiform-r":   { x: 29, y: 61, zoom: 5 },
  "trapezium-l":  { x: 74, y: 60, zoom: 5 }, "trapezium-r":  { x: 26, y: 60, zoom: 5 },
  "trapezoid-l":  { x: 73, y: 60, zoom: 5 }, "trapezoid-r":  { x: 27, y: 60, zoom: 5 },
  "capitate-l":   { x: 72, y: 61, zoom: 5 }, "capitate-r":   { x: 28, y: 61, zoom: 5 },
  "hamate-l":     { x: 71, y: 61, zoom: 5 }, "hamate-r":     { x: 29, y: 61, zoom: 5 },

  // ── METACARPALS (10) ────────────────────────────────────────────────────
  "metacarpal-1-l": { x: 75, y: 63, zoom: 5 }, "metacarpal-1-r": { x: 25, y: 63, zoom: 5 },
  "metacarpal-2-l": { x: 73, y: 63, zoom: 5 }, "metacarpal-2-r": { x: 27, y: 63, zoom: 5 },
  "metacarpal-3-l": { x: 72, y: 63, zoom: 5 }, "metacarpal-3-r": { x: 28, y: 63, zoom: 5 },
  "metacarpal-4-l": { x: 71, y: 63, zoom: 5 }, "metacarpal-4-r": { x: 29, y: 63, zoom: 5 },
  "metacarpal-5-l": { x: 70, y: 63, zoom: 5 }, "metacarpal-5-r": { x: 30, y: 63, zoom: 5 },

  // ── HAND PHALANGES (28) ─────────────────────────────────────────────────
  // Thumb (2 per side)
  "phalanx-proximal-thumb-l": { x: 76, y: 65, zoom: 5 },
  "phalanx-distal-thumb-l":   { x: 76, y: 67, zoom: 5 },
  "phalanx-proximal-thumb-r": { x: 24, y: 65, zoom: 5 },
  "phalanx-distal-thumb-r":   { x: 24, y: 67, zoom: 5 },
  // Index finger (3 per side)
  "phalanx-proximal-index-finger-l": { x: 74, y: 65, zoom: 5 },
  "phalanx-middle-index-finger-l":   { x: 74, y: 67, zoom: 5 },
  "phalanx-distal-index-finger-l":   { x: 74, y: 69, zoom: 5 },
  "phalanx-proximal-index-finger-r": { x: 26, y: 65, zoom: 5 },
  "phalanx-middle-index-finger-r":   { x: 26, y: 67, zoom: 5 },
  "phalanx-distal-index-finger-r":   { x: 26, y: 69, zoom: 5 },
  // Middle finger
  "phalanx-proximal-middle-finger-l": { x: 73, y: 65, zoom: 5 },
  "phalanx-middle-middle-finger-l":   { x: 73, y: 67, zoom: 5 },
  "phalanx-distal-middle-finger-l":   { x: 73, y: 69, zoom: 5 },
  "phalanx-proximal-middle-finger-r": { x: 27, y: 65, zoom: 5 },
  "phalanx-middle-middle-finger-r":   { x: 27, y: 67, zoom: 5 },
  "phalanx-distal-middle-finger-r":   { x: 27, y: 69, zoom: 5 },
  // Ring finger
  "phalanx-proximal-ring-finger-l": { x: 71, y: 65, zoom: 5 },
  "phalanx-middle-ring-finger-l":   { x: 71, y: 67, zoom: 5 },
  "phalanx-distal-ring-finger-l":   { x: 71, y: 69, zoom: 5 },
  "phalanx-proximal-ring-finger-r": { x: 29, y: 65, zoom: 5 },
  "phalanx-middle-ring-finger-r":   { x: 29, y: 67, zoom: 5 },
  "phalanx-distal-ring-finger-r":   { x: 29, y: 69, zoom: 5 },
  // Little finger
  "phalanx-proximal-little-finger-l": { x: 70, y: 65, zoom: 5 },
  "phalanx-middle-little-finger-l":   { x: 70, y: 67, zoom: 5 },
  "phalanx-distal-little-finger-l":   { x: 70, y: 69, zoom: 5 },
  "phalanx-proximal-little-finger-r": { x: 30, y: 65, zoom: 5 },
  "phalanx-middle-little-finger-r":   { x: 30, y: 67, zoom: 5 },
  "phalanx-distal-little-finger-r":   { x: 30, y: 69, zoom: 5 },

  // ── PELVIC GIRDLE (2) ───────────────────────────────────────────────────
  "hipbone-l": { x: 57, y: 57, zoom: 2 },
  "hipbone-r": { x: 43, y: 57, zoom: 2 },

  // ── LOWER LIMB — long bones (8) ─────────────────────────────────────────
  "femur-l":   { x: 57, y: 70, zoom: 2 },
  "femur-r":   { x: 43, y: 70, zoom: 2 },
  "patella-l": { x: 57, y: 79, zoom: 4 },
  "patella-r": { x: 43, y: 79, zoom: 4 },
  "tibia-l":   { x: 57, y: 84, zoom: 2 },
  "tibia-r":   { x: 43, y: 84, zoom: 2 },
  "fibula-l":  { x: 58, y: 84, zoom: 3 },
  "fibula-r":  { x: 42, y: 84, zoom: 3 },

  // ── TARSALS (14) ────────────────────────────────────────────────────────
  "talus-l":                  { x: 57, y: 90, zoom: 5 }, "talus-r":                  { x: 43, y: 90, zoom: 5 },
  "calcaneus-l":              { x: 57, y: 91, zoom: 4 }, "calcaneus-r":              { x: 43, y: 91, zoom: 4 },
  "navicular-foot-l":         { x: 56, y: 91, zoom: 5 }, "navicular-foot-r":         { x: 44, y: 91, zoom: 5 },
  "cuboid-l":                 { x: 58, y: 91, zoom: 5 }, "cuboid-r":                 { x: 42, y: 91, zoom: 5 },
  "medial-cuneiform-l":       { x: 55, y: 92, zoom: 5 }, "medial-cuneiform-r":       { x: 45, y: 92, zoom: 5 },
  "intermediate-cuneiform-l": { x: 56, y: 92, zoom: 5 }, "intermediate-cuneiform-r": { x: 44, y: 92, zoom: 5 },
  "lateral-cuneiform-l":      { x: 57, y: 92, zoom: 5 }, "lateral-cuneiform-r":      { x: 43, y: 92, zoom: 5 },

  // ── METATARSALS (10) ────────────────────────────────────────────────────
  "metatarsal-1-l": { x: 55, y: 93, zoom: 5 }, "metatarsal-1-r": { x: 45, y: 93, zoom: 5 },
  "metatarsal-2-l": { x: 56, y: 93, zoom: 5 }, "metatarsal-2-r": { x: 44, y: 93, zoom: 5 },
  "metatarsal-3-l": { x: 57, y: 93, zoom: 5 }, "metatarsal-3-r": { x: 43, y: 93, zoom: 5 },
  "metatarsal-4-l": { x: 58, y: 93, zoom: 5 }, "metatarsal-4-r": { x: 42, y: 93, zoom: 5 },
  "metatarsal-5-l": { x: 59, y: 93, zoom: 5 }, "metatarsal-5-r": { x: 41, y: 93, zoom: 5 },

  // ── FOOT PHALANGES (28) ─────────────────────────────────────────────────
  // Big toe (2 per side)
  "phalanx-proximal-big-toe-l": { x: 55, y: 95, zoom: 5 },
  "phalanx-distal-big-toe-l":   { x: 55, y: 97, zoom: 5 },
  "phalanx-proximal-big-toe-r": { x: 45, y: 95, zoom: 5 },
  "phalanx-distal-big-toe-r":   { x: 45, y: 97, zoom: 5 },
  // 2nd toe
  "phalanx-proximal-2nd-toe-l": { x: 57, y: 95, zoom: 5 },
  "phalanx-middle-2nd-toe-l":   { x: 57, y: 96, zoom: 5 },
  "phalanx-distal-2nd-toe-l":   { x: 57, y: 97, zoom: 5 },
  "phalanx-proximal-2nd-toe-r": { x: 43, y: 95, zoom: 5 },
  "phalanx-middle-2nd-toe-r":   { x: 43, y: 96, zoom: 5 },
  "phalanx-distal-2nd-toe-r":   { x: 43, y: 97, zoom: 5 },
  // 3rd toe
  "phalanx-proximal-3rd-toe-l": { x: 58, y: 95, zoom: 5 },
  "phalanx-middle-3rd-toe-l":   { x: 58, y: 96, zoom: 5 },
  "phalanx-distal-3rd-toe-l":   { x: 58, y: 97, zoom: 5 },
  "phalanx-proximal-3rd-toe-r": { x: 42, y: 95, zoom: 5 },
  "phalanx-middle-3rd-toe-r":   { x: 42, y: 96, zoom: 5 },
  "phalanx-distal-3rd-toe-r":   { x: 42, y: 97, zoom: 5 },
  // 4th toe
  "phalanx-proximal-4th-toe-l": { x: 59, y: 95, zoom: 5 },
  "phalanx-middle-4th-toe-l":   { x: 59, y: 96, zoom: 5 },
  "phalanx-distal-4th-toe-l":   { x: 59, y: 97, zoom: 5 },
  "phalanx-proximal-4th-toe-r": { x: 41, y: 95, zoom: 5 },
  "phalanx-middle-4th-toe-r":   { x: 41, y: 96, zoom: 5 },
  "phalanx-distal-4th-toe-r":   { x: 41, y: 97, zoom: 5 },
  // Little toe
  "phalanx-proximal-little-toe-l": { x: 60, y: 95, zoom: 5 },
  "phalanx-middle-little-toe-l":   { x: 60, y: 96, zoom: 5 },
  "phalanx-distal-little-toe-l":   { x: 60, y: 97, zoom: 5 },
  "phalanx-proximal-little-toe-r": { x: 40, y: 95, zoom: 5 },
  "phalanx-middle-little-toe-r":   { x: 40, y: 96, zoom: 5 },
  "phalanx-distal-little-toe-r":   { x: 40, y: 97, zoom: 5 },
};

// ---------------------------------------------------------------------------
// CSS helper
// ---------------------------------------------------------------------------
const MASTER_IMAGE = "/images/master_skeleton.jpg";

/**
 * Returns React inline-style properties that zoom the master atlas image
 * into the bone's region.
 *
 * CSS background-position formula (centres bone in viewport):
 *   bgPos% = 100 * (bonePos * zoom - 0.5) / (zoom - 1)
 *
 * Returns null when the boneId has no entry → caller shows fallback.
 */
export function getBoneAtlasStyle(boneId: string): CSSProperties | null {
  const style = boneStyles[boneId];
  if (!style) return null;

  const { x, y, zoom } = style;

  const calcPos = (v: number) =>
    zoom <= 1
      ? v
      : Math.max(0, Math.min(100, ((v / 100) * zoom - 0.5) / (zoom - 1) * 100));

  return {
    backgroundImage: `url('${MASTER_IMAGE}')`,
    backgroundSize: `${zoom * 100}%`,
    backgroundPosition: `${calcPos(x).toFixed(1)}% ${calcPos(y).toFixed(1)}%`,
    backgroundRepeat: "no-repeat",
  };
}
