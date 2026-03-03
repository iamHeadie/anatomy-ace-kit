/**
 * Master Skeleton Atlas — CSS Sprite Coordinates
 *
 * Maps each bone ID to a position within /public/images/master_skeleton.jpg.
 *
 * Coordinate system:
 *   x    – horizontal center of the bone in the image  (0 = left edge, 100 = right edge)
 *   y    – vertical center of the bone in the image    (0 = top edge,  100 = bottom edge)
 *   zoom – magnification factor (1 = full image visible, 4 = 4× zoom-in, etc.)
 *
 * These are initial estimates for a standard front-view exploded skeleton atlas.
 * After placing master_skeleton.jpg, open this file and tweak x/y/zoom so each
 * bone is centred inside the preview box.
 *
 * CSS translation (handled by BoneAtlasImage.tsx):
 *   background-size:     `${zoom * 100}%`
 *   background-position: `${x}% ${y}%`
 */

export interface BoneAtlasStyle {
  /** Horizontal centre in master image, 0–100 */
  x: number;
  /** Vertical centre in master image, 0–100 */
  y: number;
  /** Zoom / magnification factor (1 = full image) */
  zoom: number;
}

export const boneStyles: Record<string, BoneAtlasStyle> = {
  // ─── CRANIAL BONES (8) ──────────────────────────────────
  frontal:       { x: 50, y:  5, zoom: 6 },
  "parietal-l":  { x: 44, y:  5, zoom: 7 },
  "parietal-r":  { x: 56, y:  5, zoom: 7 },
  occipital:     { x: 50, y:  7, zoom: 7 },
  "temporal-l":  { x: 42, y:  6, zoom: 7 },
  "temporal-r":  { x: 58, y:  6, zoom: 7 },
  sphenoid:      { x: 50, y:  8, zoom: 7 },
  ethmoid:       { x: 50, y:  9, zoom: 9 },

  // ─── FACIAL BONES (14) ──────────────────────────────────
  mandible:              { x: 50, y: 12, zoom: 6 },
  "maxilla-l":           { x: 48, y: 10, zoom: 8 },
  "maxilla-r":           { x: 52, y: 10, zoom: 8 },
  "zygomatic-l":         { x: 44, y: 10, zoom: 8 },
  "zygomatic-r":         { x: 56, y: 10, zoom: 8 },
  "nasal-l":             { x: 48, y:  9, zoom: 10 },
  "nasal-r":             { x: 52, y:  9, zoom: 10 },
  "lacrimal-l":          { x: 47, y:  9, zoom: 11 },
  "lacrimal-r":          { x: 53, y:  9, zoom: 11 },
  "palatine-l":          { x: 48, y: 11, zoom: 10 },
  "palatine-r":          { x: 52, y: 11, zoom: 10 },
  "inf-nasal-concha-l":  { x: 47, y: 10, zoom: 10 },
  "inf-nasal-concha-r":  { x: 53, y: 10, zoom: 10 },
  vomer:                 { x: 50, y: 10, zoom: 10 },

  // ─── AXIAL — HYOID (1) ──────────────────────────────────
  hyoid: { x: 50, y: 14, zoom: 8 },

  // ─── EAR OSSICLES (6) ───────────────────────────────────
  "malleus-l":  { x: 42, y:  6, zoom: 12 },
  "malleus-r":  { x: 58, y:  6, zoom: 12 },
  "incus-l":    { x: 42, y:  6, zoom: 12 },
  "incus-r":    { x: 58, y:  6, zoom: 12 },
  "stapes-l":   { x: 42, y:  7, zoom: 12 },
  "stapes-r":   { x: 58, y:  7, zoom: 12 },

  // ─── VERTEBRAL COLUMN — CERVICAL (7) ────────────────────
  "c1-atlas": { x: 50, y: 16, zoom: 8 },
  "c2-axis":  { x: 50, y: 18, zoom: 8 },
  c3:         { x: 50, y: 20, zoom: 8 },
  c4:         { x: 50, y: 22, zoom: 8 },
  c5:         { x: 50, y: 24, zoom: 8 },
  c6:         { x: 50, y: 26, zoom: 8 },
  c7:         { x: 50, y: 28, zoom: 8 },

  // ─── VERTEBRAL COLUMN — THORACIC (12) ───────────────────
  t1:  { x: 50, y: 29, zoom: 7 },
  t2:  { x: 50, y: 30, zoom: 7 },
  t3:  { x: 50, y: 31, zoom: 7 },
  t4:  { x: 50, y: 33, zoom: 7 },
  t5:  { x: 50, y: 34, zoom: 7 },
  t6:  { x: 50, y: 35, zoom: 7 },
  t7:  { x: 50, y: 36, zoom: 7 },
  t8:  { x: 50, y: 37, zoom: 7 },
  t9:  { x: 50, y: 38, zoom: 7 },
  t10: { x: 50, y: 39, zoom: 7 },
  t11: { x: 50, y: 40, zoom: 7 },
  t12: { x: 50, y: 41, zoom: 7 },

  // ─── VERTEBRAL COLUMN — LUMBAR (5) ──────────────────────
  l1: { x: 50, y: 43, zoom: 7 },
  l2: { x: 50, y: 45, zoom: 7 },
  l3: { x: 50, y: 47, zoom: 7 },
  l4: { x: 50, y: 49, zoom: 7 },
  l5: { x: 50, y: 51, zoom: 7 },

  // ─── VERTEBRAL COLUMN — SACRUM & COCCYX ─────────────────
  sacrum: { x: 50, y: 55, zoom: 5 },
  coccyx: { x: 50, y: 59, zoom: 8 },

  // ─── THORAX — STERNUM (1) ───────────────────────────────
  sternum: { x: 50, y: 30, zoom: 5 },

  // ─── THORAX — RIBS (24) ─────────────────────────────────
  "rib-l-1":  { x: 44, y: 25, zoom: 6 },
  "rib-r-1":  { x: 56, y: 25, zoom: 6 },
  "rib-l-2":  { x: 43, y: 27, zoom: 5 },
  "rib-r-2":  { x: 57, y: 27, zoom: 5 },
  "rib-l-3":  { x: 42, y: 28, zoom: 5 },
  "rib-r-3":  { x: 58, y: 28, zoom: 5 },
  "rib-l-4":  { x: 41, y: 30, zoom: 5 },
  "rib-r-4":  { x: 59, y: 30, zoom: 5 },
  "rib-l-5":  { x: 40, y: 31, zoom: 5 },
  "rib-r-5":  { x: 60, y: 31, zoom: 5 },
  "rib-l-6":  { x: 39, y: 32, zoom: 5 },
  "rib-r-6":  { x: 61, y: 32, zoom: 5 },
  "rib-l-7":  { x: 38, y: 34, zoom: 5 },
  "rib-r-7":  { x: 62, y: 34, zoom: 5 },
  "rib-l-8":  { x: 38, y: 35, zoom: 5 },
  "rib-r-8":  { x: 62, y: 35, zoom: 5 },
  "rib-l-9":  { x: 37, y: 36, zoom: 5 },
  "rib-r-9":  { x: 63, y: 36, zoom: 5 },
  "rib-l-10": { x: 36, y: 38, zoom: 5 },
  "rib-r-10": { x: 64, y: 38, zoom: 5 },
  "rib-l-11": { x: 36, y: 39, zoom: 5 },
  "rib-r-11": { x: 64, y: 39, zoom: 5 },
  "rib-l-12": { x: 35, y: 41, zoom: 6 },
  "rib-r-12": { x: 65, y: 41, zoom: 6 },

  // ─── PECTORAL GIRDLE (4) ────────────────────────────────
  "clavicle-l": { x: 35, y: 20, zoom: 5 },
  "clavicle-r": { x: 65, y: 20, zoom: 5 },
  "scapula-l":  { x: 27, y: 25, zoom: 4 },
  "scapula-r":  { x: 73, y: 25, zoom: 4 },

  // ─── UPPER LIMB — LONG BONES (6) ────────────────────────
  "humerus-l": { x: 18, y: 33, zoom: 4 },
  "humerus-r": { x: 82, y: 33, zoom: 4 },
  "radius-l":  { x: 17, y: 44, zoom: 4 },
  "radius-r":  { x: 83, y: 44, zoom: 4 },
  "ulna-l":    { x: 19, y: 44, zoom: 4 },
  "ulna-r":    { x: 81, y: 44, zoom: 4 },

  // ─── CARPALS (16) ───────────────────────────────────────
  "scaphoid-l":   { x: 16, y: 53, zoom: 8 },
  "scaphoid-r":   { x: 84, y: 53, zoom: 8 },
  "lunate-l":     { x: 16, y: 53, zoom: 8 },
  "lunate-r":     { x: 84, y: 53, zoom: 8 },
  "triquetrum-l": { x: 15, y: 53, zoom: 8 },
  "triquetrum-r": { x: 85, y: 53, zoom: 8 },
  "pisiform-l":   { x: 14, y: 54, zoom: 8 },
  "pisiform-r":   { x: 86, y: 54, zoom: 8 },
  "trapezium-l":  { x: 17, y: 54, zoom: 8 },
  "trapezium-r":  { x: 83, y: 54, zoom: 8 },
  "trapezoid-l":  { x: 16, y: 54, zoom: 8 },
  "trapezoid-r":  { x: 84, y: 54, zoom: 8 },
  "capitate-l":   { x: 15, y: 54, zoom: 8 },
  "capitate-r":   { x: 85, y: 54, zoom: 8 },
  "hamate-l":     { x: 14, y: 55, zoom: 8 },
  "hamate-r":     { x: 86, y: 55, zoom: 8 },

  // ─── METACARPALS (10) ───────────────────────────────────
  "metacarpal-1-l": { x: 17, y: 56, zoom: 8 },
  "metacarpal-1-r": { x: 83, y: 56, zoom: 8 },
  "metacarpal-2-l": { x: 16, y: 56, zoom: 8 },
  "metacarpal-2-r": { x: 84, y: 56, zoom: 8 },
  "metacarpal-3-l": { x: 15, y: 56, zoom: 8 },
  "metacarpal-3-r": { x: 85, y: 56, zoom: 8 },
  "metacarpal-4-l": { x: 14, y: 56, zoom: 8 },
  "metacarpal-4-r": { x: 86, y: 56, zoom: 8 },
  "metacarpal-5-l": { x: 13, y: 56, zoom: 8 },
  "metacarpal-5-r": { x: 87, y: 56, zoom: 8 },

  // ─── HAND PHALANGES (28) ────────────────────────────────
  // Thumb (2 phalanges each hand)
  "phalanx-proximal-thumb-l":       { x: 17, y: 58, zoom: 9 },
  "phalanx-proximal-thumb-r":       { x: 83, y: 58, zoom: 9 },
  "phalanx-distal-thumb-l":         { x: 17, y: 59, zoom: 9 },
  "phalanx-distal-thumb-r":         { x: 83, y: 59, zoom: 9 },
  // Index finger (3 phalanges)
  "phalanx-proximal-index-finger-l": { x: 16, y: 57, zoom: 9 },
  "phalanx-proximal-index-finger-r": { x: 84, y: 57, zoom: 9 },
  "phalanx-middle-index-finger-l":   { x: 16, y: 58, zoom: 9 },
  "phalanx-middle-index-finger-r":   { x: 84, y: 58, zoom: 9 },
  "phalanx-distal-index-finger-l":   { x: 16, y: 59, zoom: 9 },
  "phalanx-distal-index-finger-r":   { x: 84, y: 59, zoom: 9 },
  // Middle finger (3 phalanges)
  "phalanx-proximal-middle-finger-l": { x: 15, y: 57, zoom: 9 },
  "phalanx-proximal-middle-finger-r": { x: 85, y: 57, zoom: 9 },
  "phalanx-middle-middle-finger-l":   { x: 15, y: 58, zoom: 9 },
  "phalanx-middle-middle-finger-r":   { x: 85, y: 58, zoom: 9 },
  "phalanx-distal-middle-finger-l":   { x: 15, y: 59, zoom: 9 },
  "phalanx-distal-middle-finger-r":   { x: 85, y: 59, zoom: 9 },
  // Ring finger (3 phalanges)
  "phalanx-proximal-ring-finger-l":   { x: 14, y: 57, zoom: 9 },
  "phalanx-proximal-ring-finger-r":   { x: 86, y: 57, zoom: 9 },
  "phalanx-middle-ring-finger-l":     { x: 14, y: 58, zoom: 9 },
  "phalanx-middle-ring-finger-r":     { x: 86, y: 58, zoom: 9 },
  "phalanx-distal-ring-finger-l":     { x: 14, y: 59, zoom: 9 },
  "phalanx-distal-ring-finger-r":     { x: 86, y: 59, zoom: 9 },
  // Little finger (3 phalanges)
  "phalanx-proximal-little-finger-l": { x: 13, y: 57, zoom: 9 },
  "phalanx-proximal-little-finger-r": { x: 87, y: 57, zoom: 9 },
  "phalanx-middle-little-finger-l":   { x: 13, y: 58, zoom: 9 },
  "phalanx-middle-little-finger-r":   { x: 87, y: 58, zoom: 9 },
  "phalanx-distal-little-finger-l":   { x: 13, y: 59, zoom: 9 },
  "phalanx-distal-little-finger-r":   { x: 87, y: 59, zoom: 9 },

  // ─── PELVIC GIRDLE (2) ──────────────────────────────────
  "hipbone-l": { x: 40, y: 62, zoom: 4 },
  "hipbone-r": { x: 60, y: 62, zoom: 4 },

  // ─── LOWER LIMB — LONG BONES (8) ────────────────────────
  "femur-l":   { x: 41, y: 72, zoom: 3 },
  "femur-r":   { x: 59, y: 72, zoom: 3 },
  "patella-l": { x: 41, y: 80, zoom: 6 },
  "patella-r": { x: 59, y: 80, zoom: 6 },
  "tibia-l":   { x: 42, y: 85, zoom: 3 },
  "tibia-r":   { x: 58, y: 85, zoom: 3 },
  "fibula-l":  { x: 40, y: 85, zoom: 3 },
  "fibula-r":  { x: 60, y: 85, zoom: 3 },

  // ─── TARSALS (14) ───────────────────────────────────────
  "talus-l":                  { x: 41, y: 92, zoom: 7 },
  "talus-r":                  { x: 59, y: 92, zoom: 7 },
  "calcaneus-l":              { x: 40, y: 93, zoom: 7 },
  "calcaneus-r":              { x: 60, y: 93, zoom: 7 },
  "navicular-foot-l":         { x: 41, y: 93, zoom: 8 },
  "navicular-foot-r":         { x: 59, y: 93, zoom: 8 },
  "cuboid-l":                 { x: 42, y: 93, zoom: 8 },
  "cuboid-r":                 { x: 58, y: 93, zoom: 8 },
  "medial-cuneiform-l":       { x: 40, y: 94, zoom: 8 },
  "medial-cuneiform-r":       { x: 60, y: 94, zoom: 8 },
  "intermediate-cuneiform-l": { x: 41, y: 94, zoom: 8 },
  "intermediate-cuneiform-r": { x: 59, y: 94, zoom: 8 },
  "lateral-cuneiform-l":      { x: 42, y: 94, zoom: 8 },
  "lateral-cuneiform-r":      { x: 58, y: 94, zoom: 8 },

  // ─── METATARSALS (10) ───────────────────────────────────
  "metatarsal-1-l": { x: 40, y: 95, zoom: 8 },
  "metatarsal-1-r": { x: 60, y: 95, zoom: 8 },
  "metatarsal-2-l": { x: 41, y: 95, zoom: 8 },
  "metatarsal-2-r": { x: 59, y: 95, zoom: 8 },
  "metatarsal-3-l": { x: 42, y: 95, zoom: 8 },
  "metatarsal-3-r": { x: 58, y: 95, zoom: 8 },
  "metatarsal-4-l": { x: 43, y: 95, zoom: 8 },
  "metatarsal-4-r": { x: 57, y: 95, zoom: 8 },
  "metatarsal-5-l": { x: 44, y: 95, zoom: 8 },
  "metatarsal-5-r": { x: 56, y: 95, zoom: 8 },

  // ─── FOOT PHALANGES (28) ────────────────────────────────
  // Big toe (2 phalanges)
  "phalanx-proximal-big-toe-l": { x: 40, y: 97, zoom: 9 },
  "phalanx-proximal-big-toe-r": { x: 60, y: 97, zoom: 9 },
  "phalanx-distal-big-toe-l":   { x: 40, y: 98, zoom: 9 },
  "phalanx-distal-big-toe-r":   { x: 60, y: 98, zoom: 9 },
  // 2nd toe (3 phalanges)
  "phalanx-proximal-2nd-toe-l": { x: 41, y: 97, zoom: 9 },
  "phalanx-proximal-2nd-toe-r": { x: 59, y: 97, zoom: 9 },
  "phalanx-middle-2nd-toe-l":   { x: 41, y: 98, zoom: 9 },
  "phalanx-middle-2nd-toe-r":   { x: 59, y: 98, zoom: 9 },
  "phalanx-distal-2nd-toe-l":   { x: 41, y: 99, zoom: 9 },
  "phalanx-distal-2nd-toe-r":   { x: 59, y: 99, zoom: 9 },
  // 3rd toe (3 phalanges)
  "phalanx-proximal-3rd-toe-l": { x: 42, y: 97, zoom: 9 },
  "phalanx-proximal-3rd-toe-r": { x: 58, y: 97, zoom: 9 },
  "phalanx-middle-3rd-toe-l":   { x: 42, y: 98, zoom: 9 },
  "phalanx-middle-3rd-toe-r":   { x: 58, y: 98, zoom: 9 },
  "phalanx-distal-3rd-toe-l":   { x: 42, y: 99, zoom: 9 },
  "phalanx-distal-3rd-toe-r":   { x: 58, y: 99, zoom: 9 },
  // 4th toe (3 phalanges)
  "phalanx-proximal-4th-toe-l": { x: 43, y: 97, zoom: 9 },
  "phalanx-proximal-4th-toe-r": { x: 57, y: 97, zoom: 9 },
  "phalanx-middle-4th-toe-l":   { x: 43, y: 98, zoom: 9 },
  "phalanx-middle-4th-toe-r":   { x: 57, y: 98, zoom: 9 },
  "phalanx-distal-4th-toe-l":   { x: 43, y: 99, zoom: 9 },
  "phalanx-distal-4th-toe-r":   { x: 57, y: 99, zoom: 9 },
  // Little toe (3 phalanges)
  "phalanx-proximal-little-toe-l": { x: 44, y: 97, zoom: 9 },
  "phalanx-proximal-little-toe-r": { x: 56, y: 97, zoom: 9 },
  "phalanx-middle-little-toe-l":   { x: 44, y: 98, zoom: 9 },
  "phalanx-middle-little-toe-r":   { x: 56, y: 98, zoom: 9 },
  "phalanx-distal-little-toe-l":   { x: 44, y: 99, zoom: 9 },
  "phalanx-distal-little-toe-r":   { x: 56, y: 99, zoom: 9 },
};

/**
 * Returns the atlas style for a given bone ID.
 * Tries the exact ID first, then strips left/right suffixes for a base match.
 */
export function getBoneAtlasStyle(boneId: string): BoneAtlasStyle | null {
  if (boneStyles[boneId]) return boneStyles[boneId];
  // Try stripping -l / -r suffix
  const base = boneId.replace(/-(l|r)$/, "");
  if (boneStyles[base]) return boneStyles[base];
  return null;
}
