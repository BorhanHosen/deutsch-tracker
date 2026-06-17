"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  BookOpen,
  PenLine,
  Flame,
  Star,
  Trophy,
  Brain,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#14b8a6",
];

interface StatsData {
  overview: {
    totalWords: number;
    totalSentences: number;
    totalTasksCompleted: number;
    streak: number;
    longestStreak: number;
    xp: number;
    level: string;
    avgQuizScore: number;
    avgWordsPerDay: number;
    productivityScore: number;
  };
  monthlyChart: {
    date: string;
    label: string;
    count: number;
  }[];
  weeklyChart: {
    date: string;
    day: string;
    count: number;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
    avgScore: number;
  }[];
  difficultyBreakdown: {
    difficulty: string;
    count: number;
  }[];
  mostRepeatedWords: {
    _id: string;
    german: string;
    english: string;
    frequency: number;
  }[];
  weakWords: {
    _id: string;
    german: string;
    english: string;
    quizScore: number;
  }[];
  strongWords: {
    _id: string;
    german: string;
    english: string;
    quizScore: number;
  }[];
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("weekly");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const result = await res.json();
        if (res.ok) {
          setData(result);
        } else {
          toast.error("Failed to load statistics");
        }
      } catch {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="h-8 w-40 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <BarChart3 className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold">No data yet</h3>
        <p className="text-muted-foreground text-sm mt-2">
          Start adding words to see your statistics
        </p>
      </div>
    );
  }

  const { overview } = data;

  const overviewStats = [
    {
      label: "Total Words",
      value: overview.totalWords,
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Sentences",
      value: overview.totalSentences,
      icon: PenLine,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Current Streak",
      value: `${overview.streak}d`,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Total XP",
      value: overview.xp,
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      label: "Tasks Done",
      value: overview.totalTasksCompleted,
      icon: Trophy,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Avg Quiz Score",
      value: `${overview.avgQuizScore}%`,
      icon: Brain,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Words/Day",
      value: overview.avgWordsPerDay,
      icon: TrendingUp,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Productivity",
      value: `${overview.productivityScore}%`,
      icon: Zap,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

  // ✅ Unified type for both chart periods
  interface ChartPoint {
    date: string;
    day?: string;
    label?: string;
    count: number;
    displayKey?: string;
  }

  const chartData: ChartPoint[] =
    chartPeriod === "weekly"
      ? data.weeklyChart.map((d) => ({
          ...d,
          displayKey: d.day,
        }))
      : data.monthlyChart.map((d) => ({
          ...d,
          displayKey: d.label,
        }));

  const chartKey = "displayKey";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your German learning progress
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {overviewStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div
                  className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}
                >
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="text-xl font-bold">{s.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Streak Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Current Streak
              </p>
              <Badge
                variant="outline"
                className="text-orange-600 border-orange-500/30"
              >
                {overview.streak} days
              </Badge>
            </div>
            <Progress
              value={Math.min(
                (overview.streak / Math.max(overview.longestStreak, 1)) * 100,
                100,
              )}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Best: {overview.longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                Productivity Score
              </p>
              <Badge
                variant="outline"
                className="text-purple-600 border-purple-500/30"
              >
                {overview.productivityScore}%
              </Badge>
            </div>
            <Progress value={overview.productivityScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Based on tasks completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Words Added Over Time
            </CardTitle>
            <Tabs value={chartPeriod} onValueChange={setChartPeriod}>
              <TabsList className="h-8">
                <TabsTrigger value="weekly" className="text-xs h-7">
                  7 Days
                </TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs h-7">
                  30 Days
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey={chartKey}
                  tick={{
                    fontSize: 11,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={chartPeriod === "monthly" ? 4 : 0}
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
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No activity data yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Words by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.categoryBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(props) => {
                        const { name, percent } = props;
                        return `${name ?? ""} ${Math.round((percent ?? 0) * 100)}%`;
                      }}
                      labelLine={false}
                    >
                      {data.categoryBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.category}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value, name) => [`${value} words`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-2 mt-2">
                  {data.categoryBreakdown.map((c, i) => (
                    <div
                      key={c.category}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="font-medium flex-1">{c.category}</span>
                      <span className="text-muted-foreground">
                        {c.count} words
                      </span>
                      <span className="text-muted-foreground">
                        {c.avgScore}% quiz
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Difficulty Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Words by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.difficultyBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.difficultyBreakdown}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="difficulty"
                    tick={{
                      fontSize: 12,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
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
                    formatter={(v) => [`${v} words`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.difficultyBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.difficulty === "beginner"
                            ? "#22c55e"
                            : entry.difficulty === "intermediate"
                              ? "#f59e0b"
                              : "#ef4444"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Word Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weak Words */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-red-600 flex items-center gap-2">
              💪 Needs Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.weakWords.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No weak words yet
              </p>
            ) : (
              <div className="space-y-2">
                {data.weakWords.map((w) => (
                  <div
                    key={w._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-primary">{w.german}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.english}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs text-red-600 border-red-500/30 bg-red-500/10"
                    >
                      {w.quizScore}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strong Words */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-green-600 flex items-center gap-2">
              ⭐ Strong Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.strongWords.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Complete quizzes to see strong words
              </p>
            ) : (
              <div className="space-y-2">
                {data.strongWords.map((w) => (
                  <div
                    key={w._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-primary">{w.german}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.english}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs text-green-600 border-green-500/30 bg-green-500/10"
                    >
                      {w.quizScore}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Repeated */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-blue-600 flex items-center gap-2">
              🔄 Most Repeated
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.mostRepeatedWords.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No repeated words yet
              </p>
            ) : (
              <div className="space-y-2">
                {data.mostRepeatedWords.map((w) => (
                  <div
                    key={w._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-primary">{w.german}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.english}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs text-blue-600 border-blue-500/30 bg-blue-500/10"
                    >
                      {w.frequency}×
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
