import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LearnWord from "@/models/LearnWord";
import learnWordsData from "@/data/learn-words.json";

export async function POST() {
  try {
    await connectDB();

    // Check if already seeded
    const existing = await LearnWord.countDocuments();
    if (existing > 0) {
      return NextResponse.json({
        message: `Already seeded. ${existing} words in database.`,
        count: existing,
      });
    }

    // Insert all words
    await LearnWord.insertMany(learnWordsData);

    const count = await LearnWord.countDocuments();

    return NextResponse.json({
      message: `Successfully seeded ${count} words!`,
      count,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}

// Force reseed
export async function DELETE() {
  try {
    await connectDB();
    await LearnWord.deleteMany({});
    await LearnWord.insertMany(learnWordsData);
    const count = await LearnWord.countDocuments();
    return NextResponse.json({
      message: `Reseeded ${count} words!`,
      count,
    });
  } catch (error) {
    console.error("Reseed error:", error);
    return NextResponse.json({ error: "Reseed failed" }, { status: 500 });
  }
}
