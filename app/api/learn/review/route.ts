import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import LearnWord from "@/models/LearnWord";
import UserLearnProgress from "@/models/UserLearnProgress";
import User from "@/models/User";

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
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const difficulty = searchParams.get("difficulty") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;

    // Get all learned word IDs with batch info
    const progress = await UserLearnProgress.find({
      userId,
    })
      .sort({ batchNumber: 1, learnedAt: 1 })
      .lean();

    if (progress.length === 0) {
      return NextResponse.json({
        words: [],
        total: 0,
        pages: 0,
      });
    }

    const learnedWordIds = progress.map((p) => p.wordId.toString());

    // Build query for learned words
    const query: Record<string, unknown> = {
      _id: { $in: learnedWordIds },
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

    const skip = (page - 1) * limit;

    const [words, total] = await Promise.all([
      LearnWord.find(query).sort({ order: 1 }).skip(skip).limit(limit).lean(),
      LearnWord.countDocuments(query),
    ]);

    // Add batch number to each word
    const wordsWithBatch = words.map((word) => {
      const p = progress.find(
        (pr) => pr.wordId.toString() === word._id.toString(),
      );
      return {
        ...word,
        batchNumber: p?.batchNumber || 1,
        learnedAt: p?.learnedAt,
      };
    });

    return NextResponse.json({
      words: JSON.parse(JSON.stringify(wordsWithBatch)),
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
