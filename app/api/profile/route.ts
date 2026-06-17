import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Word from "@/models/Word";
import Sentence from "@/models/Sentence";
import Task from "@/models/Task";
import Achievement from "@/models/Achievement";
import { ACHIEVEMENTS_META } from "@/models/Achievement";

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

    const [totalWords, totalSentences, totalTasksCompleted] = await Promise.all(
      [
        Word.countDocuments({ userId }),
        Sentence.countDocuments({ userId }),
        Task.countDocuments({
          userId,
          status: "completed",
        }),
      ],
    );

    // Build badges with metadata
    const badges = dbUser.badges.map((badgeId: string) => ({
      id: badgeId,
      ...(ACHIEVEMENTS_META[badgeId as keyof typeof ACHIEVEMENTS_META] || {
        title: badgeId,
        description: "Achievement unlocked",
        icon: "🏅",
      }),
    }));

    return NextResponse.json({
      user: JSON.parse(JSON.stringify(dbUser)),
      stats: {
        totalWords,
        totalSentences,
        totalTasksCompleted,
      },
      badges,
    });
  } catch (error) {
    console.error("GET profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { weeklyGoal, monthlyGoal, emailReminders, theme } = body;

    if (weeklyGoal !== undefined) {
      dbUser.weeklyGoal = weeklyGoal;
    }
    if (monthlyGoal !== undefined) {
      dbUser.monthlyGoal = monthlyGoal;
    }
    if (emailReminders !== undefined) {
      dbUser.emailReminders = emailReminders;
    }
    if (theme !== undefined) {
      dbUser.theme = theme;
    }

    await dbUser.save();

    return NextResponse.json({
      user: JSON.parse(JSON.stringify(dbUser)),
      message: "Profile updated",
    });
  } catch (error) {
    console.error("PUT profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
