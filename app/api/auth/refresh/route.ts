import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const dbUser = (await User.findOne({
      email: session.user.email,
    }).lean()) as {
      _id: unknown;
      xp: number;
      streak: number;
      longestStreak: number;
      level: string;
      badges: string[];
    } | null;

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      xp: dbUser.xp,
      streak: dbUser.streak,
      longestStreak: dbUser.longestStreak,
      level: dbUser.level,
      badges: dbUser.badges,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
