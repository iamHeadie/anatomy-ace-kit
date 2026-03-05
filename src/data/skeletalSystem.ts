/**
 * skeletalSystem.ts — TA98-standardized bone data
 * 
 * Single source of truth derived from Terminologia Anatomica 1998 (TA98).
 * Bilateral bones are expanded into Left/Right pairs.
 * Position data maps to the skeleton.glb world-space coordinates.
 */

import bonesJson from "./bones-ta98.json";

export interface TA98Bone {
  id: string;
  name_en: string;
  name_la: string;
  region: string;
  subregion: string;
  bilateral: boolean;
}

export interface BonePart {
  id: string;
  name: string;
  latinName: string;
  system: string;
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
}

// ── Raw TA98 data ──────────────────────────────────────────────────────────
const rawBones: TA98Bone[] = (bonesJson as { bones: TA98Bone[] }).bones;

// ── Position database — maps TA98 IDs to world-space coordinates ──────────
// These match the normalised skeleton.glb (7-unit height, pelvis at origin)
const positionDb: Record<string, { pos: [number, number, number]; scale: [number, number, number] }> = {
  // Cranial bones
  "A02.1.02.001": { pos: [0, 4.1, 0.25], scale: [0.5, 0.3, 0.1] },       // Frontal
  "A02.1.02.101": { pos: [0.2, 4.2, -0.05], scale: [0.25, 0.3, 0.25] },   // Parietal (L)
  "A02.1.02.201": { pos: [0, 3.9, -0.35], scale: [0.4, 0.35, 0.1] },      // Occipital
  "A02.1.02.301": { pos: [0.4, 3.8, -0.1], scale: [0.15, 0.25, 0.2] },    // Temporal (L)
  "A02.1.02.401": { pos: [0, 3.7, 0.05], scale: [0.45, 0.1, 0.25] },      // Sphenoid
  "A02.1.02.501": { pos: [0, 3.75, 0.18], scale: [0.15, 0.1, 0.1] },      // Ethmoid
  // Facial bones
  "A02.1.03.001": { pos: [0.04, 3.6, 0.32], scale: [0.04, 0.08, 0.03] },  // Nasal (L)
  "A02.1.03.101": { pos: [0.15, 3.6, 0.22], scale: [0.03, 0.04, 0.02] },  // Lacrimal (L)
  "A02.1.03.201": { pos: [0.3, 3.5, 0.25], scale: [0.12, 0.12, 0.08] },   // Zygomatic (L)
  "A02.1.03.301": { pos: [0.1, 3.4, 0.2], scale: [0.15, 0.15, 0.12] },    // Maxilla (L)
  "A02.1.03.401": { pos: [0.08, 3.35, 0.05], scale: [0.08, 0.06, 0.06] }, // Palatine (L)
  "A02.1.03.501": { pos: [0.08, 3.5, 0.18], scale: [0.06, 0.04, 0.04] },  // Inf nasal concha (L)
  "A02.1.03.601": { pos: [0, 3.5, 0.15], scale: [0.02, 0.1, 0.08] },      // Vomer
  "A02.1.03.701": { pos: [0, 3.2, 0.15], scale: [0.45, 0.15, 0.3] },      // Mandible
  "A02.1.00.027": { pos: [0, 3.05, 0.15], scale: [0.12, 0.05, 0.06] },    // Hyoid
  // Auditory ossicles
  "A02.1.06.001": { pos: [0.42, 3.82, -0.08], scale: [0.015, 0.02, 0.015] }, // Malleus (L)
  "A02.1.06.002": { pos: [0.43, 3.82, -0.1], scale: [0.012, 0.015, 0.012] }, // Incus (L)
  "A02.1.06.003": { pos: [0.44, 3.82, -0.12], scale: [0.01, 0.01, 0.01] },   // Stapes (L)
  // Cervical vertebrae
  "A02.2.02.001": { pos: [0, 3.0, -0.1], scale: [0.15, 0.04, 0.15] },     // Atlas C1
  "A02.2.02.101": { pos: [0, 2.95, -0.1], scale: [0.14, 0.04, 0.14] },    // Axis C2
  "A02.2.02.201": { pos: [0, 2.88, -0.1], scale: [0.13, 0.04, 0.13] },    // C3
  "A02.2.02.202": { pos: [0, 2.81, -0.1], scale: [0.13, 0.04, 0.13] },    // C4
  "A02.2.02.203": { pos: [0, 2.74, -0.12], scale: [0.13, 0.04, 0.13] },   // C5
  "A02.2.02.204": { pos: [0, 2.67, -0.12], scale: [0.13, 0.04, 0.13] },   // C6
  "A02.2.02.301": { pos: [0, 2.6, -0.12], scale: [0.14, 0.04, 0.14] },    // C7
  // Thoracic vertebrae
  "A02.2.03.001": { pos: [0, 2.5, -0.15], scale: [0.15, 0.04, 0.15] },    // T1
  "A02.2.03.002": { pos: [0, 2.38, -0.17], scale: [0.15, 0.04, 0.15] },   // T2
  "A02.2.03.003": { pos: [0, 2.26, -0.18], scale: [0.16, 0.04, 0.16] },   // T3
  "A02.2.03.004": { pos: [0, 2.14, -0.19], scale: [0.16, 0.04, 0.16] },   // T4
  "A02.2.03.005": { pos: [0, 2.02, -0.2], scale: [0.17, 0.04, 0.17] },    // T5
  "A02.2.03.006": { pos: [0, 1.9, -0.21], scale: [0.17, 0.04, 0.17] },    // T6
  "A02.2.03.007": { pos: [0, 1.78, -0.22], scale: [0.17, 0.04, 0.17] },   // T7
  "A02.2.03.008": { pos: [0, 1.66, -0.22], scale: [0.17, 0.04, 0.17] },   // T8
  "A02.2.03.009": { pos: [0, 1.54, -0.22], scale: [0.18, 0.04, 0.18] },   // T9
  "A02.2.03.010": { pos: [0, 1.42, -0.22], scale: [0.18, 0.04, 0.18] },   // T10
  "A02.2.03.011": { pos: [0, 1.3, -0.22], scale: [0.18, 0.04, 0.18] },    // T11
  "A02.2.03.012": { pos: [0, 1.18, -0.22], scale: [0.18, 0.04, 0.18] },   // T12
  // Lumbar vertebrae
  "A02.2.04.001": { pos: [0, 1.04, -0.2], scale: [0.2, 0.05, 0.18] },     // L1
  "A02.2.04.002": { pos: [0, 0.9, -0.18], scale: [0.2, 0.05, 0.18] },     // L2
  "A02.2.04.003": { pos: [0, 0.76, -0.16], scale: [0.22, 0.05, 0.2] },    // L3
  "A02.2.04.004": { pos: [0, 0.62, -0.14], scale: [0.22, 0.05, 0.2] },    // L4
  "A02.2.04.005": { pos: [0, 0.48, -0.12], scale: [0.22, 0.05, 0.2] },    // L5
  // Sacrum & Coccyx
  "A02.2.05.001": { pos: [0, 0.2, -0.15], scale: [0.2, 0.2, 0.12] },      // Sacrum
  "A02.2.06.001": { pos: [0, -0.05, -0.12], scale: [0.08, 0.08, 0.06] },  // Coccyx
  // Thoracic cage
  "A02.3.01.001": { pos: [0, 2.1, 0.1], scale: [0.1, 0.35, 0.06] },       // Sternum
  "A02.3.02.001": { pos: [0.2, 2.45, 0], scale: [0.3, 0.04, 0.2] },       // Rib 1 (L)
  "A02.3.02.002": { pos: [0.25, 2.35, 0.02], scale: [0.35, 0.04, 0.22] }, // Rib 2
  "A02.3.02.003": { pos: [0.28, 2.25, 0.03], scale: [0.38, 0.04, 0.24] }, // Rib 3
  "A02.3.02.004": { pos: [0.3, 2.15, 0.04], scale: [0.4, 0.04, 0.25] },   // Rib 4
  "A02.3.02.005": { pos: [0.32, 2.05, 0.04], scale: [0.42, 0.04, 0.26] }, // Rib 5
  "A02.3.02.006": { pos: [0.33, 1.95, 0.04], scale: [0.43, 0.04, 0.27] }, // Rib 6
  "A02.3.02.007": { pos: [0.34, 1.85, 0.03], scale: [0.44, 0.04, 0.27] }, // Rib 7
  "A02.3.02.008": { pos: [0.33, 1.75, 0.02], scale: [0.42, 0.04, 0.26] }, // Rib 8
  "A02.3.02.009": { pos: [0.31, 1.65, 0.01], scale: [0.4, 0.04, 0.25] },  // Rib 9
  "A02.3.02.010": { pos: [0.28, 1.55, 0], scale: [0.38, 0.04, 0.24] },    // Rib 10
  "A02.3.02.011": { pos: [0.22, 1.45, -0.02], scale: [0.3, 0.04, 0.2] },  // Rib 11
  "A02.3.02.012": { pos: [0.18, 1.38, -0.04], scale: [0.25, 0.04, 0.18] },// Rib 12
  // Upper limb
  "A02.4.01.001": { pos: [0.5, 2.5, 0.05], scale: [0.35, 0.04, 0.06] },   // Clavicle (L)
  "A02.4.01.002": { pos: [0.55, 2.3, -0.15], scale: [0.2, 0.25, 0.08] },  // Scapula (L)
  "A02.4.02.001": { pos: [0.7, 1.65, -0.02], scale: [0.06, 0.6, 0.06] },  // Humerus (L)
  "A02.4.03.001": { pos: [0.65, 0.8, 0.05], scale: [0.04, 0.5, 0.04] },   // Radius (L)
  "A02.4.03.002": { pos: [0.75, 0.8, -0.02], scale: [0.04, 0.5, 0.04] },  // Ulna (L)
  // Carpals
  "A02.4.08.001": { pos: [0.6, 0.25, 0.06], scale: [0.03, 0.02, 0.02] },  // Scaphoid (L)
  "A02.4.08.002": { pos: [0.62, 0.25, 0.04], scale: [0.03, 0.02, 0.02] }, // Lunate (L)
  "A02.4.08.003": { pos: [0.64, 0.25, 0.02], scale: [0.03, 0.02, 0.02] }, // Triquetrum (L)
  "A02.4.08.004": { pos: [0.66, 0.27, 0.02], scale: [0.02, 0.02, 0.02] }, // Pisiform (L)
  "A02.4.08.005": { pos: [0.58, 0.21, 0.06], scale: [0.03, 0.02, 0.02] }, // Trapezium (L)
  "A02.4.08.006": { pos: [0.6, 0.21, 0.05], scale: [0.03, 0.02, 0.02] },  // Trapezoid (L)
  "A02.4.08.007": { pos: [0.62, 0.21, 0.04], scale: [0.03, 0.02, 0.02] }, // Capitate (L)
  "A02.4.08.008": { pos: [0.64, 0.21, 0.02], scale: [0.03, 0.02, 0.02] }, // Hamate (L)
  // Metacarpals
  "A02.4.09.001": { pos: [0.55, 0.12, 0.08], scale: [0.02, 0.08, 0.02] }, // MC1 (L)
  "A02.4.09.002": { pos: [0.58, 0.12, 0.06], scale: [0.02, 0.08, 0.02] }, // MC2
  "A02.4.09.003": { pos: [0.6, 0.12, 0.05], scale: [0.02, 0.08, 0.02] },  // MC3
  "A02.4.09.004": { pos: [0.62, 0.12, 0.04], scale: [0.02, 0.08, 0.02] }, // MC4
  "A02.4.09.005": { pos: [0.64, 0.12, 0.03], scale: [0.02, 0.08, 0.02] }, // MC5
  // Hand phalanges (approximate positions)
  "A02.4.10.001": { pos: [0.52, 0.02, 0.1], scale: [0.015, 0.04, 0.015] },   // Prox thumb
  "A02.4.10.002": { pos: [0.50, -0.04, 0.12], scale: [0.015, 0.03, 0.015] }, // Dist thumb
  "A02.4.10.011": { pos: [0.57, 0.02, 0.07], scale: [0.015, 0.04, 0.015] },  // Prox index
  "A02.4.10.012": { pos: [0.56, -0.04, 0.08], scale: [0.015, 0.03, 0.015] }, // Mid index
  "A02.4.10.013": { pos: [0.55, -0.08, 0.09], scale: [0.015, 0.02, 0.015] }, // Dist index
  "A02.4.10.021": { pos: [0.59, 0.02, 0.06], scale: [0.015, 0.04, 0.015] },  // Prox middle
  "A02.4.10.022": { pos: [0.59, -0.04, 0.06], scale: [0.015, 0.03, 0.015] }, // Mid middle
  "A02.4.10.023": { pos: [0.59, -0.09, 0.06], scale: [0.015, 0.02, 0.015] }, // Dist middle
  "A02.4.10.031": { pos: [0.61, 0.02, 0.05], scale: [0.015, 0.04, 0.015] },  // Prox ring
  "A02.4.10.032": { pos: [0.61, -0.04, 0.05], scale: [0.015, 0.03, 0.015] }, // Mid ring
  "A02.4.10.033": { pos: [0.61, -0.08, 0.05], scale: [0.015, 0.02, 0.015] }, // Dist ring
  "A02.4.10.041": { pos: [0.63, 0.02, 0.04], scale: [0.015, 0.04, 0.015] },  // Prox little
  "A02.4.10.042": { pos: [0.63, -0.03, 0.04], scale: [0.015, 0.03, 0.015] }, // Mid little
  "A02.4.10.043": { pos: [0.63, -0.06, 0.04], scale: [0.015, 0.02, 0.015] }, // Dist little
  // Lower limb
  "A02.5.01.001": { pos: [0.25, 0.15, -0.05], scale: [0.25, 0.25, 0.15] },  // Hip bone (L)
  "A02.5.01.101": { pos: [0.28, 0.3, -0.05], scale: [0.2, 0.2, 0.12] },     // Ilium (L)
  "A02.5.01.201": { pos: [0.22, 0.0, -0.08], scale: [0.12, 0.12, 0.1] },    // Ischium (L)
  "A02.5.01.301": { pos: [0.15, 0.05, 0.02], scale: [0.1, 0.08, 0.06] },    // Pubis (L)
  "A02.5.02.001": { pos: [0.25, -0.8, -0.02], scale: [0.06, 0.8, 0.06] },   // Femur (L)
  "A02.5.02.002": { pos: [0.25, -1.45, 0.08], scale: [0.06, 0.06, 0.04] },  // Patella (L)
  "A02.5.06.001": { pos: [0.22, -2.05, -0.02], scale: [0.05, 0.7, 0.05] },  // Tibia (L)
  "A02.5.06.002": { pos: [0.3, -2.05, -0.04], scale: [0.03, 0.65, 0.03] },  // Fibula (L)
  // Tarsals
  "A02.5.10.001": { pos: [0.22, -2.7, -0.08], scale: [0.05, 0.04, 0.08] },  // Calcaneus (L)
  "A02.5.10.002": { pos: [0.22, -2.65, -0.02], scale: [0.04, 0.04, 0.04] }, // Talus (L)
  "A02.5.10.003": { pos: [0.22, -2.68, 0.04], scale: [0.03, 0.03, 0.03] },  // Navicular (L)
  "A02.5.10.004": { pos: [0.2, -2.7, 0.08], scale: [0.03, 0.02, 0.03] },    // Med cuneiform (L)
  "A02.5.10.005": { pos: [0.22, -2.7, 0.08], scale: [0.02, 0.02, 0.03] },   // Int cuneiform (L)
  "A02.5.10.006": { pos: [0.24, -2.7, 0.08], scale: [0.02, 0.02, 0.03] },   // Lat cuneiform (L)
  "A02.5.10.007": { pos: [0.26, -2.7, 0.06], scale: [0.03, 0.02, 0.04] },   // Cuboid (L)
  // Metatarsals
  "A02.5.11.001": { pos: [0.18, -2.75, 0.14], scale: [0.02, 0.06, 0.02] },  // MT1 (L)
  "A02.5.11.002": { pos: [0.2, -2.75, 0.14], scale: [0.02, 0.06, 0.02] },   // MT2
  "A02.5.11.003": { pos: [0.22, -2.75, 0.14], scale: [0.02, 0.06, 0.02] },  // MT3
  "A02.5.11.004": { pos: [0.24, -2.75, 0.13], scale: [0.02, 0.06, 0.02] },  // MT4
  "A02.5.11.005": { pos: [0.26, -2.75, 0.12], scale: [0.02, 0.06, 0.02] },  // MT5
  // Foot phalanges
  "A02.5.12.001": { pos: [0.17, -2.8, 0.2], scale: [0.015, 0.04, 0.015] },  // Prox great toe
  "A02.5.12.002": { pos: [0.17, -2.82, 0.24], scale: [0.015, 0.03, 0.015] },// Dist great toe
  "A02.5.12.011": { pos: [0.2, -2.8, 0.2], scale: [0.015, 0.04, 0.015] },   // Prox 2nd toe
  "A02.5.12.012": { pos: [0.2, -2.82, 0.23], scale: [0.015, 0.03, 0.015] }, // Mid 2nd toe
  "A02.5.12.013": { pos: [0.2, -2.83, 0.25], scale: [0.015, 0.02, 0.015] }, // Dist 2nd toe
  "A02.5.12.021": { pos: [0.22, -2.8, 0.2], scale: [0.015, 0.04, 0.015] },  // Prox 3rd toe
  "A02.5.12.022": { pos: [0.22, -2.82, 0.22], scale: [0.015, 0.03, 0.015] },// Mid 3rd toe
  "A02.5.12.023": { pos: [0.22, -2.83, 0.24], scale: [0.015, 0.02, 0.015] },// Dist 3rd toe
  "A02.5.12.031": { pos: [0.24, -2.8, 0.19], scale: [0.015, 0.04, 0.015] }, // Prox 4th toe
  "A02.5.12.032": { pos: [0.24, -2.82, 0.21], scale: [0.015, 0.03, 0.015] },// Mid 4th toe
  "A02.5.12.033": { pos: [0.24, -2.83, 0.23], scale: [0.015, 0.02, 0.015] },// Dist 4th toe
  "A02.5.12.041": { pos: [0.26, -2.8, 0.18], scale: [0.015, 0.04, 0.015] }, // Prox 5th toe
  "A02.5.12.042": { pos: [0.26, -2.82, 0.2], scale: [0.015, 0.03, 0.015] }, // Mid 5th toe
  "A02.5.12.043": { pos: [0.26, -2.83, 0.22], scale: [0.015, 0.02, 0.015] },// Dist 5th toe
};

