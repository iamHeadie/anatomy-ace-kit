import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface Profile {
  username: string;
  department: string;
  occupation: string;
  avatar: string;
  xp: number;
  bones_identified: number;
  flashcards_reviewed: number;
  quizzes_taken: number;
  streak: number;
  last_login_date: string;
  unlocked_achievements: string[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  /** True immediately after a successful signUp() — cleared by clearNewUser(). */
  isNewUser: boolean;
  /** Call once the onboarding tour has been shown to reset the new-user flag. */
  clearNewUser: () => void;
  signUp: (email: string, password: string, username: string, department: string, occupation: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("username, department, occupation, avatar, xp, bones_identified, flashcards_reviewed, quizzes_taken, streak, last_login_date, unlocked_achievements")
      .eq("user_id", userId)
      .single();
    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Use setTimeout to avoid potential deadlock with Supabase auth
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, username: string, department: string, occupation: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };

    // Update profile with department/occupation after signup trigger creates it
    // Small delay to allow trigger to fire
    await new Promise((r) => setTimeout(r, 500));
    const { data: { user: newUser } } = await supabase.auth.getUser();
    if (newUser) {
      await supabase.from("profiles").update({ department, occupation, username }).eq("user_id", newUser.id);
      await fetchProfile(newUser.id);
    }
    // Mark as new user so the onboarding tour fires even if localStorage was
    // previously set (e.g. the user signed up, cleared storage, and re-signed up).
    setIsNewUser(true);
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    await supabase.from("profiles").update(updates).eq("user_id", user.id);
    setProfile((prev) => prev ? { ...prev, ...updates } : null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const clearNewUser = () => setIsNewUser(false);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isNewUser, clearNewUser, signUp, signIn, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
