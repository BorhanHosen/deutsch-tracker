import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LearnWord from "@/models/LearnWord";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    // Validate limit
    const validLimits = [5, 10, 20, 50];
    const safeLimit = validLimits.includes(limit) ? limit : 5;

    const skip = (page - 1) * safeLimit;

    const totalWords = await LearnWord.countDocuments();

    if (totalWords === 0) {
      return NextResponse.json({
        words: [],
        total: 0,
        pages: 0,
        currentPage: page,
        limit: safeLimit,
        seeded: false,
      });
    }

    const words = await LearnWord.find()
      .sort({ order: 1 })
      .skip(skip)
      .limit(safeLimit)
      .lean();

    return NextResponse.json({
      words: JSON.parse(JSON.stringify(words)),
      total: totalWords,
      pages: Math.ceil(totalWords / safeLimit),
      currentPage: page,
      limit: safeLimit,
      seeded: true,
    });
  } catch (error) {
    console.error("GET public learn error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
