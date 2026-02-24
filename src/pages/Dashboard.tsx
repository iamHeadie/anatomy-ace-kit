import { motion } from "framer-motion";
import { BookOpen, Brain, Trophy, TrendingUp, Clock, Target } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Bones Learned", value: "12", total: "206", icon: BookOpen, percent: 6 },
  { label: "Quiz Score", value: "85%", total: "", icon: Trophy, percent: 85 },
  { label: "Study Streak", value: "3 days", total: "", icon: TrendingUp, percent: 43 },
  { label: "Time Studied", value: "2.5h", total: "", icon: Clock, percent: 25 },
];

const recentParts = [
  { name: "Femur", system: "Skeletal", mastered: true },
  { name: "Skull (Cranium)", system: "Skeletal", mastered: true },
  { name: "Scapula", system: "Skeletal", mastered: false },
  { name: "Pelvis", system: "Skeletal", mastered: false },
  { name: "Humerus", system: "Skeletal", mastered: false },
];

export default function Dashboard() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your anatomy mastery progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <stat.icon size={18} className="text-primary" />
              <span className="text-xs text-muted-foreground">{stat.total}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${stat.percent}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="glass-panel p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Target size={16} className="text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/viewer" className="p-4 rounded-lg bg-secondary hover:bg-primary/10 transition-colors text-center group">
              <span className="text-2xl block mb-2">🦴</span>
              <span className="text-sm font-medium text-secondary-foreground group-hover:text-primary transition-colors">3D Viewer</span>
            </Link>
            <Link to="/quiz" className="p-4 rounded-lg bg-secondary hover:bg-primary/10 transition-colors text-center group">
              <span className="text-2xl block mb-2">📝</span>
              <span className="text-sm font-medium text-secondary-foreground group-hover:text-primary transition-colors">Take Quiz</span>
            </Link>
            <Link to="/flashcards" className="p-4 rounded-lg bg-secondary hover:bg-primary/10 transition-colors text-center group">
              <span className="text-2xl block mb-2">🃏</span>
              <span className="text-sm font-medium text-secondary-foreground group-hover:text-primary transition-colors">Flashcards</span>
            </Link>
            <div className="p-4 rounded-lg bg-secondary/50 text-center opacity-50">
              <span className="text-2xl block mb-2">📊</span>
              <span className="text-sm font-medium text-muted-foreground">Analytics</span>
            </div>
          </div>
        </div>

        {/* Recent Study */}
        <div className="glass-panel p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Brain size={16} className="text-primary" />
            Recently Studied
          </h2>
          <div className="space-y-2">
            {recentParts.map((part) => (
              <div key={part.name} className="flex items-center justify-between px-3 py-2 rounded-md bg-secondary/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{part.name}</p>
                  <p className="text-xs text-muted-foreground">{part.system}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  part.mastered
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {part.mastered ? "Mastered" : "Learning"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
