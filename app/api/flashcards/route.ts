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
    const mode = searchParams.get("mode") || "due";

    let query: Record<string, unknown> = { userId };

    if (mode === "due") {
      query = {
        userId,
        nextReviewDate: { $lte: new Date() },
      };
    } else if (mode === "all") {
      query = { userId };
    } else if (mode === "weak") {
      query = { userId, quizScore: { $lt: 50 } };
    }

    const words = await Word.find(query)
      .sort({ nextReviewDate: 1 })
      .limit(20)
      .lean();

    return NextResponse.json({
      words: JSON.parse(JSON.stringify(words)),
      total: words.length,
    });
  } catch (error) {
    console.error("GET flashcards error:", error);
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
    const { wordId, rating } = await request.json();

    const word = await Word.findOne({
      _id: wordId,
      userId,
    });
    if (!word) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    // SM-2 Spaced Repetition Algorithm
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

    if (rating >= 3) {
      word.quizScore = Math.min(word.quizScore + 5, 100);
    } else {
      word.quizScore = Math.max(word.quizScore - 5, 0);
    }

    await word.save();

    // ✅ Update review task progress
    await updateTaskProgress(userId, "review", 1);

    return NextResponse.json({
      word: JSON.parse(JSON.stringify(word)),
      nextReview: word.nextReviewDate,
      interval,
    });
  } catch (error) {
    console.error("POST flashcard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
