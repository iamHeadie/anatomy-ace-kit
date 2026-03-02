export interface Rank {
  name: string;
  minXP: number;
  maxXP: number; // Infinity for top rank
  color: string; // HSL token-compatible
  emoji: string;
  glowing?: boolean;
}

export const RANKS: Rank[] = [
  { name: "Novice", minXP: 0, maxXP: 500, color: "hsl(215, 20%, 55%)", emoji: "🦴" },
  { name: "Junior", minXP: 501, maxXP: 2000, color: "hsl(168, 76%, 40%)", emoji: "🩻" },
  { name: "Senior", minXP: 2001, maxXP: 5000, color: "hsl(45, 90%, 60%)", emoji: "⚕️" },
  { name: "Professional", minXP: 5001, maxXP: 10000, color: "hsl(280, 45%, 55%)", emoji: "🏆" },
  { name: "Black Diamond", minXP: 10001, maxXP: Infinity, color: "hsl(0, 0%, 95%)", emoji: "💎", glowing: true },
];

export function getRank(xp: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return RANKS[i];
  }
  return RANKS[0];
}

export function getRankProgress(xp: number): number {
  const rank = getRank(xp);
  if (rank.maxXP === Infinity) return 100;
  const rangeStart = rank.minXP;
  const rangeEnd = rank.maxXP;
  return Math.min(100, Math.round(((xp - rangeStart) / (rangeEnd - rangeStart)) * 100));
}

export function getNextRank(xp: number): Rank | null {
  const current = getRank(xp);
  const idx = RANKS.indexOf(current);
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: { xp: number; bonesIdentified: number; flashcardsReviewed: number; quizzesTaken: number; streak: number }) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_bone", name: "First Discovery", description: "Identify your first bone correctly", icon: "🦴", condition: (s) => s.bonesIdentified >= 1 },
  { id: "bone_hunter_10", name: "Bone Hunter", description: "Correctly identify 10 bones", icon: "🔍", condition: (s) => s.bonesIdentified >= 10 },
  { id: "bone_hunter_50", name: "Bone Scholar", description: "Correctly identify 50 bones", icon: "📖", condition: (s) => s.bonesIdentified >= 50 },
  { id: "skeleton_master", name: "Skeleton Master", description: "Correctly identify all 206 bones", icon: "💀", condition: (s) => s.bonesIdentified >= 206 },
  { id: "flashcard_starter", name: "Card Flipper", description: "Review 10 flashcards", icon: "🃏", condition: (s) => s.flashcardsReviewed >= 10 },
  { id: "mnemonic_pro", name: "Mnemonic Pro", description: "Review 100 flashcards", icon: "🧠", condition: (s) => s.flashcardsReviewed >= 100 },
  { id: "quiz_taker", name: "Quiz Taker", description: "Complete 5 quizzes", icon: "📝", condition: (s) => s.quizzesTaken >= 5 },
  { id: "streak_3", name: "On Fire", description: "Maintain a 3-day streak", icon: "🔥", condition: (s) => s.streak >= 3 },
  { id: "streak_7", name: "Dedicated", description: "Maintain a 7-day streak", icon: "⭐", condition: (s) => s.streak >= 7 },
  { id: "xp_1000", name: "Rising Star", description: "Earn 1,000 XP", icon: "🌟", condition: (s) => s.xp >= 1000 },
  { id: "xp_5000", name: "Anatomy Expert", description: "Earn 5,000 XP", icon: "🏅", condition: (s) => s.xp >= 5000 },
  { id: "black_diamond", name: "Black Diamond", description: "Reach Black Diamond rank", icon: "💎", condition: (s) => s.xp >= 10001 },
];

// Fake leaderboard data
export const LEADERBOARD = [
  { name: "Dr. Amara O.", department: "Medical School", xp: 12400, rank: "Black Diamond" },
  { name: "James T.", department: "Nursing", xp: 8700, rank: "Professional" },
  { name: "Sofia R.", department: "Physiotherapy", xp: 6200, rank: "Professional" },
  { name: "Kofi B.", department: "Medical School", xp: 4100, rank: "Senior" },
  { name: "Emily C.", department: "Nursing", xp: 2800, rank: "Senior" },
  { name: "David K.", department: "Medical School", xp: 1500, rank: "Junior" },
  { name: "Nia W.", department: "Physiotherapy", xp: 900, rank: "Junior" },
  { name: "Alex P.", department: "Nursing", xp: 350, rank: "Novice" },
];
