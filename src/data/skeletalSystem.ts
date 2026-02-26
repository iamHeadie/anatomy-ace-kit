export interface BonePart {
  id: string;
  name: string;
  latinName: string;
  system: string;
  region: string;
  description: string;
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  facts: string[];
  connections: string[];
}

// Helper to create left/right pairs
const pair = (
  base: Omit<BonePart, "id" | "name" | "position" | "connections"> & { baseName: string; baseId: string; posL: [number, number, number]; posR: [number, number, number]; connectionsL: string[]; connectionsR: string[] }
): [BonePart, BonePart] => [
  { ...base, id: `${base.baseId}-l`, name: `Left ${base.baseName}`, position: base.posL, connections: base.connectionsL },
  { ...base, id: `${base.baseId}-r`, name: `Right ${base.baseName}`, position: base.posR, connections: base.connectionsR },
];

// ─── COLORS ──────────────────────────────────────────────
const BONE = "#d4b896";
const BONE_ALT = "#c9a87c";
const BONE_DARK = "#bfa77a";
const BONE_DEEP = "#b8975e";

// ═══════════════════════════════════════════════════════════
// AXIAL SKELETON (80 bones)
// ═══════════════════════════════════════════════════════════

// ─── CRANIAL BONES (8) ───────────────────────────────────
const cranialBones: BonePart[] = [
  {
    id: "frontal", name: "Frontal Bone", latinName: "Os frontale", system: "Skeletal", region: "Cranium",
    description: "The frontal bone forms the forehead, the roof of the orbits, and the anterior cranial fossa. It contains the frontal sinuses.",
    position: [0, 4.1, 0.25], scale: [0.5, 0.3, 0.1], color: BONE,
    facts: ["Forms the forehead", "Contains frontal sinuses", "Articulates with 12 bones"],
    connections: ["parietal-l", "parietal-r", "sphenoid", "ethmoid", "nasal-l", "nasal-r"]
  },
  {
    id: "parietal-l", name: "Left Parietal Bone", latinName: "Os parietale", system: "Skeletal", region: "Cranium",
    description: "The parietal bones form most of the superior and lateral walls of the cranium. They are joined at the sagittal suture.",
    position: [0.2, 4.2, -0.05], scale: [0.25, 0.3, 0.25], color: BONE_ALT,
    facts: ["Forms the cranial vault", "Joined by sagittal suture", "Quadrilateral in shape"],
    connections: ["frontal", "parietal-r", "temporal-l", "occipital", "sphenoid"]
  },
  {
    id: "parietal-r", name: "Right Parietal Bone", latinName: "Os parietale", system: "Skeletal", region: "Cranium",
    description: "The parietal bones form most of the superior and lateral walls of the cranium. They are joined at the sagittal suture.",
    position: [-0.2, 4.2, -0.05], scale: [0.25, 0.3, 0.25], color: BONE_ALT,
    facts: ["Forms the cranial vault", "Joined by sagittal suture", "Quadrilateral in shape"],
    connections: ["frontal", "parietal-l", "temporal-r", "occipital", "sphenoid"]
  },
  {
    id: "occipital", name: "Occipital Bone", latinName: "Os occipitale", system: "Skeletal", region: "Cranium",
    description: "The occipital bone forms the posterior part and base of the cranium. It contains the foramen magnum through which the spinal cord passes.",
    position: [0, 3.9, -0.35], scale: [0.4, 0.35, 0.1], color: BONE_DARK,
    facts: ["Contains the foramen magnum", "Articulates with the atlas (C1)", "Houses the visual cortex area"],
    connections: ["parietal-l", "parietal-r", "temporal-l", "temporal-r", "sphenoid", "c1-atlas"]
  },
  {
    id: "temporal-l", name: "Left Temporal Bone", latinName: "Os temporale", system: "Skeletal", region: "Cranium",
    description: "The temporal bone houses the structures of the middle and inner ear. It contains the mastoid process and the mandibular fossa.",
    position: [0.4, 3.8, -0.1], scale: [0.15, 0.25, 0.2], color: BONE,
    facts: ["Houses the ear structures", "Contains mastoid process", "Thinnest part of the skull at squamous portion"],
    connections: ["parietal-l", "frontal", "sphenoid", "occipital", "zygomatic-l", "mandible"]
  },
  {
    id: "temporal-r", name: "Right Temporal Bone", latinName: "Os temporale", system: "Skeletal", region: "Cranium",
    description: "The temporal bone houses the structures of the middle and inner ear. It contains the mastoid process and the mandibular fossa.",
    position: [-0.4, 3.8, -0.1], scale: [0.15, 0.25, 0.2], color: BONE,
    facts: ["Houses the ear structures", "Contains mastoid process", "Thinnest part of the skull at squamous portion"],
    connections: ["parietal-r", "frontal", "sphenoid", "occipital", "zygomatic-r", "mandible"]
  },
  {
    id: "sphenoid", name: "Sphenoid Bone", latinName: "Os sphenoidale", system: "Skeletal", region: "Cranium",
    description: "The sphenoid is a butterfly-shaped bone at the base of the skull. It articulates with all other cranial bones and houses the pituitary gland in the sella turcica.",
    position: [0, 3.7, 0.05], scale: [0.45, 0.1, 0.25], color: BONE_DEEP,
    facts: ["Butterfly-shaped 'keystone' bone", "Articulates with all cranial bones", "Sella turcica houses pituitary gland"],
    connections: ["frontal", "parietal-l", "parietal-r", "temporal-l", "temporal-r", "occipital", "ethmoid"]
  },
  {
    id: "ethmoid", name: "Ethmoid Bone", latinName: "Os ethmoidale", system: "Skeletal", region: "Cranium",
    description: "The ethmoid is a delicate bone between the orbits. It forms part of the nasal septum, nasal cavity walls, and orbital walls. It contains ethmoid air cells.",
    position: [0, 3.75, 0.18], scale: [0.15, 0.1, 0.1], color: BONE_ALT,
    facts: ["Lightest cranial bone", "Contains cribriform plate for olfactory nerves", "Forms part of the nasal septum"],
    connections: ["frontal", "sphenoid", "nasal-l", "nasal-r", "lacrimal-l", "lacrimal-r", "vomer"]
  },
];