// Default position/scale for any bone not explicitly mapped
const DEFAULT_POS: [number, number, number] = [0, 1, 0];
const DEFAULT_SCALE: [number, number, number] = [0.1, 0.1, 0.1];

// ── Description generator based on TA98 metadata ─────────────────────────
function generateDescription(bone: TA98Bone): string {
  const bilateral = bone.bilateral ? " It is a paired (bilateral) bone." : " It is an unpaired bone.";
  return `The ${bone.name_en} (${bone.name_la}) is located in the ${bone.subregion.toLowerCase()} of the ${bone.region.toLowerCase()}.${bilateral}`;
}

// ── Generate facts from TA98 data ─────────────────────────────────────────
function generateFacts(bone: TA98Bone): string[] {
  const facts: string[] = [];
  facts.push(`Region: ${bone.region}`);
  facts.push(`Subregion: ${bone.subregion}`);
  if (bone.bilateral) facts.push("Bilateral (paired) bone");
  else facts.push("Unpaired (midline) bone");
  facts.push(`TA98 Code: ${bone.id}`);
  return facts;
}

// ── Expand TA98 data into BonePart array ─────────────────────────────────
function expandBones(): BonePart[] {
  const parts: BonePart[] = [];

  for (const bone of rawBones) {
    const posData = positionDb[bone.id];
    const basePos = posData?.pos ?? DEFAULT_POS;
    const baseScale = posData?.scale ?? DEFAULT_SCALE;

    if (bone.bilateral) {
      // Left
      const leftId = `${bone.id}-L`;
      const leftPos: [number, number, number] = [Math.abs(basePos[0]), basePos[1], basePos[2]];
      parts.push({
        id: leftId,
        name: `Left ${bone.name_en}`,
        latinName: `${bone.name_la} (sinister)`,
        system: "Skeletal",
        region: bone.region,
        subregion: bone.subregion,
        description: generateDescription(bone),
        position: leftPos,
        scale: baseScale,
        color: "#d4b896",
        facts: generateFacts(bone),
        connections: [],
        ta98Id: bone.id,
        bilateral: true,
        side: "left",
      });
      // Right (mirror X)
      const rightId = `${bone.id}-R`;
      const rightPos: [number, number, number] = [-Math.abs(basePos[0]), basePos[1], basePos[2]];
      parts.push({
        id: rightId,
        name: `Right ${bone.name_en}`,
        latinName: `${bone.name_la} (dexter)`,
        system: "Skeletal",
        region: bone.region,
        subregion: bone.subregion,
        description: generateDescription(bone),
        position: rightPos,
        scale: baseScale,
        color: "#d4b896",
        facts: generateFacts(bone),
        connections: [],
        ta98Id: bone.id,
        bilateral: true,
        side: "right",
      });
    } else {
      parts.push({
        id: bone.id,
        name: bone.name_en,
        latinName: bone.name_la,
        system: "Skeletal",
        region: bone.region,
        subregion: bone.subregion,
        description: generateDescription(bone),
        position: basePos,
        scale: baseScale,
        color: "#d4b896",
        facts: generateFacts(bone),
        connections: [],
        ta98Id: bone.id,
        bilateral: false,
      });
    }
  }

  return parts;
}

