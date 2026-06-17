import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const { increment } = await request.json();

    const task = await Task.findOne({
      _id: id,
      userId: dbUser._id,
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.status === "completed") {
      return NextResponse.json({ error: "Already completed" }, { status: 400 });
    }

    task.completedCount = Math.min(
      task.completedCount + (increment || 1),
      task.targetCount,
    );

    if (task.completedCount >= task.targetCount) {
      task.status = "completed";
      task.completedAt = new Date();
    }

    await task.save();

    return NextResponse.json({
      task: JSON.parse(JSON.stringify(task)),
    });
  } catch (error) {
    console.error("Progress task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
