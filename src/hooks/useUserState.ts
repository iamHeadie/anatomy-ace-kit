import { useState, useCallback, useEffect } from "react";

export interface UserProfile {
  name: string;
  department: string;
  role: "Student" | "Explorer" | "Learner";
  avatar: string; // emoji avatar
}

export interface UserState {
  profile: UserProfile;
  xp: number;
  bonesIdentified: number;
  flashcardsReviewed: number;
  quizzesTaken: number;
  streak: number;
  lastLoginDate: string; // YYYY-MM-DD
  unlockedAchievements: string[];
}

const DEFAULT_STATE: UserState = {
  profile: {
    name: "Anatomy Explorer",
    department: "",
    role: "Student",
    avatar: "💀",
  },
  xp: 0,
  bonesIdentified: 0,
  flashcardsReviewed: 0,
  quizzesTaken: 0,
  streak: 0,
  lastLoginDate: "",
  unlockedAchievements: [],
};

const STORAGE_KEY = "anatomy-tutor-user";

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadState(): UserState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as UserState;
    return { ...DEFAULT_STATE, ...parsed, profile: { ...DEFAULT_STATE.profile, ...parsed.profile } };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState(state: UserState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useUserState() {
  const [state, setState] = useState<UserState>(loadState);

  // Check daily streak on mount
  useEffect(() => {
    const today = getToday();
    if (state.lastLoginDate !== today) {
      setState((prev) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        const isConsecutive = prev.lastLoginDate === yStr;
        const newStreak = isConsecutive ? prev.streak + 1 : 1;
        const streakXP = 50; // daily login bonus
        const updated = {
          ...prev,
          streak: newStreak,
          lastLoginDate: today,
          xp: prev.xp + streakXP,
        };
        saveState(updated);
        return updated;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const addXP = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, xp: prev.xp + amount }));
  }, []);

  const recordBoneIdentified = useCallback(() => {
    setState((prev) => ({ ...prev, bonesIdentified: prev.bonesIdentified + 1, xp: prev.xp + 10 }));
  }, []);

  const recordFlashcardReview = useCallback(() => {
    setState((prev) => ({ ...prev, flashcardsReviewed: prev.flashcardsReviewed + 1, xp: prev.xp + 25 }));
  }, []);

  const recordQuizComplete = useCallback(() => {
    setState((prev) => ({ ...prev, quizzesTaken: prev.quizzesTaken + 1 }));
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setState((prev) => {
      if (prev.unlockedAchievements.includes(id)) return prev;
      return { ...prev, unlockedAchievements: [...prev.unlockedAchievements, id] };
    });
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...updates } }));
  }, []);

  return {
    state,
    addXP,
    recordBoneIdentified,
    recordFlashcardReview,
    recordQuizComplete,
    unlockAchievement,
    updateProfile,
  };
}
