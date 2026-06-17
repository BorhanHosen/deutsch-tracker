import mongoose, { Document, Schema } from "mongoose";

export interface IWordDocument extends Document {
  userId: mongoose.Types.ObjectId;
  german: string;
  english: string;
  bangla: string;
  pronunciation: string;
  category: string;
  difficulty: string;
  notes: string;
  frequency: number;
  quizScore: number;
  nextReviewDate: Date;
  reviewInterval: number;
  easeFactor: number;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WordSchema = new Schema<IWordDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    german: {
      type: String,
      required: true,
      trim: true,
    },
    english: {
      type: String,
      required: true,
      trim: true,
    },
    bangla: {
      type: String,
      default: "",
      trim: true,
    },
    pronunciation: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Food",
        "Travel",
        "Daily Life",
        "Family",
        "Shopping",
        "University",
        "Technology",
        "Other",
      ],
      default: "Other",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    frequency: {
      type: Number,
      default: 1,
    },
    quizScore: {
      type: Number,
      default: 0,
    },
    nextReviewDate: {
      type: Date,
      default: () => new Date(),
    },
    reviewInterval: {
      type: Number,
      default: 1,
    },
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    tags: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

WordSchema.index({ userId: 1, createdAt: -1 });
WordSchema.index({ userId: 1, category: 1 });
WordSchema.index({ userId: 1, german: 1 });

const Word =
  mongoose.models.Word || mongoose.model<IWordDocument>("Word", WordSchema);

export default Word;