// ─── FACIAL BONES (14) ──────────────────────────────────
const facialBones: BonePart[] = [
  {
    id: "mandible", name: "Mandible", latinName: "Mandibula", system: "Skeletal", region: "Face",
    description: "The mandible is the largest and strongest bone of the face. It is the only movable bone in the skull and holds the lower teeth.",
    position: [0, 3.2, 0.15], scale: [0.45, 0.15, 0.3], color: BONE_ALT,
    facts: ["Only movable skull bone", "Strongest facial bone", "Contains 16 lower teeth sockets"],
    connections: ["temporal-l", "temporal-r"]
  },
  {
    id: "maxilla-l", name: "Left Maxilla", latinName: "Maxilla", system: "Skeletal", region: "Face",
    description: "The maxillae form the upper jaw, the floor of the orbits, and part of the hard palate. They hold the upper teeth.",
    position: [0.1, 3.4, 0.2], scale: [0.15, 0.15, 0.12], color: BONE,
    facts: ["Forms the upper jaw", "Contains maxillary sinus (largest paranasal sinus)", "Holds upper teeth"],
    connections: ["frontal", "zygomatic-l", "nasal-l", "palatine-l", "lacrimal-l", "maxilla-r", "vomer", "inf-nasal-concha-l"]
  },
  {
    id: "maxilla-r", name: "Right Maxilla", latinName: "Maxilla", system: "Skeletal", region: "Face",
    description: "The maxillae form the upper jaw, the floor of the orbits, and part of the hard palate. They hold the upper teeth.",
    position: [-0.1, 3.4, 0.2], scale: [0.15, 0.15, 0.12], color: BONE,
    facts: ["Forms the upper jaw", "Contains maxillary sinus", "Holds upper teeth"],
    connections: ["frontal", "zygomatic-r", "nasal-r", "palatine-r", "lacrimal-r", "maxilla-l", "vomer", "inf-nasal-concha-r"]
  },
  {
    id: "zygomatic-l", name: "Left Zygomatic Bone", latinName: "Os zygomaticum", system: "Skeletal", region: "Face",
    description: "The zygomatic bone (cheekbone) forms the prominence of the cheek and part of the lateral wall and floor of the orbit.",
    position: [0.3, 3.5, 0.25], scale: [0.12, 0.12, 0.08], color: BONE_ALT,
    facts: ["Forms the cheekbone", "Part of the orbital floor", "Articulates with frontal, temporal, maxilla, sphenoid"],
    connections: ["frontal", "temporal-l", "maxilla-l", "sphenoid"]
  },
  {
    id: "zygomatic-r", name: "Right Zygomatic Bone", latinName: "Os zygomaticum", system: "Skeletal", region: "Face",
    description: "The zygomatic bone (cheekbone) forms the prominence of the cheek and part of the lateral wall and floor of the orbit.",
    position: [-0.3, 3.5, 0.25], scale: [0.12, 0.12, 0.08], color: BONE_ALT,
    facts: ["Forms the cheekbone", "Part of the orbital floor", "Articulates with frontal, temporal, maxilla, sphenoid"],
    connections: ["frontal", "temporal-r", "maxilla-r", "sphenoid"]
  },
  {
    id: "nasal-l", name: "Left Nasal Bone", latinName: "Os nasale", system: "Skeletal", region: "Face",
    description: "The nasal bones form the bridge of the nose. They are small, oblong bones between the frontal processes of the maxillae.",
    position: [0.04, 3.6, 0.32], scale: [0.04, 0.08, 0.03], color: BONE,
    facts: ["Forms the bridge of the nose", "Among the most commonly fractured facial bones", "Very small paired bones"],
    connections: ["frontal", "ethmoid", "maxilla-l", "nasal-r"]
  },
  {
    id: "nasal-r", name: "Right Nasal Bone", latinName: "Os nasale", system: "Skeletal", region: "Face",
    description: "The nasal bones form the bridge of the nose. They are small, oblong bones between the frontal processes of the maxillae.",
    position: [-0.04, 3.6, 0.32], scale: [0.04, 0.08, 0.03], color: BONE,
    facts: ["Forms the bridge of the nose", "Commonly fractured", "Small paired bones"],
    connections: ["frontal", "ethmoid", "maxilla-r", "nasal-l"]
  },
  {
    id: "lacrimal-l", name: "Left Lacrimal Bone", latinName: "Os lacrimale", system: "Skeletal", region: "Face",
    description: "The lacrimal bone is the smallest bone of the face. It forms part of the medial wall of the orbit and contains the lacrimal fossa for the tear sac.",
    position: [0.15, 3.6, 0.22], scale: [0.03, 0.04, 0.02], color: BONE_DARK,
    facts: ["Smallest facial bone", "Size of a fingernail", "Houses the lacrimal (tear) sac"],
    connections: ["frontal", "ethmoid", "maxilla-l", "inf-nasal-concha-l"]
  },
  {
    id: "lacrimal-r", name: "Right Lacrimal Bone", latinName: "Os lacrimale", system: "Skeletal", region: "Face",
    description: "The lacrimal bone is the smallest bone of the face, forming part of the medial orbit wall.",
    position: [-0.15, 3.6, 0.22], scale: [0.03, 0.04, 0.02], color: BONE_DARK,
    facts: ["Smallest facial bone", "Size of a fingernail", "Houses the lacrimal sac"],
    connections: ["frontal", "ethmoid", "maxilla-r", "inf-nasal-concha-r"]
  },
  {
    id: "palatine-l", name: "Left Palatine Bone", latinName: "Os palatinum", system: "Skeletal", region: "Face",
    description: "The palatine bones form the posterior part of the hard palate, part of the nasal cavity floor, and part of the orbital floor.",
    position: [0.08, 3.35, 0.05], scale: [0.08, 0.06, 0.06], color: BONE_DEEP,
    facts: ["L-shaped bone", "Forms posterior hard palate", "Part of the nasal cavity wall"],
    connections: ["maxilla-l", "sphenoid", "palatine-r", "vomer", "inf-nasal-concha-l"]
  },
  {
    id: "palatine-r", name: "Right Palatine Bone", latinName: "Os palatinum", system: "Skeletal", region: "Face",
    description: "The palatine bones form the posterior part of the hard palate, part of the nasal cavity floor, and part of the orbital floor.",
    position: [-0.08, 3.35, 0.05], scale: [0.08, 0.06, 0.06], color: BONE_DEEP,
    facts: ["L-shaped bone", "Forms posterior hard palate", "Part of the nasal cavity wall"],
    connections: ["maxilla-r", "sphenoid", "palatine-l", "vomer", "inf-nasal-concha-r"]
  },
  {
    id: "inf-nasal-concha-l", name: "Left Inferior Nasal Concha", latinName: "Concha nasalis inferior", system: "Skeletal", region: "Face",
    description: "The inferior nasal conchae are scroll-shaped bones on the lateral walls of the nasal cavity. They increase turbulence and filtration of inhaled air.",
    position: [0.08, 3.5, 0.18], scale: [0.06, 0.04, 0.04], color: BONE_DARK,
    facts: ["Only concha that is a separate bone", "Warms and humidifies inhaled air", "Scroll-shaped turbinate"],
    connections: ["maxilla-l", "lacrimal-l", "ethmoid", "palatine-l"]
  },
  {
    id: "inf-nasal-concha-r", name: "Right Inferior Nasal Concha", latinName: "Concha nasalis inferior", system: "Skeletal", region: "Face",
    description: "The inferior nasal conchae are scroll-shaped bones on the lateral walls of the nasal cavity.",
    position: [-0.08, 3.5, 0.18], scale: [0.06, 0.04, 0.04], color: BONE_DARK,
    facts: ["Only concha that is a separate bone", "Warms and humidifies air", "Scroll-shaped turbinate"],
    connections: ["maxilla-r", "lacrimal-r", "ethmoid", "palatine-r"]
  },
  {
    id: "vomer", name: "Vomer", latinName: "Vomer", system: "Skeletal", region: "Face",
    description: "The vomer is a thin, flat bone forming the inferior part of the nasal septum. Its name means 'plowshare' due to its shape.",
    position: [0, 3.5, 0.15], scale: [0.02, 0.1, 0.08], color: BONE_DEEP,
    facts: ["Forms the inferior nasal septum", "Name means 'plowshare'", "One of the few unpaired facial bones"],
    connections: ["ethmoid", "maxilla-l", "maxilla-r", "palatine-l", "palatine-r", "sphenoid"]
  },
];

