import { NextResponse } from "next/server";
import { getAllLearnWords } from "@/lib/learn-words-cache";

export async function GET() {
  try {
    const words = await getAllLearnWords();

    return NextResponse.json(
      {
        words,
        total: words.length,
        seeded: words.length > 0,
      },
      {
        headers: {
          // Allow CDN/browser to cache briefly too
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("GET learn public all error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
