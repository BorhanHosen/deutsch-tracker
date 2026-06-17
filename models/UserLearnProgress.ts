import mongoose, { Document, Schema } from "mongoose";

export interface IUserLearnProgressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  wordId: mongoose.Types.ObjectId;
  batchNumber: number;
  learnedAt: Date;
  createdAt: Date;
}

const UserLearnProgressSchema = new Schema<IUserLearnProgressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wordId: {
      type: Schema.Types.ObjectId,
      ref: "LearnWord",
      required: true,
    },
    batchNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    learnedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true },
);

// Prevent duplicate entries
UserLearnProgressSchema.index({ userId: 1, wordId: 1 }, { unique: true });

UserLearnProgressSchema.index({
  userId: 1,
  batchNumber: 1,
});

const UserLearnProgress =
  mongoose.models.UserLearnProgress ||
  mongoose.model<IUserLearnProgressDocument>(
    "UserLearnProgress",
    UserLearnProgressSchema,
  );

export default UserLearnProgress;
