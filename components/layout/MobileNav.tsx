"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Brain,
  BarChart3,
  MoreHorizontal,
  PenLine,
  CreditCard,
  Gamepad2,
  GraduationCap,
  NotebookPen,
  MessageSquare,
  User,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryNav = [
  {
    label: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  // ✅ Add this
  {
    label: "Learn",
    href: "/learn",
    icon: GraduationCap,
  },
  {
    label: "Words",
    href: "/vocabulary",
    icon: BookOpen,
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
    label: "Stats",
    href: "/stats",
    icon: BarChart3,
  },
];

const secondaryNav = [
  {
    label: "Sentences",
    href: "/sentences",
    icon: PenLine,
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

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* More Drawer */}
      <AnimatePresence>
        {showMore && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setShowMore(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="fixed bottom-16 left-0 right-0 bg-card border-t border-border rounded-t-2xl z-50 lg:hidden p-4"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-muted-foreground">
                  More Pages
                </p>
                <button
                  onClick={() => setShowMore(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {secondaryNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-primary/10",
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-center leading-tight">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-40 lg:hidden">
        <div className="flex h-full items-center justify-around px-1">
          {primaryNav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all min-w-0 flex-1",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="mobileActive"
                      className="absolute inset-0 bg-primary/10 rounded-lg -m-1"
                    />
                  )}
                  <item.icon className="w-5 h-5 relative z-10" />
                </div>
                <span className="text-[10px] font-medium leading-none truncate w-full text-center">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all flex-1",
              showMore ? "text-primary" : "text-muted-foreground",
            )}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
