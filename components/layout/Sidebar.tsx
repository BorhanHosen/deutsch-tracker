"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  PenLine,
  CheckSquare,
  Brain,
  CreditCard,
  Gamepad2,
  GraduationCap,
  BarChart3,
  NotebookPen,
  MessageSquare,
  User,
  Settings,
  Flame,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStats } from "@/hooks/useUserStats";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Learn",
    href: "/learn",
    icon: GraduationCap,
  },
  {
    label: "Vocabulary",
    href: "/vocabulary",
    icon: BookOpen,
  },
  {
    label: "Sentences",
    href: "/sentences",
    icon: PenLine,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Quiz",
    href: "/quiz",
    icon: Brain,
  },
  {
    label: "Flashcards",
    href: "/flashcards",
    icon: CreditCard,
  },
  {
    label: "Games",
    href: "/games",
    icon: Gamepad2,
  },
  {
    label: "Grammar",
    href: "/grammar",
    icon: GraduationCap,
  },
  {
    label: "Statistics",
    href: "/stats",
    icon: BarChart3,
  },
  {
    label: "Journal",
    href: "/journal",
    icon: NotebookPen,
  },
  {
    label: "Phrasebook",
    href: "/phrasebook",
    icon: MessageSquare,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const levelXPMap: Record<string, { min: number; max: number }> = {
  A1: { min: 0, max: 500 },
  A2: { min: 500, max: 1500 },
  B1: { min: 1500, max: 3000 },
  B2: { min: 3000, max: 5000 },
  C1: { min: 5000, max: 8000 },
  C2: { min: 8000, max: 10000 },
};

const levelColors: Record<string, string> = {
  A1: "text-green-500",
  A2: "text-blue-500",
  B1: "text-yellow-500",
  B2: "text-orange-500",
  C1: "text-purple-500",
  C2: "text-red-500",
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // ✅ Use live stats hook instead of session

  const { stats, xpProgress } = useUserStats();
  const level = stats.level || "A1";
  const xp = stats.xp || 0;
  const streak = stats.streak || 0;
  const levelData = levelXPMap[level] || {
    min: 0,
    max: 500,
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col bg-card border-r border-border z-40">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
            D
          </div>
          <div>
            <p className="font-bold text-base leading-none">Deutsch</p>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">
              Tracker
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary",
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Streak + Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">{streak} day streak</span>
          </div>
          <span
            className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-md bg-secondary",
              levelColors[level],
            )}
          >
            {level}
          </span>
        </div>

        {/* XP Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              {xpProgress.xpInLevel} / {xpProgress.xpForLevel} XP
            </span>
            {xpProgress.nextLevel && <span>→ {xpProgress.nextLevel}</span>}
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-yellow-500 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${xpProgress.percent}%`,
              }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
              }}
            />
          </div>
          {xpProgress.nextLevel && (
            <p className="text-xs text-muted-foreground text-right">
              {xpProgress.xpToNext} XP to {xpProgress.nextLevel}
            </p>
          )}
        </div>

        {/* Level badge — replace old one */}
        <span
          className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-md bg-secondary",
            levelColors[xpProgress.level],
          )}
        >
          {xpProgress.level}
        </span>
        {/* User Info */}
        <div className="flex items-center gap-2">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full border-2 border-border shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
              {session?.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email || ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
