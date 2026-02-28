/**
 * modelRegistry.js — GLB Mesh Name → Skeletal System ID Mapping
 *
 * HOW TO POPULATE THIS MAP:
 * ─────────────────────────
 * 1. Run the app (npm run dev) and open the browser DevTools console.
 * 2. Click / tap on any bone in the 3D viewer.
 * 3. Look for the log: `[Anatomy] Clicked mesh: "Mesh_024"` (or similar).
 * 4. Find the correct anatomy name for that bone.
 * 5. Add an entry below:
 *       "Mesh_024": "clavicle-l",    // Left Clavicle
 * 6. The value must be a valid `id` from src/data/skeletalSystem.ts.
 *
 * VALIDATION:
 * ───────────
 * • Mesh name IS in this map  → displays the correct anatomy name + blue glow.
 * • Mesh name NOT in this map → displays "Unknown Bone — <MeshName>" so you
 *   can identify and add it here.
 *
 * NOTE: src/data/anatomyData.json was referenced in the task but does not yet
 * exist in this project. All bone IDs below reference src/data/skeletalSystem.ts.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * BONE IDs from skeletalSystem.ts (all 206 bones):
 *
 * Cranium:    frontal | parietal-l | parietal-r | occipital | temporal-l |
 *             temporal-r | sphenoid | ethmoid
 * Face:       mandible | maxilla-l | maxilla-r | zygomatic-l | zygomatic-r |
 *             palatine-l | palatine-r | lacrimal-l | lacrimal-r | nasal-l |
 *             nasal-r | inferior-concha-l | inferior-concha-r | vomer
 * Vertebrae:  c1-atlas | c2-axis | c3 | c4 | c5 | c6 | c7 |
 *             t1–t12 | l1–l5 | sacrum | coccyx
 * Thorax:     sternum | rib-1-l…rib-12-l | rib-1-r…rib-12-r
 * Shoulder:   clavicle-l | clavicle-r | scapula-l | scapula-r
 * Arm:        humerus-l | humerus-r | radius-l | radius-r | ulna-l | ulna-r
 * Hand:       scaphoid-l | scaphoid-r | lunate-l | lunate-r |
 *             triquetrum-l | triquetrum-r | pisiform-l | pisiform-r |
 *             trapezium-l | trapezium-r | trapezoid-l | trapezoid-r |
 *             capitate-l | capitate-r | hamate-l | hamate-r |
 *             metacarpal-1-l … metacarpal-5-l | metacarpal-1-r … metacarpal-5-r
 *             (phalanges: proximal/middle/distal per digit, L & R)
 * Pelvis:     pelvis-l | pelvis-r
 * Leg:        femur-l | femur-r | patella-l | patella-r |
 *             tibia-l | tibia-r | fibula-l | fibula-r
 * Foot:       calcaneus-l | calcaneus-r | talus-l | talus-r |
 *             navicular-l | navicular-r | cuboid-l | cuboid-r |
 *             cuneiform-med-l … cuneiform-lat-l | cuneiform-med-r … cuneiform-lat-r |
 *             metatarsal-1-l … metatarsal-5-l | metatarsal-1-r … metatarsal-5-r
 *             (foot phalanges: proximal/middle/distal per digit, L & R)
 */

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY BONE MAP
// Keys   = exact internal GLB mesh names (check console logs to find yours).
// Values = bone IDs from src/data/skeletalSystem.ts.
//
// Multiple keys can point to the same ID (handles model naming variations).
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
  "OS_Frontale":        "frontal",
  "bone_Frontal":       "frontal",

  "Parietal_L":         "parietal-l",
  "Parietal_Left":      "parietal-l",
  "LeftParietal":       "parietal-l",
  "Left_Parietal":      "parietal-l",
  "ParietalL":          "parietal-l",
  "bone_ParietalL":     "parietal-l",

  "Parietal_R":         "parietal-r",
  "Parietal_Right":     "parietal-r",
  "RightParietal":      "parietal-r",
  "Right_Parietal":     "parietal-r",
  "ParietalR":          "parietal-r",
  "bone_ParietalR":     "parietal-r",

  "Occipital":          "occipital",
  "Occipital_Bone":     "occipital",
  "OccipitalBone":      "occipital",
  "bone_Occipital":     "occipital",

  "Temporal_L":         "temporal-l",
  "Temporal_Left":      "temporal-l",
  "LeftTemporal":       "temporal-l",
  "Left_Temporal":      "temporal-l",
  "TemporalL":          "temporal-l",
  "bone_TemporalL":     "temporal-l",

  "Temporal_R":         "temporal-r",
  "Temporal_Right":     "temporal-r",
  "RightTemporal":      "temporal-r",
  "Right_Temporal":     "temporal-r",
  "TemporalR":          "temporal-r",
  "bone_TemporalR":     "temporal-r",

  "Sphenoid":           "sphenoid",
  "Sphenoid_Bone":      "sphenoid",
  "SphenoidBone":       "sphenoid",
  "bone_Sphenoid":      "sphenoid",

  "Ethmoid":            "ethmoid",
  "Ethmoid_Bone":       "ethmoid",
  "EthmoidBone":        "ethmoid",
  "bone_Ethmoid":       "ethmoid",

  // ── FACIAL BONES ───────────────────────────────────────────────────────────
  "Mandible":           "mandible",
  "Jaw":                "mandible",
  "jaw":                "mandible",
  "Lower_Jaw":          "mandible",
  "LowerJaw":           "mandible",
  "bone_Mandible":      "mandible",

  "Maxilla_L":          "maxilla-l",
  "Maxilla_Left":       "maxilla-l",
  "LeftMaxilla":        "maxilla-l",
  "MaxillaL":           "maxilla-l",

  "Maxilla_R":          "maxilla-r",
  "Maxilla_Right":      "maxilla-r",
  "RightMaxilla":       "maxilla-r",
  "MaxillaR":           "maxilla-r",

  "Zygomatic_L":        "zygomatic-l",
  "Zygomatic_Left":     "zygomatic-l",
  "ZygomaticL":         "zygomatic-l",
  "Cheekbone_L":        "zygomatic-l",

  "Zygomatic_R":        "zygomatic-r",
  "Zygomatic_Right":    "zygomatic-r",
  "ZygomaticR":         "zygomatic-r",
  "Cheekbone_R":        "zygomatic-r",

  "Palatine_L":         "palatine-l",
  "Palatine_R":         "palatine-r",

  "Lacrimal_L":         "lacrimal-l",
  "Lacrimal_R":         "lacrimal-r",

  "Nasal_L":            "nasal-l",
  "Nasal_Left":         "nasal-l",
  "Nasal_R":            "nasal-r",
  "Nasal_Right":        "nasal-r",

  "InferiorConcha_L":   "inferior-concha-l",
  "Inferior_Concha_L":  "inferior-concha-l",
  "InferiorConcha_R":   "inferior-concha-r",
  "Inferior_Concha_R":  "inferior-concha-r",

  "Vomer":              "vomer",
  "bone_Vomer":         "vomer",

  // ── VERTEBRAL COLUMN ───────────────────────────────────────────────────────
  "Atlas":              "c1-atlas",
  "C1":                 "c1-atlas",
  "C1_Atlas":           "c1-atlas",
  "Cervical_1":         "c1-atlas",
  "Cervical1":          "c1-atlas",

  "Axis":               "c2-axis",
  "C2":                 "c2-axis",
  "C2_Axis":            "c2-axis",
  "Cervical_2":         "c2-axis",
  "Cervical2":          "c2-axis",

  "C3":                 "c3",
  "Cervical_3":         "c3",
  "Cervical3":          "c3",

  "C4":                 "c4",
  "Cervical_4":         "c4",
  "Cervical4":          "c4",

  "C5":                 "c5",
  "Cervical_5":         "c5",
  "Cervical5":          "c5",

  "C6":                 "c6",
  "Cervical_6":         "c6",
  "Cervical6":          "c6",

  "C7":                 "c7",
  "Cervical_7":         "c7",
  "Cervical7":          "c7",

  "T1":                 "t1",   "Thoracic_1":   "t1",   "Thoracic1":  "t1",
  "T2":                 "t2",   "Thoracic_2":   "t2",   "Thoracic2":  "t2",
  "T3":                 "t3",   "Thoracic_3":   "t3",   "Thoracic3":  "t3",
  "T4":                 "t4",   "Thoracic_4":   "t4",   "Thoracic4":  "t4",
  "T5":                 "t5",   "Thoracic_5":   "t5",   "Thoracic5":  "t5",
  "T6":                 "t6",   "Thoracic_6":   "t6",   "Thoracic6":  "t6",
  "T7":                 "t7",   "Thoracic_7":   "t7",   "Thoracic7":  "t7",
  "T8":                 "t8",   "Thoracic_8":   "t8",   "Thoracic8":  "t8",
  "T9":                 "t9",   "Thoracic_9":   "t9",   "Thoracic9":  "t9",
  "T10":                "t10",  "Thoracic_10":  "t10",  "Thoracic10": "t10",
  "T11":                "t11",  "Thoracic_11":  "t11",  "Thoracic11": "t11",
  "T12":                "t12",  "Thoracic_12":  "t12",  "Thoracic12": "t12",

  "L1":                 "l1",   "Lumbar_1":     "l1",   "Lumbar1":    "l1",
  "L2":                 "l2",   "Lumbar_2":     "l2",   "Lumbar2":    "l2",
  "L3":                 "l3",   "Lumbar_3":     "l3",   "Lumbar3":    "l3",
  "L4":                 "l4",   "Lumbar_4":     "l4",   "Lumbar4":    "l4",
  "L5":                 "l5",   "Lumbar_5":     "l5",   "Lumbar5":    "l5",

  "Sacrum":             "sacrum",
  "bone_Sacrum":        "sacrum",

  "Coccyx":             "coccyx",
  "Tailbone":           "coccyx",
  "bone_Coccyx":        "coccyx",

  // ── THORAX ─────────────────────────────────────────────────────────────────
  "Sternum":            "sternum",
  "Breastbone":         "sternum",
  "bone_Sternum":       "sternum",

  "Rib_1_L":            "rib-1-l",    "Rib1_L":  "rib-1-l",
  "Rib_2_L":            "rib-2-l",    "Rib2_L":  "rib-2-l",
  "Rib_3_L":            "rib-3-l",    "Rib3_L":  "rib-3-l",
  "Rib_4_L":            "rib-4-l",    "Rib4_L":  "rib-4-l",
  "Rib_5_L":            "rib-5-l",    "Rib5_L":  "rib-5-l",
  "Rib_6_L":            "rib-6-l",    "Rib6_L":  "rib-6-l",
  "Rib_7_L":            "rib-7-l",    "Rib7_L":  "rib-7-l",
  "Rib_8_L":            "rib-8-l",    "Rib8_L":  "rib-8-l",
  "Rib_9_L":            "rib-9-l",    "Rib9_L":  "rib-9-l",
  "Rib_10_L":           "rib-10-l",   "Rib10_L": "rib-10-l",
  "Rib_11_L":           "rib-11-l",   "Rib11_L": "rib-11-l",
  "Rib_12_L":           "rib-12-l",   "Rib12_L": "rib-12-l",

  "Rib_1_R":            "rib-1-r",    "Rib1_R":  "rib-1-r",
  "Rib_2_R":            "rib-2-r",    "Rib2_R":  "rib-2-r",
  "Rib_3_R":            "rib-3-r",    "Rib3_R":  "rib-3-r",
  "Rib_4_R":            "rib-4-r",    "Rib4_R":  "rib-4-r",
  "Rib_5_R":            "rib-5-r",    "Rib5_R":  "rib-5-r",
  "Rib_6_R":            "rib-6-r",    "Rib6_R":  "rib-6-r",
  "Rib_7_R":            "rib-7-r",    "Rib7_R":  "rib-7-r",
  "Rib_8_R":            "rib-8-r",    "Rib8_R":  "rib-8-r",
  "Rib_9_R":            "rib-9-r",    "Rib9_R":  "rib-9-r",
  "Rib_10_R":           "rib-10-r",   "Rib10_R": "rib-10-r",
  "Rib_11_R":           "rib-11-r",   "Rib11_R": "rib-11-r",
  "Rib_12_R":           "rib-12-r",   "Rib12_R": "rib-12-r",

  // ── SHOULDER GIRDLE ────────────────────────────────────────────────────────
  "Clavicle_L":         "clavicle-l",
  "Clavicle_Left":      "clavicle-l",
  "LeftClavicle":       "clavicle-l",
  "Collarbone_L":       "clavicle-l",

  "Clavicle_R":         "clavicle-r",
  "Clavicle_Right":     "clavicle-r",
  "RightClavicle":      "clavicle-r",
  "Collarbone_R":       "clavicle-r",

  "Scapula_L":          "scapula-l",
  "Scapula_Left":       "scapula-l",
  "ShoulderBlade_L":    "scapula-l",
  "Shoulder_Blade_L":   "scapula-l",

  "Scapula_R":          "scapula-r",
  "Scapula_Right":      "scapula-r",
  "ShoulderBlade_R":    "scapula-r",
  "Shoulder_Blade_R":   "scapula-r",

  // ── ARM ────────────────────────────────────────────────────────────────────
  "Humerus_L":          "humerus-l",
  "Humerus_Left":       "humerus-l",
  "UpperArm_L":         "humerus-l",

  "Humerus_R":          "humerus-r",
  "Humerus_Right":      "humerus-r",
  "UpperArm_R":         "humerus-r",

  "Radius_L":           "radius-l",
  "Radius_Left":        "radius-l",

  "Radius_R":           "radius-r",
  "Radius_Right":       "radius-r",

  "Ulna_L":             "ulna-l",
  "Ulna_Left":          "ulna-l",

  "Ulna_R":             "ulna-r",
  "Ulna_Right":         "ulna-r",

  // ── WRIST / CARPALS ────────────────────────────────────────────────────────
  "Scaphoid_L":         "scaphoid-l",       "Scaphoid_R":         "scaphoid-r",
  "Lunate_L":           "lunate-l",         "Lunate_R":           "lunate-r",
  "Triquetrum_L":       "triquetrum-l",     "Triquetrum_R":       "triquetrum-r",
  "Pisiform_L":         "pisiform-l",       "Pisiform_R":         "pisiform-r",
  "Trapezium_L":        "trapezium-l",      "Trapezium_R":        "trapezium-r",
  "Trapezoid_L":        "trapezoid-l",      "Trapezoid_R":        "trapezoid-r",
  "Capitate_L":         "capitate-l",       "Capitate_R":         "capitate-r",
  "Hamate_L":           "hamate-l",         "Hamate_R":           "hamate-r",

  // ── HAND METACARPALS ───────────────────────────────────────────────────────
  "Metacarpal_1_L":     "metacarpal-1-l",   "Metacarpal_1_R":     "metacarpal-1-r",
  "Metacarpal_2_L":     "metacarpal-2-l",   "Metacarpal_2_R":     "metacarpal-2-r",
  "Metacarpal_3_L":     "metacarpal-3-l",   "Metacarpal_3_R":     "metacarpal-3-r",
  "Metacarpal_4_L":     "metacarpal-4-l",   "Metacarpal_4_R":     "metacarpal-4-r",
  "Metacarpal_5_L":     "metacarpal-5-l",   "Metacarpal_5_R":     "metacarpal-5-r",

  // ── PELVIS ────────────────────────────────────────────────────────────────
  "Pelvis_L":           "pelvis-l",
  "Pelvis_Left":        "pelvis-l",
  "HipBone_L":          "pelvis-l",
  "Ilium_L":            "pelvis-l",
  "Coxal_L":            "pelvis-l",

  "Pelvis_R":           "pelvis-r",
  "Pelvis_Right":       "pelvis-r",
  "HipBone_R":          "pelvis-r",
  "Ilium_R":            "pelvis-r",
  "Coxal_R":            "pelvis-r",

  // ── LEG ───────────────────────────────────────────────────────────────────
  "Femur_L":            "femur-l",
  "Femur_Left":         "femur-l",
  "ThighBone_L":        "femur-l",

  "Femur_R":            "femur-r",
  "Femur_Right":        "femur-r",
  "ThighBone_R":        "femur-r",

  "Patella_L":          "patella-l",
  "Kneecap_L":          "patella-l",
  "Patella_R":          "patella-r",
  "Kneecap_R":          "patella-r",

  "Tibia_L":            "tibia-l",
  "Tibia_Left":         "tibia-l",
  "Shinbone_L":         "tibia-l",

  "Tibia_R":            "tibia-r",
  "Tibia_Right":        "tibia-r",
  "Shinbone_R":         "tibia-r",

  "Fibula_L":           "fibula-l",
  "Fibula_Left":        "fibula-l",

  "Fibula_R":           "fibula-r",
  "Fibula_Right":       "fibula-r",

  // ── ANKLE / TARSALS ───────────────────────────────────────────────────────
  "Calcaneus_L":        "calcaneus-l",      "Calcaneus_R":        "calcaneus-r",
  "Heel_L":             "calcaneus-l",      "Heel_R":             "calcaneus-r",
  "Talus_L":            "talus-l",          "Talus_R":            "talus-r",
  "Navicular_L":        "navicular-l",      "Navicular_R":        "navicular-r",
  "Cuboid_L":           "cuboid-l",         "Cuboid_R":           "cuboid-r",
  "CuneiformMed_L":     "cuneiform-med-l",  "CuneiformMed_R":     "cuneiform-med-r",
  "CuneiformInt_L":     "cuneiform-int-l",  "CuneiformInt_R":     "cuneiform-int-r",
  "CuneiformLat_L":     "cuneiform-lat-l",  "CuneiformLat_R":     "cuneiform-lat-r",

  // ── FOOT METATARSALS ──────────────────────────────────────────────────────
  "Metatarsal_1_L":     "metatarsal-1-l",   "Metatarsal_1_R":     "metatarsal-1-r",
  "Metatarsal_2_L":     "metatarsal-2-l",   "Metatarsal_2_R":     "metatarsal-2-r",
  "Metatarsal_3_L":     "metatarsal-3-l",   "Metatarsal_3_R":     "metatarsal-3-r",
  "Metatarsal_4_L":     "metatarsal-4-l",   "Metatarsal_4_R":     "metatarsal-4-r",
  "Metatarsal_5_L":     "metatarsal-5-l",   "Metatarsal_5_R":     "metatarsal-5-r",

  // ── GENERIC / FALLBACK (common auto-generated mesh names) ─────────────────
  // These will be updated once you run the app and check the console logs.
  // Example: if console shows "Mesh_024" maps to the Clavicle, add:
  //   "Mesh_024": "clavicle-l",
};

/**
 * Look up a GLB mesh name and return the matching BonePart ID.
 * Returns null if the mesh is not yet mapped.
 * @param {string} meshName - The mesh.name from Three.js
 * @returns {string | null}
 */
export function getBoneId(meshName) {
  return boneMap[meshName] ?? null;
}