// ─── HYOID (1) ───────────────────────────────────────────
const hyoid: BonePart[] = [
  {
    id: "hyoid", name: "Hyoid Bone", latinName: "Os hyoideum", system: "Skeletal", region: "Axial",
    description: "The hyoid is a U-shaped bone in the neck that does not articulate with any other bone. It supports the tongue and aids in swallowing and speech.",
    position: [0, 3.05, 0.15], scale: [0.12, 0.05, 0.06], color: BONE_ALT,
    facts: ["Only bone not articulating with another bone", "Supports the tongue", "Key in forensic analysis of strangulation"],
    connections: []
  },
];

// ─── AUDITORY OSSICLES (6) ──────────────────────────────
const ossicles: BonePart[] = [
  {
    id: "malleus-l", name: "Left Malleus", latinName: "Malleus", system: "Skeletal", region: "Ear Ossicles",
    description: "The malleus (hammer) is the largest ossicle. It is attached to the tympanic membrane and transmits sound vibrations to the incus.",
    position: [0.42, 3.82, -0.08], scale: [0.015, 0.02, 0.015], color: BONE,
    facts: ["Largest auditory ossicle", "Latin for 'hammer'", "Attached to the eardrum"],
    connections: ["incus-l"]
  },
  {
    id: "malleus-r", name: "Right Malleus", latinName: "Malleus", system: "Skeletal", region: "Ear Ossicles",
    description: "The malleus (hammer) is the largest ossicle, attached to the tympanic membrane.",
    position: [-0.42, 3.82, -0.08], scale: [0.015, 0.02, 0.015], color: BONE,
    facts: ["Largest auditory ossicle", "Latin for 'hammer'", "Attached to the eardrum"],
    connections: ["incus-r"]
  },
  {
    id: "incus-l", name: "Left Incus", latinName: "Incus", system: "Skeletal", region: "Ear Ossicles",
    description: "The incus (anvil) is the middle ear ossicle that connects the malleus to the stapes, transmitting vibrations.",
    position: [0.43, 3.82, -0.1], scale: [0.012, 0.015, 0.012], color: BONE_ALT,
    facts: ["Latin for 'anvil'", "Middle ossicle in the chain", "Connects malleus to stapes"],
    connections: ["malleus-l", "stapes-l"]
  },
  {
    id: "incus-r", name: "Right Incus", latinName: "Incus", system: "Skeletal", region: "Ear Ossicles",
    description: "The incus (anvil) is the middle ear ossicle connecting malleus to stapes.",
    position: [-0.43, 3.82, -0.1], scale: [0.012, 0.015, 0.012], color: BONE_ALT,
    facts: ["Latin for 'anvil'", "Middle ossicle", "Connects malleus to stapes"],
    connections: ["malleus-r", "stapes-r"]
  },
  {
    id: "stapes-l", name: "Left Stapes", latinName: "Stapes", system: "Skeletal", region: "Ear Ossicles",
    description: "The stapes (stirrup) is the smallest bone in the human body. It transmits sound vibrations from the incus to the oval window of the inner ear.",
    position: [0.44, 3.82, -0.12], scale: [0.01, 0.01, 0.01], color: BONE_DARK,
    facts: ["Smallest bone in the body (~3mm)", "Latin for 'stirrup'", "Transmits vibrations to inner ear"],
    connections: ["incus-l"]
  },
  {
    id: "stapes-r", name: "Right Stapes", latinName: "Stapes", system: "Skeletal", region: "Ear Ossicles",
    description: "The stapes (stirrup) is the smallest bone in the human body.",
    position: [-0.44, 3.82, -0.12], scale: [0.01, 0.01, 0.01], color: BONE_DARK,
    facts: ["Smallest bone in the body (~3mm)", "Latin for 'stirrup'", "Transmits vibrations to inner ear"],
    connections: ["incus-r"]
  },
];

