import mongoose, { Document, Schema } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  image: string;
  level: string;
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
  badges: string[];
  weeklyGoal: number;
  monthlyGoal: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    level: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      default: "A1",
    },
    xp: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    badges: {
      type: [String],
      default: [],
    },
    weeklyGoal: {
      type: Number,
      default: 35,
    },
    monthlyGoal: {
      type: Number,
      default: 150,
    },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 });

const User =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
