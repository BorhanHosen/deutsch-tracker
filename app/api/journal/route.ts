import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Journal from "@/models/Journal";
import User from "@/models/User";
import Word from "@/models/Word";

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      Journal.find({ userId: dbUser._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Journal.countDocuments({
        userId: dbUser._id,
      }),
    ]);

    return NextResponse.json({
      entries: JSON.parse(JSON.stringify(entries)),
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET journal error:", error);
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

    const { title, content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    // Find vocabulary words used in journal
    const allWords = await Word.find({
      userId: dbUser._id,
    })
      .select("german")
      .lean();

    const contentLower = content.toLowerCase();
    const highlightedWords = allWords
      .filter((w) => contentLower.includes(w.german.toLowerCase()))
      .map((w) => w.german);

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const entry = await Journal.create({
      userId: dbUser._id,
      title:
        title?.trim() || `Journal Entry — ${new Date().toLocaleDateString()}`,
      content: content.trim(),
      highlightedWords,
      wordCount,
    });

    return NextResponse.json({
      entry: JSON.parse(JSON.stringify(entry)),
      highlightedWords,
    });
  } catch (error) {
    console.error("POST journal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