// ─── VERTEBRAL COLUMN (26) ──────────────────────────────
const vertebralColumn: BonePart[] = [
  // Cervical (7)
  {
    id: "c1-atlas", name: "Atlas (C1)", latinName: "Atlas", system: "Skeletal", region: "Vertebral Column",
    description: "The atlas is the first cervical vertebra. It supports the skull and allows the nodding motion of the head. Unlike other vertebrae, it has no body or spinous process.",
    position: [0, 3.0, -0.1], scale: [0.15, 0.04, 0.15], color: BONE_DARK,
    facts: ["Named after Greek titan Atlas", "No vertebral body", "Allows 'yes' nodding motion"],
    connections: ["occipital", "c2-axis"]
  },
  {
    id: "c2-axis", name: "Axis (C2)", latinName: "Axis", system: "Skeletal", region: "Vertebral Column",
    description: "The axis is the second cervical vertebra. Its dens (odontoid process) acts as a pivot for the atlas, allowing head rotation.",
    position: [0, 2.95, -0.1], scale: [0.14, 0.04, 0.14], color: BONE_DARK,
    facts: ["Has the dens (odontoid process)", "Allows 'no' head rotation", "Fracture can be fatal"],
    connections: ["c1-atlas", "c3"]
  },
  {
    id: "c3", name: "Cervical Vertebra C3", latinName: "Vertebra cervicalis III", system: "Skeletal", region: "Vertebral Column",
    description: "The third cervical vertebra is a typical cervical vertebra with a bifid spinous process and transverse foramina for vertebral arteries.",
    position: [0, 2.88, -0.1], scale: [0.13, 0.04, 0.13], color: BONE_DEEP,
    facts: ["Typical cervical vertebra", "Has bifid spinous process", "Contains transverse foramina"],
    connections: ["c2-axis", "c4"]
  },
  {
    id: "c4", name: "Cervical Vertebra C4", latinName: "Vertebra cervicalis IV", system: "Skeletal", region: "Vertebral Column",
    description: "The fourth cervical vertebra. The C3-C6 vertebrae are typical cervical vertebrae with similar structure.",
    position: [0, 2.82, -0.1], scale: [0.13, 0.04, 0.13], color: BONE_DEEP,
    facts: ["Typical cervical vertebra", "Phrenic nerve originates at C3-C5", "Injury here may affect breathing"],
    connections: ["c3", "c5"]
  },
  {
    id: "c5", name: "Cervical Vertebra C5", latinName: "Vertebra cervicalis V", system: "Skeletal", region: "Vertebral Column",
    description: "The fifth cervical vertebra. Part of the phrenic nerve origin (C3-C5) which innervates the diaphragm.",
    position: [0, 2.76, -0.1], scale: [0.13, 0.04, 0.13], color: BONE_DEEP,
    facts: ["Part of phrenic nerve origin", "Typical cervical vertebra", "Common site of disc herniation"],
    connections: ["c4", "c6"]
  },
  {
    id: "c6", name: "Cervical Vertebra C6", latinName: "Vertebra cervicalis VI", system: "Skeletal", region: "Vertebral Column",
    description: "The sixth cervical vertebra, also known as the vertebra prominens landmark. Its carotid tubercle is a surgical landmark.",
    position: [0, 2.7, -0.1], scale: [0.14, 0.04, 0.14], color: BONE_DEEP,
    facts: ["Carotid tubercle (Chassaignac's tubercle)", "Surgical landmark for carotid artery", "Larger than C3-C5"],
    connections: ["c5", "c7"]
  },
  {
    id: "c7", name: "Cervical Vertebra C7", latinName: "Vertebra prominens", system: "Skeletal", region: "Vertebral Column",
    description: "The seventh cervical vertebra is called the vertebra prominens because of its long, prominent spinous process that is easily palpated at the base of the neck.",
    position: [0, 2.64, -0.12], scale: [0.15, 0.04, 0.15], color: BONE_DEEP,
    facts: ["Called 'vertebra prominens'", "Most prominent spinous process in neck", "Easily felt at base of neck"],
    connections: ["c6", "t1"]
  },
  // Thoracic (12)
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `t${i + 1}`,
    name: `Thoracic Vertebra T${i + 1}`,
    latinName: `Vertebra thoracica ${["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"][i]}`,
    system: "Skeletal",
    region: "Vertebral Column",
    description: `The ${["first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth","eleventh","twelfth"][i]} thoracic vertebra articulates with the ${["1st","2nd","3rd","4th","5th","6th","7th","8th","9th","10th","11th","12th"][i]} pair of ribs. Thoracic vertebrae increase in size from T1 to T12.`,
    position: [0, 2.55 - i * 0.12, -0.2] as [number, number, number],
    scale: [0.15 + i * 0.005, 0.04, 0.15 + i * 0.005] as [number, number, number],
    color: BONE_DEEP,
    facts: [
      `Articulates with rib ${i + 1}`,
      i < 10 ? "Has costal facets for rib articulation" : "Resembles lumbar vertebra",
      i === 0 ? "Transitional vertebra (cervical-thoracic)" : i === 11 ? "Transitional vertebra (thoracic-lumbar)" : "Limited range of motion due to rib attachment"
    ],
    connections: [i === 0 ? "c7" : `t${i}`, i < 11 ? `t${i + 2}` : "l1", `rib-l-${i + 1}`, `rib-r-${i + 1}`].filter(Boolean)
  } as BonePart)),
  // Lumbar (5)
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `l${i + 1}`,
    name: `Lumbar Vertebra L${i + 1}`,
    latinName: `Vertebra lumbalis ${["I","II","III","IV","V"][i]}`,
    system: "Skeletal",
    region: "Vertebral Column",
    description: `The ${["first","second","third","fourth","fifth"][i]} lumbar vertebra. Lumbar vertebrae are the largest vertebrae and bear the most body weight.`,
    position: [0, 1.1 - i * 0.14, -0.15] as [number, number, number],
    scale: [0.2 + i * 0.005, 0.05, 0.18] as [number, number, number],
    color: BONE_DEEP,
    facts: [
      "Largest movable vertebrae",
      "Bears most body weight",
      i === 3 || i === 4 ? "Most common site of disc herniation" : "No rib articulation"
    ],
    connections: [i === 0 ? "t12" : `l${i}`, i < 4 ? `l${i + 2}` : "sacrum"]
  } as BonePart)),
  // Sacrum (1 - 5 fused)
  {
    id: "sacrum", name: "Sacrum", latinName: "Os sacrum", system: "Skeletal", region: "Vertebral Column",
    description: "The sacrum is a large triangular bone formed by the fusion of five sacral vertebrae (S1-S5). It forms the posterior wall of the pelvis.",
    position: [0, 0.35, -0.18], scale: [0.25, 0.25, 0.1], color: BONE_ALT,
    facts: ["5 fused vertebrae", "Forms posterior pelvis", "Transmits body weight to hip bones via sacroiliac joints"],
    connections: ["l5", "coccyx", "hipbone-l", "hipbone-r"]
  },
  // Coccyx (1 - 3-5 fused)
  {
    id: "coccyx", name: "Coccyx", latinName: "Os coccygis", system: "Skeletal", region: "Vertebral Column",
    description: "The coccyx (tailbone) is formed by the fusion of 3-5 small vertebrae. It is the vestigial remnant of a tail.",
    position: [0, 0.15, -0.2], scale: [0.08, 0.1, 0.05], color: BONE_DARK,
    facts: ["Vestigial tailbone", "3-5 fused vertebrae", "Provides attachment for pelvic floor muscles"],
    connections: ["sacrum"]
  },
];

// ─── THORAX: RIBS (24) + STERNUM (1) ───────────────────
const sternum: BonePart[] = [
  {
    id: "sternum", name: "Sternum", latinName: "Sternum", system: "Skeletal", region: "Thorax",
    description: "The sternum (breastbone) is a flat bone at the front of the chest. It consists of the manubrium, body, and xiphoid process.",
    position: [0, 2.1, 0.2], scale: [0.15, 0.6, 0.08], color: BONE,
    facts: ["Composed of 3 parts: manubrium, body, xiphoid", "Protects heart and great vessels", "Site for bone marrow biopsy"],
    connections: ["clavicle-l", "clavicle-r", "rib-l-1", "rib-r-1"]
  },
];

