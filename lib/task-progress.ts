import Task from "@/models/Task";
import User from "@/models/User";
import { getLevelFromXP } from "@/lib/utils";
import mongoose from "mongoose";

export type TaskType =
  | "learn_words"
  | "write_sentences"
  | "review"
  | "real_life"
  | "quiz";

interface TaskProgressResult {
  taskUpdated: boolean;
  taskCompleted: boolean;
  xpEarned: number;
  task: {
    _id: string;
    title: string;
    completedCount: number;
    targetCount: number;
    status: string;
    xpReward: number;
  } | null;
}

export async function updateTaskProgress(
  userId: mongoose.Types.ObjectId,
  taskType: TaskType,
  increment: number = 1,
): Promise<TaskProgressResult> {
  const result: TaskProgressResult = {
    taskUpdated: false,
    taskCompleted: false,
    xpEarned: 0,
    task: null,
  };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's pending or overdue task
    // of this type
    const task = await Task.findOne({
      userId,
      type: taskType,
      status: { $in: ["pending", "overdue"] },
      dueDate: { $gte: today, $lt: tomorrow },
    });

    if (!task) {
      // Also check overdue tasks from previous days
      const overdueTask = await Task.findOne({
        userId,
        type: taskType,
        status: "overdue",
      }).sort({ dueDate: -1 });

      if (!overdueTask) {
        return result;
      }

      // Update overdue task
      overdueTask.completedCount = Math.min(
        overdueTask.completedCount + increment,
        overdueTask.targetCount,
      );

      result.taskUpdated = true;

      if (overdueTask.completedCount >= overdueTask.targetCount) {
        overdueTask.status = "completed";
        overdueTask.completedAt = new Date();
        result.taskCompleted = true;
        // 50% XP for overdue tasks
        result.xpEarned = Math.floor(overdueTask.xpReward * 0.5);
      }

      await overdueTask.save();
      result.task = JSON.parse(JSON.stringify(overdueTask));
      return result;
    }

    // Update today's task
    task.completedCount = Math.min(
      task.completedCount + increment,
      task.targetCount,
    );

    result.taskUpdated = true;

    if (task.completedCount >= task.targetCount) {
      task.status = "completed";
      task.completedAt = new Date();
      result.taskCompleted = true;
      result.xpEarned = task.xpReward;
    }

    await task.save();
    result.task = JSON.parse(JSON.stringify(task));

    return result;
  } catch (error) {
    console.error("updateTaskProgress error:", error);
    return result;
  }
}

export async function awardTaskXP(
  userEmail: string,
  xpAmount: number,
): Promise<void> {
  if (xpAmount <= 0) return;

  try {
    const user = await User.findOne({
      email: userEmail,
    });
    if (!user) return;

    user.xp += xpAmount;
    user.level = getLevelFromXP(user.xp);
    await user.save();
  } catch (error) {
    console.error("awardTaskXP error:", error);
  }
}
