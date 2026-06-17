import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Word from "@/models/Word";
import User from "@/models/User";
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
    const mode = searchParams.get("mode") || "multiple";
    const count = parseInt(searchParams.get("count") || "10");
    const category = searchParams.get("category") || "";

    const query: Record<string, unknown> = { userId };
    if (category && category !== "all") {
      query.category = category;
    }

    const totalWords = await Word.countDocuments(query);

    if (totalWords < 4) {
      return NextResponse.json(
        {
          error: "You need at least 4 words to start a quiz",
        },
        { status: 400 },
      );
    }

    // Get random words for quiz
    const words = await Word.aggregate([
      { $match: query },
      { $sample: { size: Math.min(count, totalWords) } },
    ]);

    // Get all words for wrong options
    const allWords = await Word.find(query).select("english german").lean();

    const questions = words.map((word) => {
      // Generate 3 wrong options
      const wrongOptions = allWords
        .filter((w) => w._id.toString() !== word._id.toString())
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => (mode === "reverse" ? w.german : w.english));

      const correctAnswer = mode === "reverse" ? word.german : word.english;

      const options = [...wrongOptions, correctAnswer].sort(
        () => Math.random() - 0.5,
      );

      return {
        wordId: word._id.toString(),
        german: word.german,
        english: word.english,
        correctAnswer,
        options,
        mode,
      };
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("GET quiz error:", error);
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
    const { results } = await request.json();

    let xpEarned = 0;
    let correct = 0;

    for (const result of results) {
      const word = await Word.findOne({
        _id: result.wordId,
        userId,
      });
      if (!word) continue;

      if (result.correct) {
        correct++;
        xpEarned += 5;
        word.quizScore = Math.min(word.quizScore + 10, 100);
      } else {
        word.quizScore = Math.max(word.quizScore - 5, 0);
      }

      // Update spaced repetition
      const rating = result.correct ? 4 : 1;
      const newEaseFactor = Math.max(
        1.3,
        word.easeFactor + 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02),
      );
      let interval = word.reviewInterval;
      if (rating < 3) {
        interval = 1;
      } else if (interval === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * newEaseFactor);
      }
      word.reviewInterval = interval;
      word.easeFactor = newEaseFactor;
      word.nextReviewDate = new Date(Date.now() + interval * 86400000);

      await word.save();
    }

    // Award XP
    // Award XP
    dbUser.xp += xpEarned;

    // Check quiz champion badge
    if (!dbUser.badges.includes("quiz_champion")) {
      const perfectScore = correct === results.length && results.length >= 10;
      if (perfectScore) {
        dbUser.badges.push("quiz_champion");
      }
    }

    await dbUser.save();

    // ✅ Update quiz task progress
    const taskProgress = await updateTaskProgress(
      userId,
      "quiz",
      results.length, // increment by questions answered
    );

    // ✅ Award bonus XP if task completed
    let totalXP = xpEarned;
    if (taskProgress.taskCompleted && taskProgress.xpEarned > 0) {
      dbUser.xp += taskProgress.xpEarned;
      dbUser.level = getLevelFromXP(dbUser.xp);
      await dbUser.save();
      totalXP += taskProgress.xpEarned;
    }

    return NextResponse.json({
      correct,
      total: results.length,
      xpEarned: totalXP,
      score: Math.round((correct / results.length) * 100),
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
    console.error("POST quiz error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