const ribs: BonePart[] = Array.from({ length: 12 }, (_, i) => {
  const num = i + 1;
  const isTrue = num <= 7;
  const isFalse = num >= 8 && num <= 10;
  const isFloating = num >= 11;
  const type = isTrue ? "True rib" : isFalse ? "False rib" : "Floating rib";
  const yPos = 2.5 - i * 0.1;
  const xSpread = 0.3 + i * 0.03;
  const width = 0.5 + Math.min(i, 7) * 0.04 - Math.max(0, i - 8) * 0.03;

  return [
    {
      id: `rib-l-${num}`, name: `Left Rib ${num}`, latinName: `Costa ${["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"][i]}`, system: "Skeletal", region: "Thorax",
      description: `Rib ${num} is a ${type.toLowerCase()}. ${isTrue ? "It attaches directly to the sternum via costal cartilage." : isFalse ? "It attaches to the sternum indirectly via the costal cartilage of rib 7." : "It has no anterior attachment to the sternum."}`,
      position: [xSpread, yPos, 0.05] as [number, number, number],
      scale: [width, 0.03, 0.2] as [number, number, number],
      color: i % 2 === 0 ? BONE_ALT : BONE_DARK,
      facts: [type, `Rib pair ${num} of 12`, isFloating ? "No sternal attachment" : isTrue ? "Directly attached to sternum" : "Indirectly attached via rib 7 cartilage"],
      connections: [`t${num}`, `rib-r-${num}`, ...(isTrue ? ["sternum"] : [])],
    } as BonePart,
    {
      id: `rib-r-${num}`, name: `Right Rib ${num}`, latinName: `Costa ${["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"][i]}`, system: "Skeletal", region: "Thorax",
      description: `Rib ${num} is a ${type.toLowerCase()}. ${isTrue ? "It attaches directly to the sternum via costal cartilage." : isFalse ? "It attaches indirectly to the sternum." : "It has no anterior attachment."}`,
      position: [-xSpread, yPos, 0.05] as [number, number, number],
      scale: [width, 0.03, 0.2] as [number, number, number],
      color: i % 2 === 0 ? BONE_ALT : BONE_DARK,
      facts: [type, `Rib pair ${num} of 12`, isFloating ? "No sternal attachment" : isTrue ? "Directly attached to sternum" : "Indirectly attached via rib 7 cartilage"],
      connections: [`t${num}`, `rib-l-${num}`, ...(isTrue ? ["sternum"] : [])],
    } as BonePart,
  ];
}).flat();

// ═══════════════════════════════════════════════════════════
// APPENDICULAR SKELETON (126 bones)
// ═══════════════════════════════════════════════════════════

// ─── PECTORAL GIRDLE (4) ────────────────────────────────
const pectoralGirdle: BonePart[] = [
  ...pair({
    baseId: "clavicle", baseName: "Clavicle", latinName: "Clavicula", system: "Skeletal", region: "Pectoral Girdle",
    description: "The clavicle (collarbone) connects the arm to the trunk. It is the most commonly fractured bone in the body.",
    posL: [0.55, 2.45, 0.1], posR: [-0.55, 2.45, 0.1],
    scale: [0.6, 0.08, 0.08], color: BONE,
    facts: ["Most commonly fractured bone", "Only long bone that lies horizontally", "Connects scapula to sternum"],
    connectionsL: ["scapula-l", "sternum"], connectionsR: ["scapula-r", "sternum"]
  }),
  ...pair({
    baseId: "scapula", baseName: "Scapula", latinName: "Scapula", system: "Skeletal", region: "Pectoral Girdle",
    description: "The scapula (shoulder blade) is a flat, triangular bone on the upper back providing attachment for 17 muscles.",
    posL: [0.7, 2.2, -0.2], posR: [-0.7, 2.2, -0.2],
    scale: [0.35, 0.45, 0.1], color: BONE_ALT,
    facts: ["Triangular flat bone", "17 muscles attach to it", "Connects to humerus and clavicle"],
    connectionsL: ["clavicle-l", "humerus-l"], connectionsR: ["clavicle-r", "humerus-r"]
  }),
];

// ─── UPPER LIMB BONES (per side: humerus, radius, ulna, 8 carpals, 5 metacarpals, 14 phalanges = 30 × 2 = 60) ──
const upperLimbLong: BonePart[] = [
  ...pair({
    baseId: "humerus", baseName: "Humerus", latinName: "Humerus", system: "Skeletal", region: "Upper Limb",
    description: "The humerus is the long bone of the upper arm, extending from shoulder to elbow. It is the longest bone of the upper limb.",
    posL: [1.1, 1.7, 0], posR: [-1.1, 1.7, 0],
    scale: [0.12, 0.8, 0.12], color: BONE,
    facts: ["Longest bone of the upper limb", "Ball-and-socket joint at shoulder", "Hinge joint at elbow"],
    connectionsL: ["scapula-l", "radius-l", "ulna-l"], connectionsR: ["scapula-r", "radius-r", "ulna-r"]
  }),
  ...pair({
    baseId: "radius", baseName: "Radius", latinName: "Radius", system: "Skeletal", region: "Upper Limb",
    description: "The radius is the lateral bone of the forearm (thumb side). It rotates around the ulna to allow pronation and supination.",
    posL: [1.2, 0.85, 0.08], posR: [-1.2, 0.85, 0.08],
    scale: [0.07, 0.7, 0.07], color: BONE_ALT,
    facts: ["Lateral forearm bone", "Allows wrist rotation (pronation/supination)", "Colles' fracture is most common radius fracture"],
    connectionsL: ["humerus-l", "ulna-l", "scaphoid-l", "lunate-l"], connectionsR: ["humerus-r", "ulna-r", "scaphoid-r", "lunate-r"]
  }),
  ...pair({
    baseId: "ulna", baseName: "Ulna", latinName: "Ulna", system: "Skeletal", region: "Upper Limb",
    description: "The ulna is the medial bone of the forearm (pinky side). Its olecranon process forms the point of the elbow.",
    posL: [1.05, 0.85, -0.05], posR: [-1.05, 0.85, -0.05],
    scale: [0.07, 0.7, 0.07], color: BONE_DARK,
    facts: ["Medial forearm bone", "Olecranon forms the elbow point", "Stabilizes the forearm"],
    connectionsL: ["humerus-l", "radius-l", "triquetrum-l", "pisiform-l"], connectionsR: ["humerus-r", "radius-r", "triquetrum-r", "pisiform-r"]
  }),
];

// Carpal bones (8 per hand = 16)
const carpalNames: { id: string; name: string; latin: string; desc: string; facts: string[]; row: "proximal" | "distal"; xOff: number; yOff: number }[] = [
  // Proximal row (lateral to medial)
  { id: "scaphoid", name: "Scaphoid", latin: "Os scaphoideum", desc: "The scaphoid is the most commonly fractured carpal bone. It is boat-shaped and located on the thumb side of the wrist.", facts: ["Most fractured carpal bone", "Boat-shaped (Greek: skaphe)", "Blood supply is retrograde, risking avascular necrosis"], row: "proximal", xOff: 0.08, yOff: 0 },
  { id: "lunate", name: "Lunate", latin: "Os lunatum", desc: "The lunate is a crescent-shaped carpal bone that articulates with the radius above. Dislocation is the most common carpal dislocation.", facts: ["Crescent/moon-shaped", "Most commonly dislocated carpal", "Central in the proximal row"], row: "proximal", xOff: 0.03, yOff: 0 },
  { id: "triquetrum", name: "Triquetrum", latin: "Os triquetrum", desc: "The triquetrum is a pyramidal-shaped carpal bone on the medial side of the proximal row.", facts: ["Pyramidal shape", "Medial side of proximal row", "Second most fractured carpal after scaphoid"], row: "proximal", xOff: -0.03, yOff: 0 },
  { id: "pisiform", name: "Pisiform", latin: "Os pisiforme", desc: "The pisiform is the smallest carpal bone, shaped like a pea. It is a sesamoid bone embedded in the tendon of flexor carpi ulnaris.", facts: ["Smallest carpal bone", "Sesamoid bone (within a tendon)", "Pea-shaped; Latin: pisum = pea"], row: "proximal", xOff: -0.06, yOff: 0.02 },
  // Distal row (lateral to medial)
  { id: "trapezium", name: "Trapezium", latin: "Os trapezium", desc: "The trapezium articulates with the first metacarpal, forming the saddle joint of the thumb that allows opposition.", facts: ["Saddle joint with thumb metacarpal", "Enables thumb opposition", "Key for grip strength"], row: "distal", xOff: 0.08, yOff: -0.04 },
  { id: "trapezoid", name: "Trapezoid", latin: "Os trapezoideum", desc: "The trapezoid is the smallest bone in the distal carpal row. It is wedge-shaped and articulates with the second metacarpal.", facts: ["Smallest distal carpal", "Wedge-shaped", "Least commonly fractured carpal"], row: "distal", xOff: 0.03, yOff: -0.04 },
  { id: "capitate", name: "Capitate", latin: "Os capitatum", desc: "The capitate is the largest carpal bone, located in the center of the wrist. It articulates with the third metacarpal.", facts: ["Largest carpal bone", "First carpal to ossify", "Central 'keystone' of the wrist"], row: "distal", xOff: -0.02, yOff: -0.04 },
  { id: "hamate", name: "Hamate", latin: "Os hamatum", desc: "The hamate has a distinctive hook-shaped process (hamulus). It is on the medial side of the distal row.", facts: ["Has a hook (hamulus)", "Ulnar nerve passes near the hook", "Hook fracture common in racquet sports"], row: "distal", xOff: -0.06, yOff: -0.04 },
];

