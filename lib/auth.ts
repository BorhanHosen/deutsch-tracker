import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "./mongodb";

async function getOrCreateUser(name: string, email: string, image: string) {
  const { default: User } = await import("@/models/User");
  await connectDB();

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image,
      level: "A1",
      xp: 0,
      streak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      badges: [],
      weeklyGoal: 35,
      monthlyGoal: 150,
    });
    console.log("✅ New user created:", email);
  }

  return user;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user && user.email) {
        try {
          const dbUser = await getOrCreateUser(
            user.name || "Learner",
            user.email,
            user.image || "",
          );
          token.dbId = dbUser._id.toString();
          token.level = dbUser.level;
          token.xp = dbUser.xp;
          token.streak = dbUser.streak;
          token.badges = dbUser.badges;
        } catch (err) {
          console.error("JWT callback error:", err);
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = (token.dbId as string) || "";
      session.user.level = (token.level as string) || "A1";
      session.user.xp = (token.xp as number) || 0;
      session.user.streak = (token.streak as number) || 0;
      session.user.badges = (token.badges as string[]) || [];
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};
