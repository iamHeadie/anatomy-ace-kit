/**
 * modelRegistry.js — GLB Mesh Name → TA98 Bone ID Mapping
 *
 * Maps Three.js mesh names from skeleton.glb to TA98 standard IDs.
 * 
 * skeleton.glb has 2 merged meshes: sub01 (full skeleton) and sub02 (ribs).
 * These are NOT in boneMap — the position-based fallback handles them.
 *
 * For future per-bone GLB models, add entries here:
 *   "MeshName_In_GLB": "A02.x.xx.xxx-L"  (TA98 ID with side suffix)
 */

export const boneMap = {
  // ── CRANIUM ────────────────────────────────────────────────────────────
  "Skull":              "A02.1.02.001",
  "skull":              "A02.1.02.001",
  "Head":               "A02.1.02.001",
  "Cranium":            "A02.1.02.001",
  "Frontal":            "A02.1.02.001",
  "Frontal_Bone":       "A02.1.02.001",

  "Parietal_L":         "A02.1.02.101-L",
  "Parietal_Left":      "A02.1.02.101-L",
  "Parietal_R":         "A02.1.02.101-R",
  "Parietal_Right":     "A02.1.02.101-R",

  "Occipital":          "A02.1.02.201",
  "Occipital_Bone":     "A02.1.02.201",

  "Temporal_L":         "A02.1.02.301-L",
  "Temporal_Left":      "A02.1.02.301-L",
  "Temporal_R":         "A02.1.02.301-R",
  "Temporal_Right":     "A02.1.02.301-R",

  "Sphenoid":           "A02.1.02.401",
  "Sphenoid_Bone":      "A02.1.02.401",

  "Ethmoid":            "A02.1.02.501",
  "Ethmoid_Bone":       "A02.1.02.501",

  // ── FACIAL BONES ───────────────────────────────────────────────────────
  "Mandible":           "A02.1.03.701",
  "Jaw":                "A02.1.03.701",
  "jaw":                "A02.1.03.701",

  "Maxilla_L":          "A02.1.03.301-L",
  "Maxilla_R":          "A02.1.03.301-R",

  "Zygomatic_L":        "A02.1.03.201-L",
  "Zygomatic_R":        "A02.1.03.201-R",

  "Nasal_L":            "A02.1.03.001-L",
  "Nasal_R":            "A02.1.03.001-R",

  "Lacrimal_L":         "A02.1.03.101-L",
  "Lacrimal_R":         "A02.1.03.101-R",

  "Palatine_L":         "A02.1.03.401-L",
  "Palatine_R":         "A02.1.03.401-R",

  "InferiorConcha_L":   "A02.1.03.501-L",
  "InferiorConcha_R":   "A02.1.03.501-R",

  "Vomer":              "A02.1.03.601",

  // ── HYOID ──────────────────────────────────────────────────────────────
  "Hyoid":              "A02.1.00.027",
  "Hyoid_Bone":         "A02.1.00.027",

  // ── AUDITORY OSSICLES ──────────────────────────────────────────────────
  "Malleus_L":          "A02.1.06.001-L",   "Malleus_R":          "A02.1.06.001-R",
  "Incus_L":            "A02.1.06.002-L",   "Incus_R":            "A02.1.06.002-R",
  "Stapes_L":           "A02.1.06.003-L",   "Stapes_R":           "A02.1.06.003-R",

  // ── VERTEBRAL COLUMN ───────────────────────────────────────────────────
  "Atlas":              "A02.2.02.001",
  "C1":                 "A02.2.02.001",
  "Axis":               "A02.2.02.101",
  "C2":                 "A02.2.02.101",
  "C3":                 "A02.2.02.201",
  "C4":                 "A02.2.02.202",
  "C5":                 "A02.2.02.203",
  "C6":                 "A02.2.02.204",
  "C7":                 "A02.2.02.301",

  "T1":  "A02.2.03.001",  "T2":  "A02.2.03.002",  "T3":  "A02.2.03.003",
  "T4":  "A02.2.03.004",  "T5":  "A02.2.03.005",  "T6":  "A02.2.03.006",
  "T7":  "A02.2.03.007",  "T8":  "A02.2.03.008",  "T9":  "A02.2.03.009",
  "T10": "A02.2.03.010",  "T11": "A02.2.03.011",  "T12": "A02.2.03.012",

  "L1":  "A02.2.04.001",  "L2":  "A02.2.04.002",  "L3":  "A02.2.04.003",
  "L4":  "A02.2.04.004",  "L5":  "A02.2.04.005",

  "Sacrum":  "A02.2.05.001",
  "Coccyx":  "A02.2.06.001",

  // ── THORAX ─────────────────────────────────────────────────────────────
  "Sternum":   "A02.3.01.001",

  "Rib_1_L":  "A02.3.02.001-L",   "Rib_1_R":  "A02.3.02.001-R",
  "Rib_2_L":  "A02.3.02.002-L",   "Rib_2_R":  "A02.3.02.002-R",
  "Rib_3_L":  "A02.3.02.003-L",   "Rib_3_R":  "A02.3.02.003-R",
  "Rib_4_L":  "A02.3.02.004-L",   "Rib_4_R":  "A02.3.02.004-R",
  "Rib_5_L":  "A02.3.02.005-L",   "Rib_5_R":  "A02.3.02.005-R",
  "Rib_6_L":  "A02.3.02.006-L",   "Rib_6_R":  "A02.3.02.006-R",
  "Rib_7_L":  "A02.3.02.007-L",   "Rib_7_R":  "A02.3.02.007-R",
  "Rib_8_L":  "A02.3.02.008-L",   "Rib_8_R":  "A02.3.02.008-R",
  "Rib_9_L":  "A02.3.02.009-L",   "Rib_9_R":  "A02.3.02.009-R",
  "Rib_10_L": "A02.3.02.010-L",   "Rib_10_R": "A02.3.02.010-R",
  "Rib_11_L": "A02.3.02.011-L",   "Rib_11_R": "A02.3.02.011-R",
  "Rib_12_L": "A02.3.02.012-L",   "Rib_12_R": "A02.3.02.012-R",

  // ── SHOULDER GIRDLE ────────────────────────────────────────────────────
  "Clavicle_L":       "A02.4.01.001-L",
  "Clavicle_R":       "A02.4.01.001-R",
  "Scapula_L":        "A02.4.01.002-L",
  "Scapula_R":        "A02.4.01.002-R",

  // ── ARM ────────────────────────────────────────────────────────────────
  "Humerus_L":  "A02.4.02.001-L",   "Humerus_R":  "A02.4.02.001-R",
  "Radius_L":   "A02.4.03.001-L",   "Radius_R":   "A02.4.03.001-R",
  "Ulna_L":     "A02.4.03.002-L",   "Ulna_R":     "A02.4.03.002-R",

  // ── WRIST / CARPALS ────────────────────────────────────────────────────
  "Scaphoid_L":   "A02.4.08.001-L",     "Scaphoid_R":   "A02.4.08.001-R",
  "Lunate_L":     "A02.4.08.002-L",     "Lunate_R":     "A02.4.08.002-R",
  "Triquetrum_L": "A02.4.08.003-L",     "Triquetrum_R": "A02.4.08.003-R",
  "Pisiform_L":   "A02.4.08.004-L",     "Pisiform_R":   "A02.4.08.004-R",
  "Trapezium_L":  "A02.4.08.005-L",     "Trapezium_R":  "A02.4.08.005-R",
  "Trapezoid_L":  "A02.4.08.006-L",     "Trapezoid_R":  "A02.4.08.006-R",
  "Capitate_L":   "A02.4.08.007-L",     "Capitate_R":   "A02.4.08.007-R",
  "Hamate_L":     "A02.4.08.008-L",     "Hamate_R":     "A02.4.08.008-R",

  // ── PELVIS ─────────────────────────────────────────────────────────────
  "HipBone_L":    "A02.5.01.001-L",     "HipBone_R":    "A02.5.01.001-R",
  "Pelvis_L":     "A02.5.01.001-L",     "Pelvis_R":     "A02.5.01.001-R",

  // ── LEG ────────────────────────────────────────────────────────────────
  "Femur_L":    "A02.5.02.001-L",   "Femur_R":    "A02.5.02.001-R",
  "Patella_L":  "A02.5.02.002-L",   "Patella_R":  "A02.5.02.002-R",
  "Tibia_L":    "A02.5.06.001-L",   "Tibia_R":    "A02.5.06.001-R",
  "Fibula_L":   "A02.5.06.002-L",   "Fibula_R":   "A02.5.06.002-R",

  // ── ANKLE / TARSALS ────────────────────────────────────────────────────
  "Calcaneus_L":  "A02.5.10.001-L",   "Calcaneus_R":  "A02.5.10.001-R",
  "Talus_L":      "A02.5.10.002-L",   "Talus_R":      "A02.5.10.002-R",
};