const carpals: BonePart[] = carpalNames.flatMap((c) => {
  const baseX = 1.15;
  const baseY = 0.32;
  return [
    {
      id: `${c.id}-l`, name: `Left ${c.name}`, latinName: c.latin, system: "Skeletal", region: "Wrist (Carpals)",
      description: c.desc, position: [baseX + c.xOff, baseY + c.yOff, 0.05] as [number, number, number],
      scale: [0.03, 0.03, 0.025] as [number, number, number], color: BONE_ALT,
      facts: c.facts, connections: []
    },
    {
      id: `${c.id}-r`, name: `Right ${c.name}`, latinName: c.latin, system: "Skeletal", region: "Wrist (Carpals)",
      description: c.desc, position: [-(baseX + c.xOff), baseY + c.yOff, 0.05] as [number, number, number],
      scale: [0.03, 0.03, 0.025] as [number, number, number], color: BONE_ALT,
      facts: c.facts, connections: []
    },
  ];
});

// Metacarpals (5 per hand = 10)
const metacarpals: BonePart[] = Array.from({ length: 5 }, (_, i) => {
  const num = i + 1;
  const fingerName = ["Thumb","Index","Middle","Ring","Little"][i];
  const xOff = 0.08 - i * 0.035;
  return [
    {
      id: `metacarpal-${num}-l`, name: `Left Metacarpal ${num} (${fingerName})`, latinName: `Os metacarpale ${["I","II","III","IV","V"][i]}`, system: "Skeletal", region: "Hand (Metacarpals)",
      description: `The ${num === 1 ? "first" : num === 2 ? "second" : num === 3 ? "third" : num === 4 ? "fourth" : "fifth"} metacarpal connects the carpals to the ${fingerName.toLowerCase()} finger's proximal phalanx.`,
      position: [1.18 + xOff, 0.2, 0.06] as [number, number, number],
      scale: [0.02, 0.08, 0.02] as [number, number, number], color: BONE,
      facts: [num === 1 ? "Shortest and most mobile metacarpal" : num === 3 ? "Longest metacarpal" : `Supports the ${fingerName.toLowerCase()} finger`, `Metacarpal ${num} of 5`, num === 5 ? "Boxer's fracture is fracture of 5th metacarpal neck" : "Connected to carpal bones proximally"],
      connections: []
    } as BonePart,
    {
      id: `metacarpal-${num}-r`, name: `Right Metacarpal ${num} (${fingerName})`, latinName: `Os metacarpale ${["I","II","III","IV","V"][i]}`, system: "Skeletal", region: "Hand (Metacarpals)",
      description: `The ${num === 1 ? "first" : num === 2 ? "second" : num === 3 ? "third" : num === 4 ? "fourth" : "fifth"} metacarpal connects the carpals to the ${fingerName.toLowerCase()} finger.`,
      position: [-(1.18 + xOff), 0.2, 0.06] as [number, number, number],
      scale: [0.02, 0.08, 0.02] as [number, number, number], color: BONE,
      facts: [num === 1 ? "Shortest and most mobile metacarpal" : num === 3 ? "Longest metacarpal" : `Supports the ${fingerName.toLowerCase()} finger`, `Metacarpal ${num} of 5`, num === 5 ? "Boxer's fracture common here" : "Connected to carpal bones proximally"],
      connections: []
    } as BonePart,
  ];
}).flat();

// Phalanges of hand (14 per hand = 28): thumb has 2 (proximal, distal), fingers have 3 each
const handPhalanges: BonePart[] = (() => {
  const fingers = [
    { name: "Thumb", segments: ["Proximal", "Distal"], xOff: 0.1 },
    { name: "Index Finger", segments: ["Proximal", "Middle", "Distal"], xOff: 0.06 },
    { name: "Middle Finger", segments: ["Proximal", "Middle", "Distal"], xOff: 0.03 },
    { name: "Ring Finger", segments: ["Proximal", "Middle", "Distal"], xOff: -0.01 },
    { name: "Little Finger", segments: ["Proximal", "Middle", "Distal"], xOff: -0.05 },
  ];
  const result: BonePart[] = [];
  fingers.forEach((f) => {
    f.segments.forEach((seg, si) => {
      const fingerId = f.name.toLowerCase().replace(/ /g, "-");
      const yBase = 0.12 - si * 0.04;
      ["l", "r"].forEach((side) => {
        const sign = side === "l" ? 1 : -1;
        result.push({
          id: `phalanx-${seg.toLowerCase()}-${fingerId}-${side}`,
          name: `${side === "l" ? "Left" : "Right"} ${seg} Phalanx (${f.name})`,
          latinName: `Phalanx ${seg === "Proximal" ? "proximalis" : seg === "Middle" ? "media" : "distalis"} manus`,
          system: "Skeletal", region: "Hand (Phalanges)",
          description: `The ${seg.toLowerCase()} phalanx of the ${f.name.toLowerCase()}. ${f.name === "Thumb" ? "The thumb has only 2 phalanges (no middle)." : "Each finger has 3 phalanges."}`,
          position: [sign * (1.18 + f.xOff), yBase, 0.06] as [number, number, number],
          scale: [0.015, 0.03, 0.015] as [number, number, number],
          color: BONE_ALT,
          facts: [
            `${seg} phalanx of ${f.name.toLowerCase()}`,
            f.name === "Thumb" ? "Thumb has 2 phalanges" : "Fingers have 3 phalanges each",
            seg === "Distal" ? "Contains the fingernail bed" : "Hinge joint allows flexion/extension"
          ],
          connections: []
        });
      });
    });
  });
  return result;
})();

