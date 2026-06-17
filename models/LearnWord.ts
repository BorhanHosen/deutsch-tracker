import mongoose, { Document, Schema } from "mongoose";

export interface ILearnWordDocument extends Document {
  order: number;
  german: string;
  ipa: string;
  english: string;
  bangla: string;
  category: string;
  difficulty: string;
  tags: string[];
  notes: string;
  exampleSentence: string;
  exampleEnglish: string;
  createdAt: Date;
}

const LearnWordSchema = new Schema<ILearnWordDocument>(
  {
    order: {
      type: Number,
      required: true,
      unique: true,
    },
    german: {
      type: String,
      required: true,
      trim: true,
    },
    ipa: {
      type: String,
      default: "",
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
      default: "Daily Life",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    exampleSentence: {
      type: String,
      default: "",
      trim: true,
    },
    exampleEnglish: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

LearnWordSchema.index({ order: 1 });
LearnWordSchema.index({ difficulty: 1 });
LearnWordSchema.index({ category: 1 });

const LearnWord =
  mongoose.models.LearnWord ||
  mongoose.model<ILearnWordDocument>("LearnWord", LearnWordSchema);

export default LearnWord;
