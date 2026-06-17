"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Flame,
  PenLine,
  Star,
  Plus,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getXPProgress } from "@/lib/utils";
import { cn } from "@/lib/utils";
const WORD_OF_THE_DAY = [
  {
    german: "die Freundschaft",
    english: "friendship",
    example: "Freundschaft ist wichtig.",
  },
  {
    german: "das Abenteuer",
    english: "adventure",
    example: "Das Abenteuer beginnt!",
  },
  {
    german: "die Hoffnung",
    english: "hope",
    example: "Ich habe Hoffnung.",
  },
  {
    german: "der Traum",
    english: "dream",
    example: "Mein Traum ist groß.",
  },
  {
    german: "die Freiheit",
    english: "freedom",
    example: "Freiheit ist wertvoll.",
  },
  {
    german: "das Glück",
    english: "happiness",
    example: "Ich habe Glück.",
  },
  {
    german: "die Reise",
    english: "journey",
    example: "Die Reise war schön.",
  },
];

const REAL_LIFE_PROMPTS = [
  "Describe 5 objects you see around you in German",
  "Write what you ate today in German",
  "Describe today's weather in German",
  "Write your morning routine in German",
  "Describe your room in German",
  "Write 3 things you are grateful for in German",
  "Describe what you are wearing today in German",
];

const levelXPMap: Record<string, { min: number; max: number }> = {
  A1: { min: 0, max: 500 },
  A2: { min: 500, max: 1500 },
  B1: { min: 1500, max: 3000 },
  B2: { min: 3000, max: 5000 },
  C1: { min: 5000, max: 8000 },
  C2: { min: 8000, max: 10000 },
};

interface DashboardClientProps {
  data: {
    totalWords: number;
    totalSentences: number;
    todayWords: number;
    streak: number;
    xp: number;
    level: string;
    longestStreak: number;
    weeklyGoal: number;
    recentWords: {
      _id: string;
      german: string;
      english: string;
      category: string;
    }[];
    todayTasks: {
      _id: string;
      title: string;
      status: string;
      completedCount: number;
      targetCount: number;
      xpReward: number;
      type: string;
    }[];
    overdueTasks: {
      _id: string;
      title: string;
      status: string;
    }[];
    weeklyActivity: {
      day: string;
      count: number;
    }[];
    categoryBreakdown: {
      category: string;
      count: number;
    }[];
    weakWords: {
      _id: string;
      german: string;
      english: string;
      quizScore: number;
    }[];
  };
  user: {
    name: string;
    level: string;
    xp: number;
    streak: number;
    image: string;
  };
}

