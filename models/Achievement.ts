import mongoose, { Document, Schema } from "mongoose";

export interface IAchievementDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  createdAt: Date;
}

export const ACHIEVEMENTS_META: Record<
  string,
  { title: string; description: string; icon: string }
> = {
  first_word: {
    title: "First Word!",
    description: "Added your first German word",
    icon: "🎉",
  },
  week_warrior: {
    title: "Week Warrior",
    description: "Maintained a 7-day streak",
    icon: "🔥",
  },
  century_club: {
    title: "Century Club",
    description: "Learned 100 unique words",
    icon: "💯",
  },
  sentence_master: {
    title: "Sentence Master",
    description: "Wrote 50 German sentences",
    icon: "✍️",
  },
  quiz_champion: {
    title: "Quiz Champion",
    description: "Completed a perfect quiz",
    icon: "🏆",
  },
  night_owl: {
    title: "Night Owl",
    description: "Added a word after 10 PM",
    icon: "🦉",
  },
  early_bird: {
    title: "Early Bird",
    description: "Added a word before 7 AM",
    icon: "🐦",
  },
  streak_30: {
    title: "Month Master",
    description: "Maintained a 30-day streak",
    icon: "📅",
  },
  vocab_500: {
    title: "Vocabulary King",
    description: "Learned 500 unique words",
    icon: "👑",
  },
};

const AchievementSchema = new Schema<IAchievementDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
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
    icon: {
      type: String,
      default: "🏅",
    },
    earnedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true },
);

AchievementSchema.index({ userId: 1, type: 1 }, { unique: true });

const Achievement =
  mongoose.models.Achievement ||
  mongoose.model<IAchievementDocument>("Achievement", AchievementSchema);

export default Achievement;