// ─── PELVIC GIRDLE (2) ──────────────────────────────────
const pelvicGirdle: BonePart[] = [
  ...pair({
    baseId: "hipbone", baseName: "Hip Bone", latinName: "Os coxae", system: "Skeletal", region: "Pelvic Girdle",
    description: "The hip bone (os coxae) is formed by the fusion of the ilium, ischium, and pubis. Together with the sacrum and coccyx, they form the pelvis.",
    posL: [0.3, 0.4, 0], posR: [-0.3, 0.4, 0],
    scale: [0.35, 0.45, 0.35], color: BONE_ALT,
    facts: ["Composed of 3 fused bones: ilium, ischium, pubis", "Female pelvis is wider for childbirth", "Acetabulum is the hip socket"],
    connectionsL: ["sacrum", "femur-l"], connectionsR: ["sacrum", "femur-r"]
  }),
];

// ─── LOWER LIMB BONES (per side: femur, patella, tibia, fibula, 7 tarsals, 5 metatarsals, 14 phalanges = 30 × 2 = 60) ──
const lowerLimbLong: BonePart[] = [
  ...pair({
    baseId: "femur", baseName: "Femur", latinName: "Femur", system: "Skeletal", region: "Lower Limb",
    description: "The femur is the longest and strongest bone in the human body. It extends from hip to knee and supports the body's weight.",
    posL: [0.4, -0.55, 0], posR: [-0.4, -0.55, 0],
    scale: [0.13, 1.1, 0.13], color: BONE,
    facts: ["Longest bone in the body", "Strongest bone — supports up to 30× body weight", "Ball-and-socket joint at hip, hinge at knee"],
    connectionsL: ["hipbone-l", "patella-l", "tibia-l"], connectionsR: ["hipbone-r", "patella-r", "tibia-r"]
  }),
  ...pair({
    baseId: "patella", baseName: "Patella", latinName: "Patella", system: "Skeletal", region: "Lower Limb",
    description: "The patella (kneecap) is the largest sesamoid bone. It protects the knee joint and increases the leverage of the quadriceps tendon.",
    posL: [0.4, -1.15, 0.15], posR: [-0.4, -1.15, 0.15],
    scale: [0.12, 0.12, 0.08], color: BONE,
    facts: ["Largest sesamoid bone", "Protects the knee joint", "Improves quadriceps leverage by ~30%"],
    connectionsL: ["femur-l", "tibia-l"], connectionsR: ["femur-r", "tibia-r"]
  }),
  ...pair({
    baseId: "tibia", baseName: "Tibia", latinName: "Tibia", system: "Skeletal", region: "Lower Limb",
    description: "The tibia (shinbone) is the second longest bone. It is the weight-bearing bone of the lower leg.",
    posL: [0.35, -2.0, 0.05], posR: [-0.35, -2.0, 0.05],
    scale: [0.1, 1.0, 0.1], color: BONE,
    facts: ["Second longest bone in the body", "Primary weight-bearing bone of the leg", "Latin: tibia = flute (ancient flutes were made from this bone)"],
    connectionsL: ["patella-l", "femur-l", "fibula-l", "talus-l"], connectionsR: ["patella-r", "femur-r", "fibula-r", "talus-r"]
  }),
  ...pair({
    baseId: "fibula", baseName: "Fibula", latinName: "Fibula", system: "Skeletal", region: "Lower Limb",
    description: "The fibula is the slender bone lateral to the tibia. It does not bear weight but provides muscle attachment and stabilizes the ankle.",
    posL: [0.5, -2.0, 0], posR: [-0.5, -2.0, 0],
    scale: [0.06, 0.95, 0.06], color: BONE_DARK,
    facts: ["Non-weight-bearing", "Lateral ankle stabilizer (lateral malleolus)", "Thinnest long bone in the body"],
    connectionsL: ["tibia-l", "talus-l"], connectionsR: ["tibia-r", "talus-r"]
  }),
];

// Tarsal bones (7 per foot = 14)
const tarsalNames: { id: string; name: string; latin: string; desc: string; facts: string[]; xOff: number; yOff: number; zOff: number }[] = [
  { id: "talus", name: "Talus", latin: "Talus", desc: "The talus is the bone that articulates with the tibia and fibula to form the ankle joint. It bears the entire weight of the body above.", facts: ["Forms the ankle joint", "No muscles attach directly to it", "Bears entire body weight"], xOff: 0, yOff: 0, zOff: 0 },
  { id: "calcaneus", name: "Calcaneus", latin: "Calcaneus", desc: "The calcaneus (heel bone) is the largest tarsal bone. The Achilles tendon inserts on its posterior surface.", facts: ["Largest tarsal bone", "Achilles tendon attachment", "Most commonly fractured tarsal"], xOff: 0, yOff: 0, zOff: -0.06 },
  { id: "navicular-foot", name: "Navicular", latin: "Os naviculare pedis", desc: "The navicular is a boat-shaped tarsal bone on the medial side of the foot, between the talus and the cuneiforms.", facts: ["Boat-shaped (Latin: navis = ship)", "Keystone of the medial arch", "Stress fracture common in athletes"], xOff: -0.02, yOff: 0, zOff: 0.04 },
  { id: "cuboid", name: "Cuboid", latin: "Os cuboideum", desc: "The cuboid is on the lateral side of the foot, anterior to the calcaneus. It articulates with the 4th and 5th metatarsals.", facts: ["Cube-shaped", "Lateral side of foot", "Groove for peroneus longus tendon"], xOff: 0.04, yOff: 0, zOff: 0.05 },
  { id: "medial-cuneiform", name: "Medial Cuneiform", latin: "Os cuneiforme mediale", desc: "The medial cuneiform is the largest of the three cuneiform bones. It articulates with the first metatarsal.", facts: ["Largest cuneiform", "Articulates with big toe metatarsal", "Wedge-shaped"], xOff: -0.04, yOff: 0, zOff: 0.07 },
  { id: "intermediate-cuneiform", name: "Intermediate Cuneiform", latin: "Os cuneiforme intermedium", desc: "The intermediate cuneiform is the smallest cuneiform, located between the medial and lateral cuneiforms.", facts: ["Smallest cuneiform", "Middle position", "Articulates with 2nd metatarsal"], xOff: -0.01, yOff: 0, zOff: 0.07 },
  { id: "lateral-cuneiform", name: "Lateral Cuneiform", latin: "Os cuneiforme laterale", desc: "The lateral cuneiform is between the intermediate cuneiform and the cuboid. It articulates with the third metatarsal.", facts: ["Intermediate in size", "Articulates with 3rd metatarsal", "Wedge-shaped"], xOff: 0.02, yOff: 0, zOff: 0.07 },
];

