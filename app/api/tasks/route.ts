import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import tasksData from "@/data/tasks.json";

const TASKS_PER_DAY = tasksData.length;

export async function generateDailyTasksForUser(userId: unknown) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Check if tasks already exist for today
  const existingCount = await Task.countDocuments({
    userId,
    dueDate: { $gte: today, $lt: tomorrow },
  });

  if (existingCount >= TASKS_PER_DAY) {
    return { generated: false, count: existingCount };
  }

  // Mark previous pending tasks as overdue
  await Task.updateMany(
    {
      userId,
      status: "pending",
      dueDate: { $lt: today },
    },
    { $set: { status: "overdue" } },
  );

  // Create today's tasks from JSON
  const taskDocs = tasksData.map((t) => ({
    userId,
    taskId: t.id,
    type: t.type,
    title: t.title,
    description: t.description,
    targetCount: t.targetCount,
    completedCount: 0,
    status: "pending",
    dueDate: tomorrow,
    completedAt: null,
    xpReward: t.xpReward,
  }));

  await Task.insertMany(taskDocs);

  console.log(`✅ Generated ${taskDocs.length} tasks for user`);

  return {
    generated: true,
    count: taskDocs.length,
  };
}

async function markOverdueTasks(userId: unknown) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await Task.updateMany(
    {
      userId,
      status: "pending",
      dueDate: { $lt: today },
    },
    { $set: { status: "overdue" } },
  );

  return result.modifiedCount;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // ✅ Always use email to get MongoDB _id
    const dbUser = await User.findOne({
      email: session.user.email,
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = dbUser._id;

    // Mark overdue tasks first
    await markOverdueTasks(userId);

    // Generate today's tasks if missing
    await generateDailyTasksForUser(userId);

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "today";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let query: Record<string, unknown> = {
      userId,
    };

    if (filter === "today") {
      query = {
        userId,
        dueDate: { $gte: today, $lt: tomorrow },
      };
    } else if (filter === "overdue") {
      query = { userId, status: "overdue" };
    } else if (filter === "completed") {
      query = { userId, status: "completed" };
    }

    const tasks = await Task.find(query).sort({ createdAt: 1 }).lean();

    // Get stats
    const [todayTasks, overdueTasks] = await Promise.all([
      Task.find({
        userId,
        dueDate: { $gte: today, $lt: tomorrow },
      }).lean(),
      Task.find({
        userId,
        status: "overdue",
      }).lean(),
    ]);

    const completedToday = todayTasks.filter(
      (t) => t.status === "completed",
    ).length;

    return NextResponse.json({
      tasks: JSON.parse(JSON.stringify(tasks)),
      stats: {
        todayTotal: todayTasks.length,
        completedToday,
        overdueCount: overdueTasks.length,
      },
    });
  } catch (error) {
    console.error("GET tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
