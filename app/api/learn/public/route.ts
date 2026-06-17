import { NextRequest, NextResponse } from "next/server";
import { getAllLearnWords } from "@/lib/learn-words-cache";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    const validLimits = [5, 10, 20, 50, 100, 1000];
    const safeLimit = validLimits.includes(limit) ? limit : 5;

    const allWords = await getAllLearnWords();
    const total = allWords.length;

    if (total === 0) {
      return NextResponse.json({
        words: [],
        total: 0,
        pages: 0,
        currentPage: page,
        limit: safeLimit,
        seeded: false,
      });
    }

    const skip = (page - 1) * safeLimit;
    const words = allWords.slice(skip, skip + safeLimit);

    return NextResponse.json(
      {
        words,
        total,
        pages: Math.ceil(total / safeLimit),
        currentPage: page,
        limit: safeLimit,
        seeded: true,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("GET public learn error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
