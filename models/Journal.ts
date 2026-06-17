import mongoose, { Document, Schema } from "mongoose";

export interface IJournalDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  highlightedWords: string[];
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournalDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Journal Entry",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    highlightedWords: {
      type: [String],
      default: [],
    },
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

JournalSchema.index({ userId: 1, createdAt: -1 });

const Journal =
  mongoose.models.Journal ||
  mongoose.model<IJournalDocument>("Journal", JournalSchema);

export default Journal;
