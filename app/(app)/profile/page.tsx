"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Star,
  Flame,
  Trophy,
  BookOpen,
  PenLine,
  CheckSquare,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ProfileData {
  user: {
    _id: string;
    name: string;
    email: string;
    image: string;
    level: string;
    xp: number;
    streak: number;
    longestStreak: number;
    badges: string[];
    weeklyGoal: number;
    monthlyGoal: number;
    createdAt: string;
  };
  stats: {
    totalWords: number;
    totalSentences: number;
    totalTasksCompleted: number;
  };
  badges: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
}

const levelXPMap: Record<string, { min: number; max: number }> = {
  A1: { min: 0, max: 500 },
  A2: { min: 500, max: 1500 },
  B1: { min: 1500, max: 3000 },
  B2: { min: 3000, max: 5000 },
  C1: { min: 5000, max: 8000 },
  C2: { min: 8000, max: 10000 },
};

const levelColors: Record<string, string> = {
  A1: "text-green-500 border-green-500/30 bg-green-500/10",
  A2: "text-blue-500 border-blue-500/30 bg-blue-500/10",
  B1: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  B2: "text-orange-500 border-orange-500/30 bg-orange-500/10",
  C1: "text-purple-500 border-purple-500/30 bg-purple-500/10",
  C2: "text-red-500 border-red-500/30 bg-red-500/10",
};

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/profile");
        const result = await res.json();
        if (res.ok) {
          setData(result);
        } else {
          toast.error("Failed to load profile");
        }
      } catch {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, []);

  const exportVocabulary = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/vocabulary?limit=1000");
      const result = await res.json();

      if (res.ok && result.words) {
        const headers = [
          "German",
          "English",
          "Bangla",
          "Category",
          "Difficulty",
          "Frequency",
          "Quiz Score",
          "Notes",
          "Date Added",
        ];

        const rows = result.words.map(
          (w: {
            german: string;
            english: string;
            bangla: string;
            category: string;
            difficulty: string;
            frequency: number;
            quizScore: number;
            notes: string;
            createdAt: string;
          }) => [
            w.german,
            w.english,
            w.bangla || "",
            w.category,
            w.difficulty,
            w.frequency,
            w.quizScore,
            w.notes || "",
            new Date(w.createdAt).toLocaleDateString(),
          ],
        );

        const csv = [headers, ...rows]
          .map((row) =>
            row
              .map(
                (cell: string | number | boolean | null) =>
                  `"${String(cell).replace(/"/g, '""')}"`,
              )
              .join(","),
          )
          .join("\n");

        const blob = new Blob([csv], {
          type: "text/csv",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "deutsch-tracker-vocabulary.csv";
        a.click();
        URL.revokeObjectURL(url);

        toast.success("Vocabulary exported!");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-48 bg-muted rounded-xl animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user, stats, badges } = data;
  const levelData = levelXPMap[user.level] || {
    min: 0,
    max: 500,
  };
  const xpProgress = Math.min(
    ((user.xp - levelData.min) / (levelData.max - levelData.min)) * 100,
    100,
  );

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* User Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="shrink-0">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-20 h-20 rounded-2xl border-2 border-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <Badge
                  variant="outline"
                  className={`text-sm font-bold ${levelColors[user.level]}`}
                >
                  {user.level}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-0.5">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {memberSince}
              </p>

              {/* XP Bar */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {user.xp} XP
                  </span>
                  <span className="text-muted-foreground">
                    Next level: {levelData.max} XP
                  </span>
                </div>
                <Progress value={xpProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {levelData.max - user.xp} XP until next level
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          {
            label: "Words",
            value: stats.totalWords,
            icon: BookOpen,
            color: "text-blue-500 bg-blue-500/10",
          },
          {
            label: "Sentences",
            value: stats.totalSentences,
            icon: PenLine,
            color: "text-green-500 bg-green-500/10",
          },
          {
            label: "Tasks Done",
            value: stats.totalTasksCompleted,
            icon: CheckSquare,
            color: "text-purple-500 bg-purple-500/10",
          },
          {
            label: "Streak",
            value: `${user.streak}d`,
            icon: Flame,
            color: "text-orange-500 bg-orange-500/10",
          },
          {
            label: "Best Streak",
            value: `${user.longestStreak}d`,
            icon: Trophy,
            color: "text-yellow-500 bg-yellow-500/10",
          },
        ].map((s) => (
          <Card
            key={s.label}
            className="hover:border-primary/30 transition-colors"
          >
            <CardContent className="p-4 text-center">
              <div
                className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-2`}
              >
                <s.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Badges */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Badges & Achievements
            <Badge variant="secondary">{badges.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No badges yet. Keep learning to earn them!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-secondary/50 border border-border"
                >
                  <span className="text-3xl mb-2">{badge.icon}</span>
                  <p className="text-sm font-semibold">{badge.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Download your vocabulary list as a CSV file to use in other apps or
            for backup.
          </p>
          <Button
            variant="outline"
            onClick={exportVocabulary}
            disabled={exporting}
            className="gap-2"
          >
            {exporting ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {exporting ? "Exporting..." : "Export Vocabulary (CSV)"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