export function DashboardClient({ data, user }: DashboardClientProps) {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );

  const wordOfDay = WORD_OF_THE_DAY[dayOfYear % WORD_OF_THE_DAY.length];
  const prompt = REAL_LIFE_PROMPTS[dayOfYear % REAL_LIFE_PROMPTS.length];

  const levelData = levelXPMap[user.level] || { min: 0, max: 500 };
  const xpProgress = getXPProgress(data.xp);

  const completedTasks = data.todayTasks.filter(
    (t) => t.status === "completed",
  ).length;

  const stats = [
    {
      label: "Total Words",
      value: data.totalWords,
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/vocabulary",
    },
    {
      label: "Sentences",
      value: data.totalSentences,
      icon: PenLine,
      color: "text-green-500",
      bg: "bg-green-500/10",
      href: "/sentences",
    },
    {
      label: "Day Streak",
      value: user.streak,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      href: "/stats",
    },
    {
      label: "Total XP",
      value: user.xp,
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      href: "/profile",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Guten Tag, {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {user.streak > 0
              ? `🔥 ${user.streak}-day streak! Keep going!`
              : "Start learning to build your streak!"}
          </p>
        </div>
        <Link href="/vocabulary/add">
          <Button className="gap-2" size="sm">
            <Plus className="w-4 h-4" />
            Add Word
          </Button>
        </Link>
      </div>

      {/* XP Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total XP</p>
                <p className="text-lg font-bold">{data.xp.toLocaleString()}</p>
              </div>
            </div>
            <span
              className={cn(
                "text-sm font-bold px-2.5 py-1 rounded-lg",
                xpProgress.level === "A1" && "bg-green-500/10 text-green-600",
                xpProgress.level === "A2" && "bg-blue-500/10 text-blue-600",
                xpProgress.level === "B1" && "bg-yellow-500/10 text-yellow-600",
                xpProgress.level === "B2" && "bg-orange-500/10 text-orange-600",
                xpProgress.level === "C1" && "bg-purple-500/10 text-purple-600",
                xpProgress.level === "C2" && "bg-red-500/10 text-red-600",
              )}
            >
              {xpProgress.level}
            </span>
          </div>

          {/* Progress within current level */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {xpProgress.xpInLevel.toLocaleString()} /{" "}
                {xpProgress.xpForLevel.toLocaleString()} XP
              </span>
              {xpProgress.nextLevel && (
                <span>
                  {xpProgress.xpToNext.toLocaleString()} to{" "}
                  {xpProgress.nextLevel}
                </span>
              )}
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-yellow-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal Progress */}
      {data.weeklyGoal > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                Weekly Goal
              </span>
              <span className="text-sm text-muted-foreground">
                {data.totalWords > 0
                  ? Math.min(data.todayWords * 7, data.weeklyGoal)
                  : 0}
                /{data.weeklyGoal} words
              </span>
            </div>
            <Progress
              value={Math.min(
                ((data.todayWords * 7) / data.weeklyGoal) * 100,
                100,
              )}
              className="h-2"
            />
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:border-primary/40 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div
                  className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}
                >
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold">{s.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Words This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.weeklyActivity.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={data.weeklyActivity}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(v) => [`${v} words`, "Added"]}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
                  <BookOpen className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No activity this week</p>
                  <Link href="/vocabulary/add">
                    <Button variant="link" size="sm">
                      Add your first word
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" />
                  Today&apos;s Tasks
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {completedTasks}/{data.todayTasks.length}
                  </span>
                  <Link href="/tasks">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
              {data.todayTasks.length > 0 && (
                <Progress
                  value={(completedTasks / data.todayTasks.length) * 100}
                  className="h-1.5 mt-2"
                />
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {data.todayTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No tasks for today</p>
                  <Link href="/tasks">
                    <Button variant="link" size="sm">
                      Generate tasks
                    </Button>
                  </Link>
                </div>
              ) : (
                data.todayTasks.slice(0, 4).map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50"
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        task.status === "completed"
                          ? "bg-green-500"
                          : "bg-primary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${
                          task.status === "completed"
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {task.completedCount}/{task.targetCount} done
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      +{task.xpReward} XP
                    </Badge>
                  </div>
                ))
              )}

              {/* Overdue */}
              {data.overdueTasks.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-destructive flex items-center gap-1 mb-1.5">
                    <AlertTriangle className="w-3 h-3" />
                    {data.overdueTasks.length} overdue
                  </p>
                  {data.overdueTasks.map((t) => (
                    <p
                      key={t._id}
                      className="text-xs text-muted-foreground truncate"
                    >
                      • {t.title}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Words */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Recent Words
                </CardTitle>
                <Link href="/vocabulary">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {data.recentWords.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No words added yet</p>
                  <Link href="/vocabulary/add">
                    <Button variant="link" size="sm">
                      Add your first word
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.recentWords.map((w) => (
                    <div
                      key={w._id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50"
                    >
                      <div>
                        <p className="font-semibold text-primary text-sm">
                          {w.german}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {w.english}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {w.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Word of the Day */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Word of the Day
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {wordOfDay.german}
                </p>
                <p className="text-muted-foreground text-sm">
                  {wordOfDay.english}
                </p>
              </div>
              <p className="text-xs italic text-muted-foreground bg-background/60 rounded-lg p-2 border border-border">
                &ldquo;{wordOfDay.example}&rdquo;
              </p>
              <Link href="/vocabulary/add">
                <Button size="sm" variant="outline" className="w-full">
                  Add to vocabulary
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Real Life Challenge */}
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                🌍 Today&apos;s Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{prompt}</p>
              <Link href="/sentences/add">
                <Button size="sm" variant="outline" className="w-full mt-3">
                  Write in German
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Categories */}
          {data.categoryBreakdown.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.categoryBreakdown.slice(0, 5).map((c) => (
                  <div key={c.category}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{c.category}</span>
                      <span className="text-muted-foreground">{c.count}</span>
                    </div>
                    <Progress
                      value={(c.count / data.totalWords) * 100}
                      className="h-1.5"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
