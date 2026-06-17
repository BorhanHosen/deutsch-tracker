"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  BookOpen,
  PenLine,
  Brain,
  Globe,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ITask } from "@/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: ITask;
  onComplete: (id: string) => void;
  completing: boolean;
}

const taskIcons: Record<string, React.ElementType> = {
  learn_words: BookOpen,
  write_sentences: PenLine,
  review: RotateCcw,
  real_life: Globe,
  quiz: Brain,
};

const taskColors: Record<string, string> = {
  learn_words: "text-blue-500 bg-blue-500/10",
  write_sentences: "text-green-500 bg-green-500/10",
  review: "text-purple-500 bg-purple-500/10",
  real_life: "text-orange-500 bg-orange-500/10",
  quiz: "text-red-500 bg-red-500/10",
};

const statusColors: Record<string, string> = {
  pending: "border-border",
  completed: "border-green-500/30 bg-green-500/5",
  overdue: "border-orange-500/30 bg-orange-500/5",
};

export function TaskCard({ task, onComplete, completing }: TaskCardProps) {
  const Icon = taskIcons[task.type] || CheckCircle2;
  const iconStyle = taskColors[task.type] || "text-primary bg-primary/10";
  const progress = (task.completedCount / task.targetCount) * 100;
  const isCompleted = task.status === "completed";
  const isOverdue = task.status === "overdue";

  return (
    <Card
      className={cn("transition-all duration-200", statusColors[task.status])}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconStyle}`}
          >
            <Icon className="w-5 h-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-semibold text-sm",
                    isCompleted && "line-through text-muted-foreground",
                  )}
                >
                  {task.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {task.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isOverdue && (
                  <Badge
                    variant="outline"
                    className="text-xs text-orange-600 border-orange-500/30 bg-orange-500/10"
                  >
                    Overdue
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="text-xs text-yellow-600 border-yellow-500/30 bg-yellow-500/10"
                >
                  +{task.xpReward} XP
                </Badge>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {task.completedCount}/{task.targetCount} completed
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Due: {formatDate(task.dueDate)}
                </span>
              </div>
              <Progress
                value={progress}
                className={cn("h-1.5", isCompleted && "opacity-50")}
              />
            </div>

            {/* Complete Button */}
            {!isCompleted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3"
              >
                <Button
                  size="sm"
                  onClick={() => onComplete(task._id)}
                  disabled={completing}
                  className={cn(
                    "h-8 text-xs gap-1.5",
                    isOverdue ? "bg-orange-500 hover:bg-orange-600" : "",
                  )}
                >
                  {completing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  {completing
                    ? "Completing..."
                    : isOverdue
                      ? "Complete (50% XP)"
                      : "Mark Complete"}
                </Button>
              </motion.div>
            )}

            {/* Completed */}
            {isCompleted && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
