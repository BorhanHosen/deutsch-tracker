import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import { getLevelFromXP } from "@/lib/utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const dbUser = await User.findOne({
      email: session.user.email,
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    const task = await Task.findOne({
      _id: id,
      userId: dbUser._id,
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.status === "completed") {
      return NextResponse.json(
        { error: "Task already completed" },
        { status: 400 },
      );
    }

    // Mark complete
    task.status = "completed";
    task.completedCount = task.targetCount;
    task.completedAt = new Date();
    await task.save();

    // Award XP
    // If overdue give 50% XP
    const isOverdue = task.status === "overdue" || new Date(task.dueDate);
    new Date(new Date().setHours(0, 0, 0, 0));
    const xpEarned = isOverdue
      ? Math.floor(task.xpReward * 0.5)
      : task.xpReward;

    dbUser.xp += xpEarned;
    dbUser.level = getLevelFromXP(dbUser.xp);

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dbUser.lastActiveDate) {
      const last = new Date(dbUser.lastActiveDate);
      last.setHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - last.getTime()) / 86400000);
      if (diff === 1) {
        dbUser.streak += 1;
      } else if (diff > 1) {
        dbUser.streak = 1;
      }
    } else {
      dbUser.streak = 1;
    }

    if (dbUser.streak > dbUser.longestStreak) {
      dbUser.longestStreak = dbUser.streak;
    }
    dbUser.lastActiveDate = new Date();

    // Check streak badges
    if (dbUser.streak >= 7 && !dbUser.badges.includes("week_warrior")) {
      dbUser.badges.push("week_warrior");
    }
    if (dbUser.streak >= 30 && !dbUser.badges.includes("streak_30")) {
      dbUser.badges.push("streak_30");
    }

    await dbUser.save();

    return NextResponse.json({
      task: JSON.parse(JSON.stringify(task)),
      xpEarned,
      newStreak: dbUser.streak,
      message: "Task completed!",
    });
  } catch (error) {
    console.error("Complete task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
