"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Eye,
  ChevronLeft,
  ChevronRight,
  Settings2,
  LogIn,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublicWordCard } from "@/components/learn/PublicWordCard";
import { LoginPromptModal } from "@/components/learn/LoginPromptModal";
import { useLearnStorage } from "@/hooks/useLearnStorage";
import { dispatchXPUpdate } from "@/lib/xp-event";
import { toast } from "sonner";
import Link from "next/link";

interface LearnWord {
  _id: string;
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
}

const LIMIT_OPTIONS = [
  { value: 5, label: "5 words" },
  { value: 10, label: "10 words" },
  { value: 20, label: "20 words" },
  { value: 50, label: "50 words" },
];

interface LearnPageClientProps {
  isLoggedIn: boolean;
  userName: string;
}

export function LearnPageClient({
  isLoggedIn,
  userName,
}: LearnPageClientProps) {
  const [words, setWords] = useState<LearnWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [seeded, setSeeded] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [loginModal, setLoginModal] = useState<{
    open: boolean;
    reason: "vocabulary" | "progress" | "sync";
  }>({ open: false, reason: "vocabulary" });

  const {
    learnedCount,
    markLearned,
    unmarkLearned,
    isLearned,
    allLearnedIds,
    initialized,
    getStoredPage,
    setStoredPage,
    getStoredLimit,
    setStoredLimit,
  } = useLearnStorage();

  // Init from localStorage
  useEffect(() => {
    if (initialized) {
      setCurrentPage(getStoredPage());
      setLimit(getStoredLimit());
    }
  }, [initialized, getStoredPage, getStoredLimit]);

  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      const res = await fetch(`/api/learn/public?${params}`);
      const data = await res.json();
      if (res.ok) {
        setWords(data.words);
        setTotal(data.total);
        setPages(data.pages);
        setSeeded(data.seeded);
      } else {
        toast.error("Failed to load words");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    if (initialized) fetchWords();
  }, [fetchWords, initialized]);

  // Sync to MongoDB after login
  useEffect(() => {
    if (isLoggedIn && initialized && allLearnedIds.length > 0 && !synced) {
      syncProgress();
    }
  }, [isLoggedIn, initialized]);

  const syncProgress = async () => {
    if (syncing || synced || allLearnedIds.length === 0) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/learn/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordIds: allLearnedIds,
        }),
      });
      const data = await res.json();
      if (res.ok && data.synced > 0) {
        toast.success(`✅ ${data.message}`, {
          duration: 5000,
        });
        dispatchXPUpdate();
        setSynced(true);
      }
    } catch {
      // Silent fail
    } finally {
      setSyncing(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setStoredPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setStoredLimit(newLimit);
    setCurrentPage(1);
    setStoredPage(1);
  };

  const handleMarkLearned = (wordId: string) => {
    markLearned(wordId);
    toast.success("Moved to Review! ✓", {
      duration: 2000,
    });
    if (!isLoggedIn && (learnedCount + 1) % 5 === 0) {
      setTimeout(() => {
        setLoginModal({
          open: true,
          reason: "progress",
        });
      }, 800);
    }
  };

  const handleAddToVocabulary = (word: LearnWord) => {
    if (!isLoggedIn) {
      setLoginModal({
        open: true,
        reason: "vocabulary",
      });
      return;
    }
    addWordToVocabulary(word);
  };

  const addWordToVocabulary = async (word: LearnWord) => {
    try {
      const res = await fetch("/api/learn/add-to-vocabulary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          german: word.german,
          english: word.english,
          bangla: word.bangla,
          pronunciation: word.ipa,
          category: word.category,
          difficulty: word.difficulty,
          tags: word.tags,
          notes: word.notes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.isExisting) {
          toast.info(`"${word.german}" already in vocabulary`);
        } else {
          toast.success(`"${word.german}" added! +${data.xpEarned} XP`);
          dispatchXPUpdate();
        }
      } else {
        toast.error(data.error || "Failed to add");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const unlearnedOnPage = words.filter((w) => !isLearned(w._id)).length;

  // Pagination component
  const Pagination = () => (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Button>

        {Array.from({ length: pages }).map((_, i) => {
          const page = i + 1;
          const isActive = currentPage === page;
          const showPage =
            page === 1 || page === pages || Math.abs(page - currentPage) <= 2;
          const showDots =
            (page === 2 && currentPage > 4) ||
            (page === pages - 1 && currentPage < pages - 3);

          if (showDots) {
            return (
              <span key={page} className="text-muted-foreground px-1">
                ...
              </span>
            );
          }
          if (!showPage) return null;

          return (
            <Button
              key={page}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="w-9 h-9"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === pages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span>
          Page {currentPage} of {pages}
        </span>
        <span>·</span>
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="hover:text-foreground transition-colors disabled:opacity-40"
        >
          First
        </button>
        <span>·</span>
        <button
          onClick={() => handlePageChange(pages)}
          disabled={currentPage === pages}
          className="hover:text-foreground transition-colors disabled:opacity-40"
        >
          Last
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Public header — only when NOT logged in */}
      {!isLoggedIn && (
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                D
              </div>
              <span className="font-bold hidden sm:block">DeutschTracker</span>
            </div>

            <div className="flex items-center gap-2">
              {syncing && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Syncing...
                </span>
              )}

              {learnedCount > 0 && (
                <Link href="/review">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Review</span>
                    <Badge
                      variant="secondary"
                      className="h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                    >
                      {learnedCount}
                    </Badge>
                  </Button>
                </Link>
              )}

              <Button
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  setLoginModal({
                    open: true,
                    reason: "progress",
                  })
                }
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Login Free</span>
                <span className="sm:hidden">Login</span>
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <div
        className={
          isLoggedIn
            ? "space-y-6 max-w-4xl mx-auto"
            : "max-w-4xl mx-auto px-4 py-6 space-y-6"
        }
      >
        {/* Title + Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              {isLoggedIn
                ? `Guten Tag, ${userName.split(" ")[0]}! 👋`
                : "Learn German — Free"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {total > 0
                ? `${total} words available · ${learnedCount} learned`
                : "Browse German vocabulary for free"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn && (
              <Link href="/review">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Review
                  {learnedCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                    >
                      {learnedCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <Select
                value={limit.toString()}
                onValueChange={(v) => handleLimitChange(parseInt(v))}
              >
                <SelectTrigger className="w-28 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIMIT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {total > 0 && learnedCount > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-medium flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Progress
                </span>
                <span className="text-muted-foreground">
                  {learnedCount}/{total} (
                  {Math.round((learnedCount / total) * 100)}
                  %)
                </span>
              </div>
              <Progress
                value={(learnedCount / total) * 100}
                className="h-2.5"
              />
              {!isLoggedIn && (
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Stored locally.{" "}
                  <button
                    onClick={() =>
                      setLoginModal({
                        open: true,
                        reason: "progress",
                      })
                    }
                    className="text-primary hover:underline"
                  >
                    Login to save permanently
                  </button>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Not seeded */}
        {!seeded && !loading && (
          <div className="text-center py-16 space-y-4">
            <BookOpen className="w-14 h-14 mx-auto text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">Words not loaded yet</h3>
            <p className="text-muted-foreground text-sm">
              Please ask the admin to seed the words first.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-muted rounded-xl animate-pulse"
                style={{
                  animationDelay: `${i * 60}ms`,
                }}
              />
            ))}
          </div>
        )}

        {/* Words */}
        {!loading && seeded && (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Words {(currentPage - 1) * limit + 1}–
                {Math.min(currentPage * limit, total)} of {total}
              </span>
              {unlearnedOnPage === 0 && words.length > 0 && (
                <span className="text-green-600 font-medium">
                  ✓ All learned on this page!
                </span>
              )}
            </div>

            <motion.div layout className="space-y-4">
              <AnimatePresence mode="popLayout">
                {words.map((word) => (
                  <PublicWordCard
                    key={word._id}
                    word={word}
                    isLearned={isLearned(word._id)}
                    onMarkLearned={handleMarkLearned}
                    onUnmarkLearned={unmarkLearned}
                    onAddToVocabulary={handleAddToVocabulary}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {pages > 1 && <Pagination />}
          </>
        )}

        {/* Guest banner */}
        {!isLoggedIn && total > 0 && !loading && (
          <Card className="border-primary/20 bg-primary/5 mt-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    🚀 Want to track your progress?
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Login free to access vocabulary tracker, quiz, flashcards,
                    games and more.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    setLoginModal({
                      open: true,
                      reason: "progress",
                    })
                  }
                  className="shrink-0 gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login Free
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <LoginPromptModal
        isOpen={loginModal.open}
        onClose={() =>
          setLoginModal((p) => ({
            ...p,
            open: false,
          }))
        }
        reason={loginModal.reason}
        learnedCount={learnedCount}
      />
    </>
  );
}
