import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Word from "@/models/Word";
import User from "@/models/User";
import { getLevelFromXP } from "@/lib/utils";
import { updateTaskProgress } from "@/lib/task-progress";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const favoritesOnly = searchParams.get("favorites") === "true";

    const query: Record<string, unknown> = {
      userId,
    };

    if (search) {
      query.$or = [
        {
          german: {
            $regex: search,
            $options: "i",
          },
        },
        {
          english: {
            $regex: search,
            $options: "i",
          },
        },
        {
          bangla: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (difficulty && difficulty !== "all") {
      query.difficulty = difficulty;
    }

    if (favoritesOnly) {
      query.isFavorite = true;
    }

    const sortObj: Record<string, 1 | -1> = {
      [sort]: order === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [words, total] = await Promise.all([
      Word.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Word.countDocuments(query),
    ]);

    return NextResponse.json({
      words: JSON.parse(JSON.stringify(words)),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("GET vocabulary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

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
      notes,
      tags,
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
        message: `Already exists. Frequency: ${existing.frequency}`,
        taskProgress: null,
      });
    }

    // Create new word
    const word = await Word.create({
      userId,
      german: german.trim(),
      english: english.trim(),
      bangla: bangla?.trim() || "",
      pronunciation: pronunciation?.trim() || "",
      category: category || "Other",
      difficulty: difficulty || "beginner",
      notes: notes?.trim() || "",
      tags: tags || [],
      frequency: 1,
      quizScore: 0,
      nextReviewDate: new Date(),
      reviewInterval: 1,
      easeFactor: 2.5,
      isFavorite: false,
    });

    // Award XP for new word
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

    // Check badges
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

    // ✅ Update learn_words task progress
    const taskProgress = await updateTaskProgress(userId, "learn_words", 1);

    // ✅ Award bonus XP if task completed
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
      message: "Word added successfully",
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
    console.error("POST vocabulary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
