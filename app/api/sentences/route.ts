import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Sentence from "@/models/Sentence";
import User from "@/models/User";
import Word from "@/models/Word";
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

    const sortObj: Record<string, 1 | -1> = {
      [sort]: order === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [sentences, total] = await Promise.all([
      Sentence.find(query).sort(sortObj).skip(skip).limit(limit).lean(),
      Sentence.countDocuments(query),
    ]);

    return NextResponse.json({
      sentences: JSON.parse(JSON.stringify(sentences)),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("GET sentences error:", error);
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
    const { german, english, bangla, category, difficulty, notes } = body;

    if (!german?.trim() || !english?.trim()) {
      return NextResponse.json(
        {
          error: "German and English are required",
        },
        { status: 400 },
      );
    }

    // Detect vocabulary words
    const germanWords = german
      .toLowerCase()
      .replace(/[.,!?;:'"()]/g, "")
      .split(" ")
      .filter((w: string) => w.length > 1);

    const existingWords = await Word.find({
      userId,
      german: {
        $in: germanWords.map((w: string) => new RegExp(`^${w}$`, "i")),
      },
    }).select("german");

    const wordsUsed = existingWords.map((w: { german: string }) => w.german);

    const sentence = await Sentence.create({
      userId,
      german: german.trim(),
      english: english.trim(),
      bangla: bangla?.trim() || "",
      category: category || "Other",
      difficulty: difficulty || "beginner",
      notes: notes?.trim() || "",
      wordsUsed,
    });

    // Award XP
    const xpEarned = 15;
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

    // Sentence master badge
    const sentenceCount = await Sentence.countDocuments({ userId });
    if (sentenceCount >= 50 && !dbUser.badges.includes("sentence_master")) {
      dbUser.badges.push("sentence_master");
    }

    await dbUser.save();

    // ✅ Update write_sentences task progress
    const taskProgress = await updateTaskProgress(userId, "write_sentences", 1);

    // ✅ Award bonus XP if task completed
    let totalXP = xpEarned;
    if (taskProgress.taskCompleted && taskProgress.xpEarned > 0) {
      dbUser.xp += taskProgress.xpEarned;
      dbUser.level = getLevelFromXP(dbUser.xp);
      await dbUser.save();
      totalXP += taskProgress.xpEarned;
    }

    return NextResponse.json({
      sentence: JSON.parse(JSON.stringify(sentence)),
      xpEarned: totalXP,
      wordsUsed,
      message: "Sentence added successfully",
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
    console.error("POST sentences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
