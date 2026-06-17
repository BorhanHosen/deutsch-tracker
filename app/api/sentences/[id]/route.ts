import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Sentence from "@/models/Sentence";
import User from "@/models/User";

export async function PUT(
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
    const body = await request.json();

    const sentence = await Sentence.findOneAndUpdate(
      { _id: id, userId: dbUser._id },
      { ...body },
      { new: true },
    );

    if (!sentence) {
      return NextResponse.json(
        { error: "Sentence not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      sentence: JSON.parse(JSON.stringify(sentence)),
    });
  } catch (error) {
    console.error("PUT sentence error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    const sentence = await Sentence.findOneAndDelete({
      _id: id,
      userId: dbUser._id,
    });

    if (!sentence) {
      return NextResponse.json(
        { error: "Sentence not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Sentence deleted",
    });
  } catch (error) {
    console.error("DELETE sentence error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
