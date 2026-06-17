"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Clock,
  Trophy,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskCardSkeleton } from "@/components/tasks/TaskCardSkeleton";
import { toast } from "sonner";
import { ITask } from "@/types";
import { dispatchXPUpdate } from "@/lib/xp-event";

interface TaskStats {
  todayTotal: number;
  completedToday: number;
  overdueCount: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    todayTotal: 0,
    completedToday: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [filter, setFilter] = useState("today");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?filter=${filter}`);
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks);
        setStats(data.stats);
      } else {
        toast.error("Failed to load tasks");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleComplete = async (taskId: string) => {
    setCompleting(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`Task completed! +${data.xpEarned} XP 🎉`);
        if (data.newStreak > 0) {
          toast.info(`🔥 ${data.newStreak} day streak!`);
        }
        dispatchXPUpdate();
        fetchTasks();
      } else {
        toast.error(data.error || "Failed to complete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCompleting(null);
    }
  };

  const progressPercent =
    stats.todayTotal > 0
      ? Math.round((stats.completedToday / stats.todayTotal) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Daily Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Complete tasks to earn XP and build your streak
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTasks}
          className="gap-2 self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
              <CheckSquare className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">
              {stats.completedToday}
              <span className="text-muted-foreground text-base font-normal">
                /{stats.todayTotal}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-500">
              {stats.overdueCount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-500">
              {progressPercent}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Done</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {stats.todayTotal > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Today&apos;s Progress
              </span>
              <span className="text-sm text-muted-foreground">
                {stats.completedToday}/{stats.todayTotal} tasks
              </span>
            </div>
            <Progress value={progressPercent} className="h-2.5" />
            {progressPercent === 100 && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-green-600 font-medium mt-2 text-center"
              >
                🎉 All tasks completed! Amazing work!
              </motion.p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="today" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Today
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Overdue
            {stats.overdueCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
              >
                {stats.overdueCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          {filter === "today" && (
            <>
              <CheckSquare className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks for today</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Tasks are generated automatically each day
              </p>
              <Button variant="outline" onClick={fetchTasks} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Check Again
              </Button>
            </>
          )}
          {filter === "overdue" && (
            <>
              <CheckCircle2 className="w-14 h-14 mx-auto text-green-500/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No overdue tasks!</h3>
              <p className="text-muted-foreground text-sm">
                You&apos;re all caught up 🎉
              </p>
            </>
          )}
          {filter === "completed" && (
            <>
              <Trophy className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No completed tasks yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Complete your daily tasks to see them here
              </p>
            </>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          <AnimatePresence>
            {tasks.map((task, i) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <TaskCard
                  task={task}
                  onComplete={handleComplete}
                  completing={completing === task._id}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
