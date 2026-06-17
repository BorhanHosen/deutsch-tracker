import mongoose, { Document, Schema } from "mongoose";

export interface ISentenceDocument extends Document {
  userId: mongoose.Types.ObjectId;
  german: string;
  english: string;
  bangla: string;
  category: string;
  difficulty: string;
  notes: string;
  wordsUsed: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SentenceSchema = new Schema<ISentenceDocument>(
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
    wordsUsed: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

SentenceSchema.index({ userId: 1, createdAt: -1 });

const Sentence =
  mongoose.models.Sentence ||
  mongoose.model<ISentenceDocument>("Sentence", SentenceSchema);

export default Sentence;
