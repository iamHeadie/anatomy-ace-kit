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

export const skeletalParts: BonePart[] = [
  {
    id: "skull",
    name: "Skull (Cranium)",
    latinName: "Cranium",
    system: "Skeletal",
    region: "Axial",
    description: "The skull is a bony structure that forms the head. It supports the face and protects the brain. It is composed of 22 bones joined by sutures.",
    position: [0, 3.8, 0],
    scale: [0.55, 0.65, 0.55],
    color: "#d4b896",
    facts: [
      "Composed of 22 bones",
      "Protects the brain",
      "Only the mandible is movable"
    ],
    connections: ["cervical-vertebrae", "mandible"]
  },
  {
    id: "mandible",
    name: "Mandible",
    latinName: "Mandibula",
    system: "Skeletal",
    region: "Axial",
    description: "The mandible is the largest and strongest bone of the face. It is the only movable bone in the skull and holds the lower teeth.",
    position: [0, 3.2, 0.15],
    scale: [0.45, 0.15, 0.3],
    color: "#c9a87c",
    facts: [
      "Only movable skull bone",
      "Strongest facial bone",
      "Contains the lower teeth"
    ],
    connections: ["skull"]
  },
  {
    id: "cervical-vertebrae",
    name: "Cervical Vertebrae",
    latinName: "Vertebrae cervicales",
    system: "Skeletal",
    region: "Axial",
    description: "The seven cervical vertebrae form the neck region of the spine. They support the head and allow a wide range of motion.",
    position: [0, 2.8, -0.1],
    scale: [0.25, 0.5, 0.25],
    color: "#bfa77a",
    facts: [
      "7 vertebrae (C1-C7)",
      "C1 (Atlas) supports the skull",
      "C2 (Axis) allows head rotation"
    ],
    connections: ["skull", "thoracic-vertebrae"]
  },
  {
    id: "clavicle-l",
    name: "Left Clavicle",
    latinName: "Clavicula",
    system: "Skeletal",
    region: "Appendicular",
    description: "The clavicle (collarbone) connects the arm to the trunk. It is the most commonly fractured bone in the body.",
    position: [0.55, 2.45, 0.1],
    scale: [0.6, 0.08, 0.08],
    color: "#d4b896",
    facts: [
      "Most commonly fractured bone",
      "Only long bone that lies horizontally",
      "Connects scapula to sternum"
    ],
    connections: ["scapula-l", "sternum"]
  },
  {
    id: "clavicle-r",
    name: "Right Clavicle",
    latinName: "Clavicula",
    system: "Skeletal",
    region: "Appendicular",
    description: "The clavicle (collarbone) connects the arm to the trunk. It is the most commonly fractured bone in the body.",
    position: [-0.55, 2.45, 0.1],
    scale: [0.6, 0.08, 0.08],
    color: "#d4b896",
    facts: [
      "Most commonly fractured bone",
      "Only long bone that lies horizontally",
      "Connects scapula to sternum"
    ],
    connections: ["scapula-r", "sternum"]
  },
  {
    id: "scapula-l",
    name: "Left Scapula",
    latinName: "Scapula",
    system: "Skeletal",
    region: "Appendicular",
    description: "The scapula (shoulder blade) is a flat, triangular bone on the upper back. It provides attachment for muscles of the arm and chest.",
    position: [0.7, 2.2, -0.2],
    scale: [0.35, 0.45, 0.1],
    color: "#c9a87c",
    facts: [
      "Triangular flat bone",
      "17 muscles attach to it",
      "Connects to humerus and clavicle"
    ],
    connections: ["clavicle-l", "humerus-l"]
  },
  {
    id: "scapula-r",
    name: "Right Scapula",
    latinName: "Scapula",
    system: "Skeletal",
    region: "Appendicular",
    description: "The scapula (shoulder blade) is a flat, triangular bone on the upper back. It provides attachment for muscles of the arm and chest.",
    position: [-0.7, 2.2, -0.2],
    scale: [0.35, 0.45, 0.1],
    color: "#c9a87c",
    facts: [
      "Triangular flat bone",
      "17 muscles attach to it",
      "Connects to humerus and clavicle"
    ],
    connections: ["clavicle-r", "humerus-r"]
  },
  {
    id: "sternum",
    name: "Sternum",
    latinName: "Sternum",
    system: "Skeletal",
    region: "Axial",
    description: "The sternum (breastbone) is a flat bone at the front of the chest. It connects to the ribs via cartilage and protects the heart and lungs.",
    position: [0, 2.1, 0.2],
    scale: [0.15, 0.6, 0.08],
    color: "#d4b896",
    facts: [
      "Composed of 3 parts: manubrium, body, xiphoid process",
      "Protects heart and great vessels",
      "Site for bone marrow biopsy"
    ],
    connections: ["clavicle-l", "clavicle-r", "ribcage"]
  },
  {
    id: "ribcage",
    name: "Rib Cage",
    latinName: "Cavea thoracis",
    system: "Skeletal",
    region: "Axial",
    description: "The rib cage consists of 12 pairs of ribs that protect the thoracic organs. The first 7 pairs are true ribs, 8-10 are false, and 11-12 are floating.",
    position: [0, 1.8, 0],
    scale: [0.75, 0.7, 0.45],
    color: "#bfa77a",
    facts: [
      "12 pairs of ribs (24 total)",
      "True ribs (1-7) attach to sternum",
      "Floating ribs (11-12) have no anterior attachment"
    ],
    connections: ["sternum", "thoracic-vertebrae"]
  },
  {
    id: "thoracic-vertebrae",
    name: "Thoracic Vertebrae",
    latinName: "Vertebrae thoracicae",
    system: "Skeletal",
    region: "Axial",
    description: "The 12 thoracic vertebrae articulate with the ribs and form the middle segment of the vertebral column.",
    position: [0, 1.8, -0.25],
    scale: [0.2, 0.7, 0.2],
    color: "#b8975e",
    facts: [
      "12 vertebrae (T1-T12)",
      "Each articulates with a pair of ribs",
      "Limited range of motion"
    ],
    connections: ["cervical-vertebrae", "lumbar-vertebrae", "ribcage"]
  },
  {
    id: "humerus-l",
    name: "Left Humerus",
    latinName: "Humerus",
    system: "Skeletal",
    region: "Appendicular",
    description: "The humerus is the long bone of the upper arm, extending from shoulder to elbow.",
    position: [1.1, 1.7, 0],
    scale: [0.12, 0.8, 0.12],
    color: "#d4b896",
    facts: [
      "Longest bone of the upper limb",
      "Ball-and-socket joint at shoulder",
      "Hinge joint at elbow"
    ],
    connections: ["scapula-l", "radius-l", "ulna-l"]
  },
  {
    id: "humerus-r",
    name: "Right Humerus",
    latinName: "Humerus",
    system: "Skeletal",
    region: "Appendicular",
    description: "The humerus is the long bone of the upper arm, extending from shoulder to elbow.",
    position: [-1.1, 1.7, 0],
    scale: [0.12, 0.8, 0.12],
    color: "#d4b896",
    facts: [
      "Longest bone of the upper limb",
      "Ball-and-socket joint at shoulder",
      "Hinge joint at elbow"
    ],
    connections: ["scapula-r", "radius-r", "ulna-r"]
  },
  {
    id: "radius-l",
    name: "Left Radius",
    latinName: "Radius",
    system: "Skeletal",
    region: "Appendicular",
    description: "The radius is the lateral bone of the forearm (thumb side). It rotates around the ulna to allow pronation and supination.",
    position: [1.2, 0.85, 0.08],
    scale: [0.07, 0.7, 0.07],
    color: "#c9a87c",
    facts: [
      "Lateral forearm bone",
      "Allows wrist rotation",
      "Commonly fractured (Colles' fracture)"
    ],
    connections: ["humerus-l", "hand-l"]
  },
  {
    id: "radius-r",
    name: "Right Radius",
    latinName: "Radius",
    system: "Skeletal",
    region: "Appendicular",
    description: "The radius is the lateral bone of the forearm (thumb side).",
    position: [-1.2, 0.85, 0.08],
    scale: [0.07, 0.7, 0.07],
    color: "#c9a87c",
    facts: ["Lateral forearm bone", "Allows wrist rotation", "Commonly fractured"],
    connections: ["humerus-r", "hand-r"]
  },
  {
    id: "ulna-l",
    name: "Left Ulna",
    latinName: "Ulna",
    system: "Skeletal",
    region: "Appendicular",
    description: "The ulna is the medial bone of the forearm (pinky side). It forms the elbow joint with the humerus.",
    position: [1.05, 0.85, -0.05],
    scale: [0.07, 0.7, 0.07],
    color: "#bfa77a",
    facts: [
      "Medial forearm bone",
      "Forms the point of the elbow (olecranon)",
      "Stabilizes the forearm"
    ],
    connections: ["humerus-l", "hand-l"]
  },
  {
    id: "ulna-r",
    name: "Right Ulna",
    latinName: "Ulna",
    system: "Skeletal",
    region: "Appendicular",
    description: "The ulna is the medial bone of the forearm (pinky side).",
    position: [-1.05, 0.85, -0.05],
    scale: [0.07, 0.7, 0.07],
    color: "#bfa77a",
    facts: ["Medial forearm bone", "Forms the point of the elbow", "Stabilizes forearm"],
    connections: ["humerus-r", "hand-r"]
  },
  {
    id: "lumbar-vertebrae",
    name: "Lumbar Vertebrae",
    latinName: "Vertebrae lumbales",
    system: "Skeletal",
    region: "Axial",
    description: "The 5 lumbar vertebrae are the largest vertebrae and bear the most weight. They form the lower back.",
    position: [0, 1.0, -0.15],
    scale: [0.25, 0.4, 0.25],
    color: "#b8975e",
    facts: [
      "5 vertebrae (L1-L5)",
      "Bear the most body weight",
      "Most common site of back pain"
    ],
    connections: ["thoracic-vertebrae", "pelvis"]
  },
  {
    id: "pelvis",
    name: "Pelvis",
    latinName: "Pelvis",
    system: "Skeletal",
    region: "Axial",
    description: "The pelvis is a basin-shaped structure composed of the hip bones, sacrum, and coccyx. It supports the weight of the upper body.",
    position: [0, 0.4, 0],
    scale: [0.7, 0.45, 0.4],
    color: "#c9a87c",
    facts: [
      "Composed of 3 fused bones per side",
      "Female pelvis is wider for childbirth",
      "Transfers weight to lower limbs"
    ],
    connections: ["lumbar-vertebrae", "femur-l", "femur-r"]
  },
  {
    id: "femur-l",
    name: "Left Femur",
    latinName: "Femur",
    system: "Skeletal",
    region: "Appendicular",
    description: "The femur is the longest and strongest bone in the human body. It extends from hip to knee.",
    position: [0.4, -0.55, 0],
    scale: [0.13, 1.1, 0.13],
    color: "#d4b896",
    facts: [
      "Longest bone in the body",
      "Strongest bone in the body",
      "Supports up to 30x body weight"
    ],
    connections: ["pelvis", "patella-l", "tibia-l"]
  },
  {
    id: "femur-r",
    name: "Right Femur",
    latinName: "Femur",
    system: "Skeletal",
    region: "Appendicular",
    description: "The femur is the longest and strongest bone in the human body.",
    position: [-0.4, -0.55, 0],
    scale: [0.13, 1.1, 0.13],
    color: "#d4b896",
    facts: ["Longest bone in the body", "Strongest bone", "Supports up to 30x body weight"],
    connections: ["pelvis", "patella-r", "tibia-r"]
  },
  {
    id: "patella-l",
    name: "Left Patella",
    latinName: "Patella",
    system: "Skeletal",
    region: "Appendicular",
    description: "The patella (kneecap) is the largest sesamoid bone. It protects the knee joint and improves leverage for the quadriceps.",
    position: [0.4, -1.15, 0.15],
    scale: [0.12, 0.12, 0.08],
    color: "#d4b896",
    facts: [
      "Largest sesamoid bone",
      "Protects the knee joint",
      "Improves quadriceps leverage by 30%"
    ],
    connections: ["femur-l", "tibia-l"]
  },
  {
    id: "patella-r",
    name: "Right Patella",
    latinName: "Patella",
    system: "Skeletal",
    region: "Appendicular",
    description: "The patella (kneecap) is the largest sesamoid bone.",
    position: [-0.4, -1.15, 0.15],
    scale: [0.12, 0.12, 0.08],
    color: "#d4b896",
    facts: ["Largest sesamoid bone", "Protects knee joint", "Improves leverage by 30%"],
    connections: ["femur-r", "tibia-r"]
  },
  {
    id: "tibia-l",
    name: "Left Tibia",
    latinName: "Tibia",
    system: "Skeletal",
    region: "Appendicular",
    description: "The tibia (shinbone) is the larger of the two lower leg bones. It bears the weight of the body from the knee to the ankle.",
    position: [0.35, -2.0, 0.05],
    scale: [0.1, 1.0, 0.1],
    color: "#d4b896",
    facts: [
      "Second longest bone",
      "Weight-bearing bone of the leg",
      "Shinbone"
    ],
    connections: ["patella-l", "femur-l", "fibula-l", "foot-l"]
  },
  {
    id: "tibia-r",
    name: "Right Tibia",
    latinName: "Tibia",
    system: "Skeletal",
    region: "Appendicular",
    description: "The tibia (shinbone) is the larger of the two lower leg bones.",
    position: [-0.35, -2.0, 0.05],
    scale: [0.1, 1.0, 0.1],
    color: "#d4b896",
    facts: ["Second longest bone", "Weight-bearing bone", "Shinbone"],
    connections: ["patella-r", "femur-r", "fibula-r", "foot-r"]
  },
  {
    id: "fibula-l",
    name: "Left Fibula",
    latinName: "Fibula",
    system: "Skeletal",
    region: "Appendicular",
    description: "The fibula is the thinner bone lateral to the tibia. It does not bear weight but provides muscle attachment.",
    position: [0.5, -2.0, 0],
    scale: [0.06, 0.95, 0.06],
    color: "#bfa77a",
    facts: [
      "Non-weight-bearing",
      "Lateral stabilizer of ankle",
      "Thinnest long bone"
    ],
    connections: ["tibia-l", "foot-l"]
  },
  {
    id: "fibula-r",
    name: "Right Fibula",
    latinName: "Fibula",
    system: "Skeletal",
    region: "Appendicular",
    description: "The fibula is the thinner bone lateral to the tibia.",
    position: [-0.5, -2.0, 0],
    scale: [0.06, 0.95, 0.06],
    color: "#bfa77a",
    facts: ["Non-weight-bearing", "Lateral ankle stabilizer", "Thinnest long bone"],
    connections: ["tibia-r", "foot-r"]
  },
  {
    id: "foot-l",
    name: "Left Foot",
    latinName: "Pes",
    system: "Skeletal",
    region: "Appendicular",
    description: "The foot contains 26 bones organized into tarsals, metatarsals, and phalanges. It supports body weight and enables locomotion.",
    position: [0.38, -2.7, 0.15],
    scale: [0.2, 0.1, 0.35],
    color: "#c9a87c",
    facts: [
      "26 bones per foot",
      "33 joints per foot",
      "Contains 25% of all body bones (both feet)"
    ],
    connections: ["tibia-l", "fibula-l"]
  },
  {
    id: "foot-r",
    name: "Right Foot",
    latinName: "Pes",
    system: "Skeletal",
    region: "Appendicular",
    description: "The foot contains 26 bones organized into tarsals, metatarsals, and phalanges.",
    position: [-0.38, -2.7, 0.15],
    scale: [0.2, 0.1, 0.35],
    color: "#c9a87c",
    facts: ["26 bones per foot", "33 joints per foot", "25% of all body bones"],
    connections: ["tibia-r", "fibula-r"]
  },
  {
    id: "hand-l",
    name: "Left Hand",
    latinName: "Manus",
    system: "Skeletal",
    region: "Appendicular",
    description: "The hand contains 27 bones including carpals, metacarpals, and phalanges. It is the most dexterous part of the body.",
    position: [1.15, 0.15, 0.05],
    scale: [0.15, 0.2, 0.06],
    color: "#c9a87c",
    facts: [
      "27 bones per hand",
      "Most dexterous body part",
      "Opposable thumb is unique to primates"
    ],
    connections: ["radius-l", "ulna-l"]
  },
  {
    id: "hand-r",
    name: "Right Hand",
    latinName: "Manus",
    system: "Skeletal",
    region: "Appendicular",
    description: "The hand contains 27 bones including carpals, metacarpals, and phalanges.",
    position: [-1.15, 0.15, 0.05],
    scale: [0.15, 0.2, 0.06],
    color: "#c9a87c",
    facts: ["27 bones per hand", "Most dexterous body part", "Opposable thumb"],
    connections: ["radius-r", "ulna-r"]
  },
];

export const bodySystems = [
  { id: "skeletal", name: "Skeletal", icon: "🦴", color: "bone", partCount: 206 },
  { id: "muscular", name: "Muscular", icon: "💪", color: "muscle", partCount: 600 },
  { id: "nervous", name: "Nervous", icon: "⚡", color: "nerve", partCount: 0 },
  { id: "circulatory", name: "Circulatory", icon: "❤️", color: "destructive", partCount: 0 },
  { id: "digestive", name: "Digestive", icon: "🫁", color: "organ", partCount: 0 },
  { id: "respiratory", name: "Respiratory", icon: "🌬️", color: "primary", partCount: 0 },
];