const tarsals: BonePart[] = tarsalNames.flatMap((t) => {
  const baseX = 0.38;
  const baseY = -2.65;
  const baseZ = 0.1;
  return [
    {
      id: `${t.id}-l`, name: `Left ${t.name}`, latinName: t.latin, system: "Skeletal", region: "Foot (Tarsals)",
      description: t.desc,
      position: [baseX + t.xOff, baseY + t.yOff, baseZ + t.zOff] as [number, number, number],
      scale: [0.035, 0.025, 0.035] as [number, number, number], color: BONE_ALT,
      facts: t.facts, connections: []
    },
    {
      id: `${t.id}-r`, name: `Right ${t.name}`, latinName: t.latin, system: "Skeletal", region: "Foot (Tarsals)",
      description: t.desc,
      position: [-(baseX + t.xOff), baseY + t.yOff, baseZ + t.zOff] as [number, number, number],
      scale: [0.035, 0.025, 0.035] as [number, number, number], color: BONE_ALT,
      facts: t.facts, connections: []
    },
  ];
});

// Metatarsals (5 per foot = 10)
const metatarsals: BonePart[] = Array.from({ length: 5 }, (_, i) => {
  const num = i + 1;
  const toeName = ["Big Toe","2nd Toe","3rd Toe","4th Toe","Little Toe"][i];
  const xOff = -0.04 + i * 0.025;
  return [
    {
      id: `metatarsal-${num}-l`, name: `Left Metatarsal ${num} (${toeName})`, latinName: `Os metatarsale ${["I","II","III","IV","V"][i]}`, system: "Skeletal", region: "Foot (Metatarsals)",
      description: `The ${num === 1 ? "first" : num === 2 ? "second" : num === 3 ? "third" : num === 4 ? "fourth" : "fifth"} metatarsal connects the tarsals to the ${toeName.toLowerCase()} phalanges.`,
      position: [0.38 + xOff, -2.68, 0.22] as [number, number, number],
      scale: [0.02, 0.02, 0.06] as [number, number, number], color: BONE,
      facts: [num === 1 ? "Thickest metatarsal; bears most weight" : num === 2 ? "Longest metatarsal" : num === 5 ? "Jones fracture occurs at the base" : `Supports the ${toeName.toLowerCase()}`, `Metatarsal ${num} of 5`, "Part of the foot's arch structure"],
      connections: []
    } as BonePart,
    {
      id: `metatarsal-${num}-r`, name: `Right Metatarsal ${num} (${toeName})`, latinName: `Os metatarsale ${["I","II","III","IV","V"][i]}`, system: "Skeletal", region: "Foot (Metatarsals)",
      description: `The ${num === 1 ? "first" : num === 2 ? "second" : num === 3 ? "third" : num === 4 ? "fourth" : "fifth"} metatarsal connects the tarsals to the ${toeName.toLowerCase()} phalanges.`,
      position: [-(0.38 + xOff), -2.68, 0.22] as [number, number, number],
      scale: [0.02, 0.02, 0.06] as [number, number, number], color: BONE,
      facts: [num === 1 ? "Thickest metatarsal" : num === 2 ? "Longest metatarsal" : num === 5 ? "Jones fracture occurs here" : `Supports ${toeName.toLowerCase()}`, `Metatarsal ${num} of 5`, "Part of the foot's arch"],
      connections: []
    } as BonePart,
  ];
}).flat();

// Phalanges of foot (14 per foot = 28): big toe has 2, other toes have 3
const footPhalanges: BonePart[] = (() => {
  const toes = [
    { name: "Big Toe", segments: ["Proximal", "Distal"], xOff: -0.04 },
    { name: "2nd Toe", segments: ["Proximal", "Middle", "Distal"], xOff: -0.015 },
    { name: "3rd Toe", segments: ["Proximal", "Middle", "Distal"], xOff: 0.01 },
    { name: "4th Toe", segments: ["Proximal", "Middle", "Distal"], xOff: 0.035 },
    { name: "Little Toe", segments: ["Proximal", "Middle", "Distal"], xOff: 0.06 },
  ];
  const result: BonePart[] = [];
  toes.forEach((t) => {
    t.segments.forEach((seg, si) => {
      const toeId = t.name.toLowerCase().replace(/ /g, "-");
      const zBase = 0.28 + si * 0.03;
      ["l", "r"].forEach((side) => {
        const sign = side === "l" ? 1 : -1;
        result.push({
          id: `phalanx-${seg.toLowerCase()}-${toeId}-${side}`,
          name: `${side === "l" ? "Left" : "Right"} ${seg} Phalanx (${t.name})`,
          latinName: `Phalanx ${seg === "Proximal" ? "proximalis" : seg === "Middle" ? "media" : "distalis"} pedis`,
          system: "Skeletal", region: "Foot (Phalanges)",
          description: `The ${seg.toLowerCase()} phalanx of the ${t.name.toLowerCase()}. ${t.name === "Big Toe" ? "The big toe (hallux) has only 2 phalanges." : "Each lesser toe has 3 phalanges."}`,
          position: [sign * (0.38 + t.xOff), -2.68, zBase] as [number, number, number],
          scale: [0.015, 0.015, 0.02] as [number, number, number],
          color: BONE_ALT,
          facts: [
            `${seg} phalanx of ${t.name.toLowerCase()}`,
            t.name === "Big Toe" ? "Hallux has 2 phalanges" : "Lesser toes have 3 phalanges",
            seg === "Distal" ? "Contains the toenail bed" : "Allows toe flexion/extension"
          ],
          connections: []
        });
      });
    });
  });
  return result;
})();

// ═══════════════════════════════════════════════════════════
// COMBINE ALL 206 BONES
// ═══════════════════════════════════════════════════════════
export const skeletalParts: BonePart[] = [
  // Axial (80)
  ...cranialBones,       // 8
  ...facialBones,        // 14
  ...hyoid,              // 1
  ...ossicles,           // 6
  ...vertebralColumn,    // 26
  ...sternum,            // 1
  ...ribs,               // 24
  // Appendicular (126)
  ...pectoralGirdle,     // 4
  ...upperLimbLong,      // 6
  ...carpals,            // 16
  ...metacarpals,        // 10
  ...handPhalanges,      // 28
  ...pelvicGirdle,       // 2
  ...lowerLimbLong,      // 8
  ...tarsals,            // 14
  ...metatarsals,        // 10
  ...footPhalanges,      // 28
];

// Verify: 8+14+1+6+26+1+24 + 4+6+16+10+28+2+8+14+10+28 = 80 + 126 = 206 ✓

export const bodySystems = [
  { id: "skeletal", name: "Skeletal", icon: "🦴", color: "bone", partCount: 206 },
  { id: "muscular", name: "Muscular", icon: "💪", color: "muscle", partCount: 600 },
  { id: "nervous", name: "Nervous", icon: "⚡", color: "nerve", partCount: 0 },
  { id: "circulatory", name: "Circulatory", icon: "❤️", color: "destructive", partCount: 0 },
  { id: "respiratory", name: "Respiratory", icon: "🫁", color: "primary", partCount: 0 },
  { id: "digestive", name: "Digestive", icon: "🫃", color: "secondary", partCount: 0 },
];
