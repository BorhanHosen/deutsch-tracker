"use client";

import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: "vocabulary" | "progress" | "sync";
  learnedCount?: number;
}

const reasons = {
  vocabulary: {
    title: "Save to Your Vocabulary",
    description:
      "Create a free account to save words to your personal vocabulary list and track your progress.",
    icon: BookOpen,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  progress: {
    title: "Save Your Progress",
    description:
      "Create a free account to save your learning progress permanently across all devices.",
    icon: Star,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  sync: {
    title: "Sync Your Progress",
    description:
      "Login to sync your learned words to your account so you never lose your progress.",
    icon: Trophy,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
};

export function LoginPromptModal({
  isOpen,
  onClose,
  reason = "vocabulary",
  learnedCount = 0,
}: LoginPromptModalProps) {
  const config = reasons[reason];
  const Icon = config.icon;

  const handleLogin = () => {
    signIn("google", {
      callbackUrl: "/dashboard",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 20,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl ${config.bg} flex items-center justify-center mx-auto mb-4`}
              >
                <Icon className={`w-7 h-7 ${config.color}`} />
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-center text-foreground mb-2">
                {config.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-muted-foreground text-center mb-4">
                {config.description}
              </p>

              {/* Learned count badge */}
              {learnedCount > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 text-center">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    🎉 You have learned {learnedCount} word
                    {learnedCount !== 1 ? "s" : ""} so far!
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Login to save them permanently
                  </p>
                </div>
              )}

              {/* Benefits */}
              <div className="space-y-2 mb-6">
                {[
                  "Track vocabulary with spaced repetition",
                  "Earn XP and badges for learning",
                  "Access quiz, flashcards and games",
                  "Sync across all your devices",
                ].map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Button onClick={handleLogin} className="w-full h-11 gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#fff"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#fff"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#fff"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#fff"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google — It's Free
                </Button>

                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full text-muted-foreground"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
