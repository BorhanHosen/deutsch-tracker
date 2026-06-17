import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Word from "@/models/Word";
import User from "@/models/User";
import { getLevelFromXP } from "@/lib/utils";
import { updateTaskProgress } from "@/lib/task-progress";

export async function POST(request: NextRequest) {
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

    const userId = dbUser._id;
    const body = await request.json();
    const {
      german,
      english,
      bangla,
      pronunciation,
      category,
      difficulty,
      tags,
      notes,
    } = body;

    if (!german?.trim() || !english?.trim()) {
      return NextResponse.json(
        { error: "German and English are required" },
        { status: 400 },
      );
    }

    // Check if word already exists
    const existing = await Word.findOne({
      userId,
      german: {
        $regex: new RegExp(`^${german.trim()}$`, "i"),
      },
    });

    if (existing) {
      existing.frequency += 1;
      await existing.save();
      return NextResponse.json({
        word: JSON.parse(JSON.stringify(existing)),
        xpEarned: 0,
        isExisting: true,
        message: "Word already in your vocabulary",
      });
    }

    // Create word
    const word = await Word.create({
      userId,
      german: german.trim(),
      english: english.trim(),
      bangla: bangla || "",
      pronunciation: pronunciation || "",
      category: category || "Other",
      difficulty: difficulty || "beginner",
      notes: notes || "",
      tags: tags || [],
      frequency: 1,
      quizScore: 0,
      nextReviewDate: new Date(),
      reviewInterval: 1,
      easeFactor: 2.5,
      isFavorite: false,
    });

    // Award XP
    const xpEarned = 10;
    const currentHour = new Date().getHours();

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

    // Badges
    const wordCount = await Word.countDocuments({
      userId,
    });
    if (wordCount === 1 && !dbUser.badges.includes("first_word")) {
      dbUser.badges.push("first_word");
    }
    if (wordCount >= 100 && !dbUser.badges.includes("century_club")) {
      dbUser.badges.push("century_club");
    }
    if (dbUser.streak >= 7 && !dbUser.badges.includes("week_warrior")) {
      dbUser.badges.push("week_warrior");
    }
    if (currentHour >= 22 && !dbUser.badges.includes("night_owl")) {
      dbUser.badges.push("night_owl");
    }
    if (currentHour < 7 && !dbUser.badges.includes("early_bird")) {
      dbUser.badges.push("early_bird");
    }

    await dbUser.save();

    // Update task progress
    const taskProgress = await updateTaskProgress(userId, "learn_words", 1);

    let totalXP = xpEarned;
    if (taskProgress.taskCompleted && taskProgress.xpEarned > 0) {
      dbUser.xp += taskProgress.xpEarned;
      dbUser.level = getLevelFromXP(dbUser.xp);
      await dbUser.save();
      totalXP += taskProgress.xpEarned;
    }

    return NextResponse.json({
      word: JSON.parse(JSON.stringify(word)),
      xpEarned: totalXP,
      isExisting: false,
      newStreak: dbUser.streak,
      message: "Added to vocabulary!",
      taskProgress: taskProgress.task
        ? {
            completed: taskProgress.taskCompleted,
            completedCount: taskProgress.task.completedCount,
            targetCount: taskProgress.task.targetCount,
            title: taskProgress.task.title,
            bonusXP: taskProgress.xpEarned,
          }
        : null,
    });
  } catch (error) {
    console.error("Add to vocabulary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
