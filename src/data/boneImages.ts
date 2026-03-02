// Public-domain anatomical illustrations from Gray's Anatomy (Wikimedia Commons)
// Mapped by bone ID or region for flashcard display.

const WIKI = "https://upload.wikimedia.org/wikipedia/commons/thumb";

// Specific bone images (Gray's Anatomy plates — public domain)
const boneImageMap: Record<string, string> = {
  // Cranium
  frontal: `${WIKI}/2/2b/Gray135.png/280px-Gray135.png`,
  parietal: `${WIKI}/1/17/Gray132.png/280px-Gray132.png`,
  occipital: `${WIKI}/5/50/Gray129.png/280px-Gray129.png`,
  temporal: `${WIKI}/6/63/Gray137.png/280px-Gray137.png`,
  sphenoid: `${WIKI}/0/08/Gray145.png/280px-Gray145.png`,
  ethmoid: `${WIKI}/a/a0/Gray149.png/280px-Gray149.png`,

  // Face
  mandible: `${WIKI}/d/d0/Gray176.png/280px-Gray176.png`,
  maxilla: `${WIKI}/c/ce/Gray157.png/280px-Gray157.png`,
  zygomatic: `${WIKI}/1/11/Gray164.png/280px-Gray164.png`,
  nasal: `${WIKI}/4/49/Gray156.png/280px-Gray156.png`,
  lacrimal: `${WIKI}/6/63/Gray164.png/280px-Gray164.png`,
  palatine: `${WIKI}/6/6c/Gray168.png/280px-Gray168.png`,
  vomer: `${WIKI}/d/d0/Gray170.png/280px-Gray170.png`,

  // Vertebrae
  atlas: `${WIKI}/8/8c/Gray86.png/280px-Gray86.png`,
  axis: `${WIKI}/d/d3/Gray87.png/280px-Gray87.png`,

  // Thorax
  sternum: `${WIKI}/c/cd/Gray115.png/280px-Gray115.png`,

  // Upper limb
  humerus: `${WIKI}/e/e4/Gray207.png/280px-Gray207.png`,
  radius: `${WIKI}/6/69/Gray212.png/280px-Gray212.png`,
  ulna: `${WIKI}/f/f9/Gray213.png/280px-Gray213.png`,
  clavicle: `${WIKI}/0/0f/Gray200.png/280px-Gray200.png`,
  scapula: `${WIKI}/9/9a/Gray202.png/280px-Gray202.png`,

  // Lower limb
  femur: `${WIKI}/5/5a/Gray243.png/280px-Gray243.png`,
  tibia: `${WIKI}/0/01/Gray258.png/280px-Gray258.png`,
  fibula: `${WIKI}/1/16/Gray259.png/280px-Gray259.png`,
  patella: `${WIKI}/5/54/Gray256.png/280px-Gray256.png`,

  // Pelvic
  hipbone: `${WIKI}/1/18/Gray236.png/280px-Gray236.png`,
  sacrum: `${WIKI}/e/ef/Gray95.png/280px-Gray95.png`,
  coccyx: `${WIKI}/4/49/Gray100.png/280px-Gray100.png`,

  // Foot
  calcaneus: `${WIKI}/4/4c/Gray268.png/280px-Gray268.png`,
  talus: `${WIKI}/3/3e/Gray269.png/280px-Gray269.png`,

  // Hand (carpals overview)
  scaphoid: `${WIKI}/0/0e/Gray219.png/280px-Gray219.png`,
  lunate: `${WIKI}/0/0e/Gray219.png/280px-Gray219.png`,
  triquetrum: `${WIKI}/0/0e/Gray219.png/280px-Gray219.png`,
  pisiform: `${WIKI}/0/0e/Gray219.png/280px-Gray219.png`,
  trapezium: `${WIKI}/0/0e/Gray219.png/280px-Gray219.png`,
  trapezoid: `${WIKI}/0/0e/Gray219.png/280px-Gray219.png`,
  capitate: `${WIKI}/0/0e/Gray219.png/280px-Gray219.png`,
  hamate: `${WIKI}/0/0e/Gray219.png/280px-Gray219.png`,

  // Hyoid
  hyoid: `${WIKI}/a/ac/Gray186.png/280px-Gray186.png`,
};

// Region-based fallback images
const regionFallback: Record<string, string> = {
  Cranium: `${WIKI}/e/ec/Gray188.png/280px-Gray188.png`,
  Face: `${WIKI}/c/ce/Gray157.png/280px-Gray157.png`,
  "Vertebral Column": `${WIKI}/5/5e/Gray_111_-_Vertebral_column-coloured.png/220px-Gray_111_-_Vertebral_column-coloured.png`,
  Thorax: `${WIKI}/c/cd/Gray115.png/280px-Gray115.png`,
  "Pectoral Girdle": `${WIKI}/9/9a/Gray202.png/280px-Gray202.png`,
  "Upper Limb": `${WIKI}/0/0e/Gray219.png/280px-Gray219.png`,
  "Pelvic Girdle": `${WIKI}/1/18/Gray236.png/280px-Gray236.png`,
  "Lower Limb": `${WIKI}/5/5a/Gray243.png/280px-Gray243.png`,
  Axial: `${WIKI}/a/ac/Gray186.png/280px-Gray186.png`,
  "Ear Ossicles": `${WIKI}/6/6d/Gray919.png/280px-Gray919.png`,
};

/**
 * Returns an illustration URL for a given bone.
 * Tries exact id match first (stripping -l/-r suffix), then falls back to region.
 */
export function getBoneImage(id: string, region: string): string | null {
  // Strip left/right suffix for lookup
  const baseId = id.replace(/-(l|r)$/, "");
  // Also try stripping numbered suffixes for ribs, vertebrae, phalanges etc.
  const rootId = baseId.replace(/-\d+$/, "").replace(/-(distal|middle|proximal).*/, "");

  return boneImageMap[baseId] ?? boneImageMap[rootId] ?? regionFallback[region] ?? null;
}
