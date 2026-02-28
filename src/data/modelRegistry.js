/**
 * modelRegistry.js — GLB Mesh Name → Skeletal System ID Mapping
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * SKELETON.GLB ANALYSIS (automated binary inspection, 2026-02-28)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The file at /public/models/skeleton.glb contains exactly 2 mesh nodes.
 * It was converted from OBJ via obj2gltf. Coordinates: Y-up, 1 unit ≈ 2.5 cm.
 * Full skeleton: Y −43 (soles of feet) → Y +24 (skull vertex), height ≈ 170 cm.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  Node name │ glTF mesh  │ Primitives │ event.object.name (Three.js)     │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │  sub01     │ sub01_1    │     3      │ 'sub01'  (all 3 child meshes)    │
 * │  sub02     │ sub02_1    │     1      │ 'sub02'                           │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * ── sub01  (25,947 + 15,812 + 6,553 = 48,312 total vertices) ────────────────
 *
 *   Primitive 0  material: Bones___Vray  (25,947 verts)
 *     FULL SKELETON BONES  –  compact cortical bone surface for every bone
 *     Y: −42.99 → +23.96  (entire height, feet to skull vertex)
 *     X: −10.86 → +10.68  (full lateral width, arms included)
 *     Z: −5.48  → +5.30   (front-to-back depth)
 *     ▸ Clicking this prim can land anywhere on the body.
 *     ▸ SkeletonModel uses the 3-D hit-point to resolve the nearest bone.
 *
 *   Primitive 1  material: White___Vray  (15,812 verts)
 *     SKULL + TEETH  –  cranial vault, facial bones, and dental arches
 *     Y: −9.37 → +17.73  (50 %–91 % of full height = hip to skull-base)
 *     X: −4.85 → +4.85
 *     Density peak at Y +14 → +18 (jaw / dental-arch level, X ≈ ±1.3):
 *       ▸ Upper teeth cluster  (maxillary dental arch)
 *       ▸ Skull-cap / cranial vault extending down to mandibular level
 *     Small cluster at Y −9.35 → −8.03, Z +0.55 → +1.69 (anterior):
 *       ▸ Pubic symphysis fibrocartilage  (anterior pelvis, ~33 verts)
 *
 *   Primitive 2  material: Brown___Vray  (6,553 verts)
 *     INTERVERTEBRAL DISCS  –  thoracolumbar fibrocartilage (T9 → L5)
 *     Y: −9.59 → −3.22  (50 %–59 %, upper lumbar / lower thoracic level)
 *     X: ±2.26  (narrow – ~5.7 cm radius, matches disc diameter)
 *     Z: −3.94 → −0.49  (posterior – along the vertebral column axis)
 *     Even density across the whole Y range → stacked disc segments
 *
 * ── sub02  (7,322 vertices) ──────────────────────────────────────────────────
 *
 *   Primitive 0  material: Bones___Vray  (7,322 verts)
 *     THORACIC CAGE  –  all 12 pairs of ribs + sternum
 *     Y: −10.86 → +13.95  (48 %–85 % of full height)
 *     X: −6.03 → +6.03   (≈ 30 cm wide at widest = T6 level ✓)
 *     Z: −4.73 → +3.28   (8 cm front-to-back ✓)
 *     Widest at Y +4 → +7 (T6–T8, mid-thorax) and narrows toward top/bottom.
 *     Lower extent Y ≈ −11 = tips of the floating 11th/12th ribs.
 *     Upper extent Y ≈ +14 = 1st rib / clavicular notch of manubrium.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * HOW BONE IDENTIFICATION WORKS (hybrid strategy in SkeletonModel.tsx)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Step 1 – boneMap lookup  (fast, for per-bone GLB models)
 *    If the clicked mesh's name IS in this map → return the exact bone.
 *
 *  Step 2 – position-based fallback  (for merged-mesh models like this one)
 *    If the mesh name is NOT in this map → use the 3-D world-space hit
 *    point from the raycast intersection and find the nearest BonePart
 *    by Euclidean distance from skeletalSystem.ts positions.
 *    This correctly resolves 'sub01' clicks to femur / skull / radius etc.
 *    and 'sub02' clicks to the nearest rib or sternum.
 *
 *  'sub01' and 'sub02' are intentionally absent from boneMap so the
 *  position-based fallback fires automatically.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * HOW TO ADD A FUTURE PER-BONE MODEL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  1. Run the app (npm run dev) and click a bone in the 3-D viewer.
 *  2. Open DevTools console → look for: [Anatomy] Clicked mesh: "Femur_L"
 *  3. Add an entry below:
 *       "Femur_L": "femur-l",
 *  4. The value must be a valid `id` from src/data/skeletalSystem.ts.
 *
 * ALL VALID BONE IDs (206 bones from skeletalSystem.ts):
 *
 *  Cranium:  frontal | parietal-l | parietal-r | occipital |
 *            temporal-l | temporal-r | sphenoid | ethmoid
 *  Face:     mandible | maxilla-l | maxilla-r | zygomatic-l | zygomatic-r |
 *            palatine-l | palatine-r | lacrimal-l | lacrimal-r |
 *            nasal-l | nasal-r | inferior-concha-l | inferior-concha-r | vomer
 *  Vertebrae: c1-atlas | c2-axis | c3 | c4 | c5 | c6 | c7 |
 *             t1–t12 | l1–l5 | sacrum | coccyx
 *  Thorax:   sternum | rib-1-l…rib-12-l | rib-1-r…rib-12-r
 *  Shoulder: clavicle-l | clavicle-r | scapula-l | scapula-r
 *  Arm:      humerus-l | humerus-r | radius-l | radius-r | ulna-l | ulna-r
 *  Wrist:    scaphoid-l/r | lunate-l/r | triquetrum-l/r | pisiform-l/r |
 *            trapezium-l/r | trapezoid-l/r | capitate-l/r | hamate-l/r
 *  Hand:     metacarpal-1…5-l/r  +  finger phalanges (l/r)
 *  Pelvis:   pelvis-l | pelvis-r
 *  Leg:      femur-l | femur-r | patella-l | patella-r |
 *            tibia-l | tibia-r | fibula-l | fibula-r
 *  Ankle:    calcaneus-l/r | talus-l/r | navicular-l/r | cuboid-l/r |
 *            cuneiform-med/int/lat-l/r
 *  Foot:     metatarsal-1…5-l/r  +  toe phalanges (l/r)
 */

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY BONE MAP
//
// Keys   = exact Three.js mesh names (what event.object.name returns).
// Values = bone IDs from src/data/skeletalSystem.ts.
//
// ⚠️  'sub01' and 'sub02' are INTENTIONALLY absent.
//     SkeletonModel.tsx falls back to 3-D hit-point → nearest-bone lookup
//     for any mesh name not present here.
// ─────────────────────────────────────────────────────────────────────────────
export const boneMap = {

  // ── CRANIUM ────────────────────────────────────────────────────────────────
  "Skull":              "frontal",
  "skull":              "frontal",
  "Head":               "frontal",
  "Cranium":            "frontal",
  "Frontal":            "frontal",
  "Frontal_Bone":       "frontal",
  "FrontalBone":        "frontal",
  "bone_Frontal":       "frontal",

  "Parietal_L":         "parietal-l",
  "Parietal_Left":      "parietal-l",
  "LeftParietal":       "parietal-l",
  "Left_Parietal":      "parietal-l",

  "Parietal_R":         "parietal-r",
  "Parietal_Right":     "parietal-r",
  "RightParietal":      "parietal-r",
  "Right_Parietal":     "parietal-r",

  "Occipital":          "occipital",
  "Occipital_Bone":     "occipital",

  "Temporal_L":         "temporal-l",
  "Temporal_Left":      "temporal-l",
  "LeftTemporal":       "temporal-l",

  "Temporal_R":         "temporal-r",
  "Temporal_Right":     "temporal-r",
  "RightTemporal":      "temporal-r",

  "Sphenoid":           "sphenoid",
  "Sphenoid_Bone":      "sphenoid",

  "Ethmoid":            "ethmoid",
  "Ethmoid_Bone":       "ethmoid",

  // ── FACIAL BONES ───────────────────────────────────────────────────────────
  "Mandible":           "mandible",
  "Jaw":                "mandible",
  "jaw":                "mandible",
  "Lower_Jaw":          "mandible",
  "LowerJaw":           "mandible",

  "Maxilla_L":          "maxilla-l",
  "Maxilla_Left":       "maxilla-l",
  "LeftMaxilla":        "maxilla-l",

  "Maxilla_R":          "maxilla-r",
  "Maxilla_Right":      "maxilla-r",
  "RightMaxilla":       "maxilla-r",

  "Zygomatic_L":        "zygomatic-l",
  "ZygomaticL":         "zygomatic-l",
  "Cheekbone_L":        "zygomatic-l",

  "Zygomatic_R":        "zygomatic-r",
  "ZygomaticR":         "zygomatic-r",
  "Cheekbone_R":        "zygomatic-r",

  "Palatine_L":         "palatine-l",
  "Palatine_R":         "palatine-r",
  "Lacrimal_L":         "lacrimal-l",
  "Lacrimal_R":         "lacrimal-r",
  "Nasal_L":            "nasal-l",
  "Nasal_R":            "nasal-r",
  "InferiorConcha_L":   "inferior-concha-l",
  "Inferior_Concha_L":  "inferior-concha-l",
  "InferiorConcha_R":   "inferior-concha-r",
  "Inferior_Concha_R":  "inferior-concha-r",
  "Vomer":              "vomer",

  // ── VERTEBRAL COLUMN ───────────────────────────────────────────────────────
  "Atlas":              "c1-atlas",
  "C1":                 "c1-atlas",
  "C1_Atlas":           "c1-atlas",
  "Cervical_1":         "c1-atlas",

  "Axis":               "c2-axis",
  "C2":                 "c2-axis",
  "Cervical_2":         "c2-axis",

  "C3":                 "c3",   "Cervical_3":  "c3",
  "C4":                 "c4",   "Cervical_4":  "c4",
  "C5":                 "c5",   "Cervical_5":  "c5",
  "C6":                 "c6",   "Cervical_6":  "c6",
  "C7":                 "c7",   "Cervical_7":  "c7",

  "T1":  "t1",  "Thoracic_1":  "t1",
  "T2":  "t2",  "Thoracic_2":  "t2",
  "T3":  "t3",  "Thoracic_3":  "t3",
  "T4":  "t4",  "Thoracic_4":  "t4",
  "T5":  "t5",  "Thoracic_5":  "t5",
  "T6":  "t6",  "Thoracic_6":  "t6",
  "T7":  "t7",  "Thoracic_7":  "t7",
  "T8":  "t8",  "Thoracic_8":  "t8",
  "T9":  "t9",  "Thoracic_9":  "t9",
  "T10": "t10", "Thoracic_10": "t10",
  "T11": "t11", "Thoracic_11": "t11",
  "T12": "t12", "Thoracic_12": "t12",

  "L1":  "l1",  "Lumbar_1":  "l1",
  "L2":  "l2",  "Lumbar_2":  "l2",
  "L3":  "l3",  "Lumbar_3":  "l3",
  "L4":  "l4",  "Lumbar_4":  "l4",
  "L5":  "l5",  "Lumbar_5":  "l5",

  "Sacrum":  "sacrum",
  "Coccyx":  "coccyx",
  "Tailbone": "coccyx",

  // ── THORAX ─────────────────────────────────────────────────────────────────
  "Sternum":   "sternum",
  "Breastbone":"sternum",

  "Rib_1_L":  "rib-1-l",   "Rib_1_R":  "rib-1-r",
  "Rib_2_L":  "rib-2-l",   "Rib_2_R":  "rib-2-r",
  "Rib_3_L":  "rib-3-l",   "Rib_3_R":  "rib-3-r",
  "Rib_4_L":  "rib-4-l",   "Rib_4_R":  "rib-4-r",
  "Rib_5_L":  "rib-5-l",   "Rib_5_R":  "rib-5-r",
  "Rib_6_L":  "rib-6-l",   "Rib_6_R":  "rib-6-r",
  "Rib_7_L":  "rib-7-l",   "Rib_7_R":  "rib-7-r",
  "Rib_8_L":  "rib-8-l",   "Rib_8_R":  "rib-8-r",
  "Rib_9_L":  "rib-9-l",   "Rib_9_R":  "rib-9-r",
  "Rib_10_L": "rib-10-l",  "Rib_10_R": "rib-10-r",
  "Rib_11_L": "rib-11-l",  "Rib_11_R": "rib-11-r",
  "Rib_12_L": "rib-12-l",  "Rib_12_R": "rib-12-r",

  // ── SHOULDER GIRDLE ────────────────────────────────────────────────────────
  "Clavicle_L":       "clavicle-l",
  "Clavicle_Left":    "clavicle-l",
  "Collarbone_L":     "clavicle-l",

  "Clavicle_R":       "clavicle-r",
  "Clavicle_Right":   "clavicle-r",
  "Collarbone_R":     "clavicle-r",

  "Scapula_L":        "scapula-l",
  "ShoulderBlade_L":  "scapula-l",
  "Shoulder_Blade_L": "scapula-l",

  "Scapula_R":        "scapula-r",
  "ShoulderBlade_R":  "scapula-r",
  "Shoulder_Blade_R": "scapula-r",

  // ── ARM ────────────────────────────────────────────────────────────────────
  "Humerus_L":  "humerus-l",   "Humerus_R":  "humerus-r",
  "Radius_L":   "radius-l",    "Radius_R":   "radius-r",
  "Ulna_L":     "ulna-l",      "Ulna_R":     "ulna-r",

  // ── WRIST / CARPALS ────────────────────────────────────────────────────────
  "Scaphoid_L":   "scaphoid-l",     "Scaphoid_R":   "scaphoid-r",
  "Lunate_L":     "lunate-l",       "Lunate_R":     "lunate-r",
  "Triquetrum_L": "triquetrum-l",   "Triquetrum_R": "triquetrum-r",
  "Pisiform_L":   "pisiform-l",     "Pisiform_R":   "pisiform-r",
  "Trapezium_L":  "trapezium-l",    "Trapezium_R":  "trapezium-r",
  "Trapezoid_L":  "trapezoid-l",    "Trapezoid_R":  "trapezoid-r",
  "Capitate_L":   "capitate-l",     "Capitate_R":   "capitate-r",
  "Hamate_L":     "hamate-l",       "Hamate_R":     "hamate-r",

  // ── HAND METACARPALS ───────────────────────────────────────────────────────
  "Metacarpal_1_L": "metacarpal-1-l", "Metacarpal_1_R": "metacarpal-1-r",
  "Metacarpal_2_L": "metacarpal-2-l", "Metacarpal_2_R": "metacarpal-2-r",
  "Metacarpal_3_L": "metacarpal-3-l", "Metacarpal_3_R": "metacarpal-3-r",
  "Metacarpal_4_L": "metacarpal-4-l", "Metacarpal_4_R": "metacarpal-4-r",
  "Metacarpal_5_L": "metacarpal-5-l", "Metacarpal_5_R": "metacarpal-5-r",

  // ── PELVIS ────────────────────────────────────────────────────────────────
  "Pelvis_L":     "pelvis-l",   "Pelvis_R":     "pelvis-r",
  "Pelvis_Left":  "pelvis-l",   "Pelvis_Right":  "pelvis-r",
  "HipBone_L":    "pelvis-l",   "HipBone_R":    "pelvis-r",
  "Ilium_L":      "pelvis-l",   "Ilium_R":      "pelvis-r",

  // ── LEG ───────────────────────────────────────────────────────────────────
  "Femur_L":   "femur-l",    "Femur_R":   "femur-r",
  "Patella_L": "patella-l",  "Patella_R": "patella-r",
  "Tibia_L":   "tibia-l",    "Tibia_R":   "tibia-r",
  "Fibula_L":  "fibula-l",   "Fibula_R":  "fibula-r",

  // ── ANKLE / TARSALS ───────────────────────────────────────────────────────
  "Calcaneus_L":    "calcaneus-l",   "Calcaneus_R":    "calcaneus-r",
  "Heel_L":         "calcaneus-l",   "Heel_R":         "calcaneus-r",
  "Talus_L":        "talus-l",       "Talus_R":        "talus-r",
  "Navicular_L":    "navicular-l",   "Navicular_R":    "navicular-r",
  "Cuboid_L":       "cuboid-l",      "Cuboid_R":       "cuboid-r",
  "CuneiformMed_L": "cuneiform-med-l","CuneiformMed_R": "cuneiform-med-r",
  "CuneiformInt_L": "cuneiform-int-l","CuneiformInt_R": "cuneiform-int-r",
  "CuneiformLat_L": "cuneiform-lat-l","CuneiformLat_R": "cuneiform-lat-r",

  // ── FOOT METATARSALS ──────────────────────────────────────────────────────
  "Metatarsal_1_L": "metatarsal-1-l", "Metatarsal_1_R": "metatarsal-1-r",
  "Metatarsal_2_L": "metatarsal-2-l", "Metatarsal_2_R": "metatarsal-2-r",
  "Metatarsal_3_L": "metatarsal-3-l", "Metatarsal_3_R": "metatarsal-3-r",
  "Metatarsal_4_L": "metatarsal-4-l", "Metatarsal_4_R": "metatarsal-4-r",
  "Metatarsal_5_L": "metatarsal-5-l", "Metatarsal_5_R": "metatarsal-5-r",
};

/**
 * Look up a GLB mesh name → bone ID from skeletalSystem.ts.
 * Returns null when the mesh is not individually mapped
 * (triggering position-based fallback in SkeletonModel.tsx).
 * @param {string} meshName
 * @returns {string | null}
 */
export function getBoneId(meshName) {
  return boneMap[meshName] ?? null;
}

/**
 * The two mesh names produced by Three.js r170 when loading skeleton.glb.
 * Exported for use in SkeletonModel.tsx to distinguish merged-mesh nodes
 * from future per-bone nodes without hard-coding strings in the component.
 */
export const MERGED_MESH_NAMES = new Set(["sub01", "sub02"]);
