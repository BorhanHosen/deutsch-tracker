import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import UserLearnProgress from "@/models/UserLearnProgress";
import LearnWord from "@/models/LearnWord";
import User from "@/models/User";

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
    const { wordIds } = await request.json();

    if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
      return NextResponse.json({
        synced: 0,
        message: "Nothing to sync",
      });
    }

    // Validate that these word IDs exist
    const validWords = await LearnWord.find({
      _id: { $in: wordIds },
    }).select("_id");

    const validIds = validWords.map((w) => w._id.toString());

    let synced = 0;

    for (const wordId of validIds) {
      try {
        await UserLearnProgress.findOneAndUpdate(
          { userId, wordId },
          {
            userId,
            wordId,
            batchNumber: 1,
            learnedAt: new Date(),
          },
          { upsert: true, new: true },
        );
        synced++;
      } catch {
        // Skip duplicates
      }
    }

    // Award XP for synced words
    if (synced > 0) {
      dbUser.xp += synced * 5;
      await dbUser.save();
    }

    return NextResponse.json({
      synced,
      message: `${synced} word${synced !== 1 ? "s" : ""} synced to your account!`,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
