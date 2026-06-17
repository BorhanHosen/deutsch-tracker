import mongoose, { Document, Schema } from "mongoose";

export interface ITaskDocument extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: string;
  type: string;
  title: string;
  description: string;
  targetCount: number;
  completedCount: number;
  status: string;
  dueDate: Date;
  completedAt: Date | null;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["learn_words", "write_sentences", "review", "real_life", "quiz"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    targetCount: {
      type: Number,
      default: 1,
    },
    completedCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "overdue"],
      default: "pending",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    xpReward: {
      type: Number,
      default: 25,
    },
  },
  { timestamps: true },
);

TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });

const Task =
  mongoose.models.Task || mongoose.model<ITaskDocument>("Task", TaskSchema);

export default Task;
