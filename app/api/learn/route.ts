import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import LearnWord from "@/models/LearnWord";
import UserLearnProgress from "@/models/UserLearnProgress";
import User from "@/models/User";

const BATCH_SIZE = 5;

export async function GET() {
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

    // Total words available
    const totalWords = await LearnWord.countDocuments();

    if (totalWords === 0) {
      return NextResponse.json({
        status: "not_seeded",
        message: "Words not seeded yet. Please seed first.",
        words: [],
        progress: {
          learned: 0,
          total: 0,
          currentBatch: 0,
          totalBatches: 0,
          percent: 0,
        },
      });
    }

    // Get all learned word IDs for this user
    const learnedProgress = await UserLearnProgress.find({
      userId,
    }).lean();

    const learnedWordIds = learnedProgress.map((p) => p.wordId.toString());

    const totalLearned = learnedWordIds.length;
    const currentBatch = Math.floor(totalLearned / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(totalWords / BATCH_SIZE);

    // Check if all words are learned
    if (totalLearned >= totalWords) {
      return NextResponse.json({
        status: "completed",
        message: "You have learned all words!",
        words: [],
        progress: {
          learned: totalLearned,
          total: totalWords,
          currentBatch: totalBatches,
          totalBatches,
          percent: 100,
        },
      });
    }

    // Get next 5 unseen words
    const nextWords = await LearnWord.find({
      _id: {
        $nin: learnedWordIds,
      },
    })
      .sort({ order: 1 })
      .limit(BATCH_SIZE)
      .lean();

    // Check if current batch words are all learned
    // by looking at what's in the current batch
    const currentBatchLearned = learnedProgress.filter(
      (p) => p.batchNumber === currentBatch - 1,
    ).length;

    return NextResponse.json({
      status: "learning",
      words: JSON.parse(JSON.stringify(nextWords)),
      progress: {
        learned: totalLearned,
        total: totalWords,
        currentBatch,
        totalBatches,
        percent: Math.round((totalLearned / totalWords) * 100),
      },
    });
  } catch (error) {
    console.error("GET learn error:", error);
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
    const { wordIds, batchNumber } = await request.json();

    if (!wordIds || !Array.isArray(wordIds)) {
      return NextResponse.json(
        { error: "wordIds array required" },
        { status: 400 },
      );
    }

    // Mark all words in batch as learned
    const progressDocs = wordIds.map((wordId: string) => ({
      userId,
      wordId,
      batchNumber,
      learnedAt: new Date(),
    }));

    // Use upsert to avoid duplicates
    for (const doc of progressDocs) {
      await UserLearnProgress.findOneAndUpdate(
        { userId: doc.userId, wordId: doc.wordId },
        doc,
        { upsert: true, new: true },
      );
    }

    // Award XP for completing a batch
    const xpEarned = BATCH_SIZE * 8;
    dbUser.xp += xpEarned;
    await dbUser.save();

    const totalLearned = await UserLearnProgress.countDocuments({
      userId,
    });
    const totalWords = await LearnWord.countDocuments();

    return NextResponse.json({
      message: "Batch completed!",
      xpEarned,
      totalLearned,
      totalWords,
      percent: Math.round((totalLearned / totalWords) * 100),
    });
  } catch (error) {
    console.error("POST learn error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
