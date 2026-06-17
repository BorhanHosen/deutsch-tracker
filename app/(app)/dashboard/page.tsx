import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Word from "@/models/Word";
import Sentence from "@/models/Sentence";
import Task from "@/models/Task";
import User from "@/models/User";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { generateDailyTasksForUser } from "@/app/api/tasks/route";
import mongoose from "mongoose";

async function getDashboardData(userEmail: string) {
  await connectDB();

  // ✅ Always get real MongoDB _id from email
  const dbUser = (await User.findOne({
    email: userEmail,
  }).lean()) as {
    _id: mongoose.Types.ObjectId;
    streak: number;
    xp: number;
    level: string;
    longestStreak: number;
    weeklyGoal: number;
    monthlyGoal: number;
  } | null;

  if (!dbUser) return null;

  const userId = dbUser._id;

  // ✅ Generate today's tasks if not yet created
  try {
    await generateDailyTasksForUser(userId);
  } catch (error) {
    console.error("Task generation error on dashboard:", error);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalWords,
    totalSentences,
    todayWords,
    recentWords,
    todayTasks,
    overdueTasks,
    weeklyActivity,
    categoryBreakdown,
  ] = await Promise.all([
    // Total words
    Word.countDocuments({ userId }),

    // Total sentences
    Sentence.countDocuments({ userId }),

    // Words added today
    Word.countDocuments({
      userId,
      createdAt: { $gte: today, $lt: tomorrow },
    }),

    // Recent 5 words
    Word.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),

    // Today's tasks
    Task.find({
      userId,
      dueDate: { $gte: today, $lt: tomorrow },
    })
      .sort({ createdAt: 1 })
      .lean(),

    // Overdue tasks (max 3 shown)
    Task.find({
      userId,
      status: "overdue",
    })
      .sort({ dueDate: -1 })
      .limit(3)
      .lean(),

    // Weekly word activity
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

    // Category breakdown
    Word.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  // Build 7-day chart
  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const found = weeklyActivity.find(
      (a: { _id: string; count: number }) => a._id === dateStr,
    );
    weekDays.push({
      day: dayName,
      count: found ? found.count : 0,
    });
  }

  // Get weak words for dashboard alert
  const weakWords = await Word.find({
    userId,
    quizScore: { $gt: 0, $lt: 50 },
  })
    .sort({ quizScore: 1 })
    .limit(5)
    .select("german english quizScore")
    .lean();

  return {
    totalWords,
    totalSentences,
    todayWords,
    streak: dbUser.streak,
    xp: dbUser.xp,
    level: dbUser.level,
    longestStreak: dbUser.longestStreak,
    weeklyGoal: dbUser.weeklyGoal,
    recentWords: JSON.parse(JSON.stringify(recentWords)),
    todayTasks: JSON.parse(JSON.stringify(todayTasks)),
    overdueTasks: JSON.parse(JSON.stringify(overdueTasks)),
    weeklyActivity: weekDays,
    categoryBreakdown: categoryBreakdown.map(
      (c: { _id: string; count: number }) => ({
        category: c._id || "Other",
        count: c.count,
      }),
    ),
    weakWords: JSON.parse(JSON.stringify(weakWords)),
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const data = await getDashboardData(session.user.email);

  if (!data) {
    redirect("/login");
  }

  return (
    <DashboardClient
      data={data}
      user={{
        name: session.user.name || "Learner",
        level: data.level || "A1",
        xp: data.xp || 0,
        streak: data.streak || 0,
        image: session.user.image || "",
      }}
    />
  );
}
