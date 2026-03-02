import { useState } from "react";
import { motion } from "framer-motion";
import { useUserState } from "@/hooks/useUserState";
import { getRank, getRankProgress, getNextRank, RANKS, ACHIEVEMENTS, LEADERBOARD } from "@/data/rankSystem";
import { Trophy, Star, Medal, Crown, Users, Award, Edit3, Check } from "lucide-react";

const AVATARS = ["💀", "🫀", "🧠", "🦴", "🩻", "⚕️", "🔬", "🧬"];
const ROLES = ["Student", "Explorer", "Learner"] as const;

export default function Profile() {
  const { state, updateProfile, unlockAchievement } = useUserState();
  const { profile, xp, bonesIdentified, flashcardsReviewed, quizzesTaken, streak } = state;
  const rank = getRank(xp);
  const progress = getRankProgress(xp);
  const nextRank = getNextRank(xp);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editDept, setEditDept] = useState(profile.department);
  const [editRole, setEditRole] = useState(profile.role);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);

  // Check and unlock achievements
  const achievementState = { xp, bonesIdentified, flashcardsReviewed, quizzesTaken, streak };
  ACHIEVEMENTS.forEach((a) => {
    if (a.condition(achievementState) && !state.unlockedAchievements.includes(a.id)) {
      unlockAchievement(a.id);
    }
  });

  const saveProfile = () => {
    updateProfile({ name: editName, department: editDept, role: editRole, avatar: editAvatar });
    setEditing(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 space-y-5"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {editing ? (
              <div className="flex flex-wrap gap-2 max-w-[200px]">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setEditAvatar(a)}
                    className={`text-3xl p-1.5 rounded-lg transition-all ${editAvatar === a ? "bg-primary/20 ring-2 ring-primary scale-110" : "hover:bg-secondary"}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            ) : (
              <div className={`text-5xl p-3 rounded-full bg-secondary/60 ${rank.glowing ? "animate-diamond-glow" : ""}`}>
                {profile.avatar}
              </div>
            )}

            {!editing && (
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">{profile.name || "Unnamed Explorer"}</h2>
                <p className="text-sm text-muted-foreground">{profile.department || "No department set"}</p>
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {profile.role}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => editing ? saveProfile() : setEditing(true)}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
          >
            {editing ? <Check size={16} /> : <Edit3 size={16} />}
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 pt-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Department</label>
              <input
                value={editDept}
                onChange={(e) => setEditDept(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Medical School, Nursing"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Role</label>
              <div className="flex gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setEditRole(r)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${editRole === r ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Rank Badge & XP */}
        <div className="pt-2 border-t border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-lg ${rank.glowing ? "animate-diamond-glow" : ""}`}>{rank.emoji}</span>
              <span
                className={`text-sm font-bold ${rank.glowing ? "animate-diamond-glow" : ""}`}
                style={{ color: rank.color }}
              >
                {rank.name}
              </span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">{xp.toLocaleString()} XP</span>
          </div>

          <div className="space-y-1">
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: rank.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {nextRank && (
              <p className="text-[11px] text-muted-foreground text-right">
                {nextRank.minXP - xp} XP to {nextRank.name}
              </p>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-3 pt-2">
          {[
            { label: "Bones Found", value: bonesIdentified, icon: Star },
            { label: "Cards Reviewed", value: flashcardsReviewed, icon: Medal },
            { label: "Quizzes Done", value: quizzesTaken, icon: Trophy },
            { label: "Day Streak", value: streak, icon: Crown },
          ].map((s) => (
            <div key={s.label} className="text-center space-y-1">
              <s.icon size={14} className="mx-auto text-primary" />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Award size={16} className="text-primary" />
          Achievement Badges
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = state.unlockedAchievements.includes(a.id);
            return (
              <div
                key={a.id}
                className={`text-center p-3 rounded-lg transition-all ${unlocked ? "bg-primary/10 border border-primary/20" : "bg-secondary/30 opacity-40"}`}
              >
                <span className="text-2xl block mb-1">{a.icon}</span>
                <p className="text-[11px] font-medium text-foreground leading-tight">{a.name}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{a.description}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users size={16} className="text-primary" />
          Top Explorers
        </h2>
        <div className="space-y-2">
          {LEADERBOARD.map((entry, i) => {
            const entryRank = getRank(entry.xp);
            return (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-md bg-secondary/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-5">#{i + 1}</span>
                  <span className="text-sm">{entryRank.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.name}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono" style={{ color: entryRank.color }}>{entry.rank}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.xp.toLocaleString()} XP</p>
                </div>
              </div>
            );
          })}

          {/* Current user position */}
          <div className="flex items-center justify-between px-3 py-2 rounded-md bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-primary w-5">You</span>
              <span className="text-sm">{rank.emoji}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{profile.name || "You"}</p>
                <p className="text-[10px] text-muted-foreground">{profile.department || "—"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono" style={{ color: rank.color }}>{rank.name}</p>
              <p className="text-[10px] text-muted-foreground">{xp.toLocaleString()} XP</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rank Tiers Reference */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Rank Tiers</h2>
        <div className="grid grid-cols-5 gap-2">
          {RANKS.map((r) => {
            const isCurrent = r.name === rank.name;
            return (
              <div
                key={r.name}
                className={`text-center p-2 rounded-lg transition-all ${isCurrent ? "bg-primary/15 ring-1 ring-primary/30" : "bg-secondary/30"}`}
              >
                <span className={`text-xl block ${r.glowing ? "animate-diamond-glow" : ""}`}>{r.emoji}</span>
                <p className="text-[10px] font-medium mt-1" style={{ color: r.color }}>{r.name}</p>
                <p className="text-[9px] text-muted-foreground">{r.minXP.toLocaleString()}+ XP</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
