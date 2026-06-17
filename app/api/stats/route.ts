import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Word from "@/models/Word";
import Sentence from "@/models/Sentence";
import Task from "@/models/Task";
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalWords,
      totalSentences,
      totalTasksCompleted,
      categoryBreakdown,
      difficultyBreakdown,
      monthlyWordActivity,
      weeklyWordActivity,
      mostRepeatedWords,
      weakWords,
      strongWords,
      recentQuizScores,
    ] = await Promise.all([
      // Total words
      Word.countDocuments({ userId }),

      // Total sentences
      Sentence.countDocuments({ userId }),

      // Completed tasks
      Task.countDocuments({
        userId,
        status: "completed",
      }),

      // Category breakdown
      Word.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            avgScore: { $avg: "$quizScore" },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Difficulty breakdown
      Word.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$difficulty",
            count: { $sum: 1 },
          },
        },
      ]),

      // Monthly activity (last 30 days)
      Word.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Weekly activity (last 7 days)
      Word.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Most repeated words
      Word.find({ userId, frequency: { $gt: 1 } })
        .sort({ frequency: -1 })
        .limit(10)
        .select("german english frequency")
        .lean(),

      // Weak words
      Word.find({ userId, quizScore: { $lt: 50 } })
        .sort({ quizScore: 1 })
        .limit(10)
        .select("german english quizScore")
        .lean(),

      // Strong words
      Word.find({
        userId,
        quizScore: { $gte: 70 },
      })
        .sort({ quizScore: -1 })
        .limit(10)
        .select("german english quizScore")
        .lean(),

      // Words with quiz scores for avg
      Word.find({ userId, quizScore: { $gt: 0 } })
        .select("quizScore")
        .lean(),
    ]);

    // Build 30-day chart
    const monthlyChart = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const found = monthlyWordActivity.find(
        (a: { _id: string; count: number }) => a._id === dateStr,
      );
      monthlyChart.push({
        date: dateStr,
        label: dayLabel,
        count: found ? found.count : 0,
      });
    }

    // Build 7-day chart
    const weeklyChart = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const found = weeklyWordActivity.find(
        (a: { _id: string; count: number }) => a._id === dateStr,
      );
      weeklyChart.push({
        date: dateStr,
        day: dayName,
        count: found ? found.count : 0,
      });
    }

    // Average quiz score
    const avgQuizScore =
      recentQuizScores.length > 0
        ? Math.round(
            recentQuizScores.reduce(
              (sum: number, w: { quizScore: number }) => sum + w.quizScore,
              0,
            ) / recentQuizScores.length,
          )
        : 0;

    // Words per day average
    const daysActive = Math.max(
      1,
      Math.floor(
        (Date.now() - new Date(dbUser.createdAt).getTime()) / 86400000,
      ),
    );
    const avgWordsPerDay = Math.round(totalWords / daysActive);

    // Productivity score
    const totalTasks = await Task.countDocuments({
      userId,
    });
    const productivityScore =
      totalTasks > 0 ? Math.round((totalTasksCompleted / totalTasks) * 100) : 0;

    return NextResponse.json({
      overview: {
        totalWords,
        totalSentences,
        totalTasksCompleted,
        streak: dbUser.streak,
        longestStreak: dbUser.longestStreak,
        xp: dbUser.xp,
        level: dbUser.level,
        avgQuizScore,
        avgWordsPerDay,
        productivityScore,
      },
      monthlyChart,
      weeklyChart,
      categoryBreakdown: categoryBreakdown.map(
        (c: { _id: string; count: number; avgScore: number }) => ({
          category: c._id || "Other",
          count: c.count,
          avgScore: Math.round(c.avgScore || 0),
        }),
      ),
      difficultyBreakdown: difficultyBreakdown.map(
        (d: { _id: string; count: number }) => ({
          difficulty: d._id,
          count: d.count,
        }),
      ),
      mostRepeatedWords: JSON.parse(JSON.stringify(mostRepeatedWords)),
      weakWords: JSON.parse(JSON.stringify(weakWords)),
      strongWords: JSON.parse(JSON.stringify(strongWords)),
    });
  } catch (error) {
    console.error("GET stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