export const skeletalParts: BonePart[] = expandBones();

// ── Unique regions & subregions for filtering ─────────────────────────────
export const boneRegions: string[] = [...new Set(rawBones.map((b) => b.region))];
export const boneSubregions: string[] = [...new Set(rawBones.map((b) => b.subregion))];

// ── Raw TA98 bones (unexpanded) for quiz/flashcard generation ─────────────
export const ta98Bones: TA98Bone[] = rawBones;

// ── Body systems (for sidebar) ────────────────────────────────────────────
export const bodySystems = [
  { id: "skeletal", name: "Skeletal", icon: "🦴", color: "bone", partCount: skeletalParts.length },
  { id: "muscular", name: "Muscular", icon: "💪", color: "muscle", partCount: 0 },
  { id: "nervous", name: "Nervous", icon: "⚡", color: "nerve", partCount: 0 },
  { id: "circulatory", name: "Circulatory", icon: "❤️", color: "destructive", partCount: 0 },
  { id: "respiratory", name: "Respiratory", icon: "🫁", color: "primary", partCount: 0 },
  { id: "digestive", name: "Digestive", icon: "🫃", color: "secondary", partCount: 0 },
];

// ── Lookup helpers ────────────────────────────────────────────────────────
export function findBoneById(id: string): BonePart | undefined {
  return skeletalParts.find((b) => b.id === id);
}

export function findBonesByRegion(region: string): BonePart[] {
  return skeletalParts.filter((b) => b.region === region);
}

export function findBonesBySubregion(subregion: string): BonePart[] {
  return skeletalParts.filter((b) => b.subregion === subregion);
}
