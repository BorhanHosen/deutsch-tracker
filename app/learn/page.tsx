"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Eye,
  ChevronLeft,
  ChevronRight,
  Settings2,
  LogIn,
  Loader2,
  Star,
  BookOpen,
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

export default function LearnPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;

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

  // All unlearned words fetched from server
  // (large batch, filtered client-side)
  const [allUnlearnedWords, setAllUnlearnedWords] = useState<LearnWord[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [seeded, setSeeded] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [loginModal, setLoginModal] = useState<{
    open: boolean;
    reason: "vocabulary" | "progress" | "sync";
  }>({ open: false, reason: "vocabulary" });

  // Track initial learned IDs at load time
  // so we don't re-fetch when new ones are added
  const initialLearnedRef = useRef<Set<string>>(new Set());
  const hasFetchedRef = useRef(false);

  // Init from localStorage
  useEffect(() => {
    if (initialized) {
      setCurrentPage(getStoredPage());
      setLimit(getStoredLimit());
      initialLearnedRef.current = new Set(allLearnedIds);
    }
  }, [initialized]);

  // ✅ Fetch ALL words in ONE request (no batching loop)
  const fetchAllWords = useCallback(async () => {
    if (!initialized || hasFetchedRef.current) return;

    setLoading(true);
    try {
      const res = await fetch("/api/learn/public/all");
      const data = await res.json();

      if (!res.ok || !data.seeded) {
        setSeeded(false);
        setLoading(false);
        return;
      }

      setSeeded(true);
      setTotalAvailable(data.total || 0);

      // Filter out already-learned words
      const learnedSet = new Set(allLearnedIds);
      const unlearned = (data.words as LearnWord[]).filter(
        (w) => !learnedSet.has(w._id),
      );

      setAllUnlearnedWords(unlearned);
      hasFetchedRef.current = true;
    } catch {
      toast.error("Failed to load words");
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  useEffect(() => {
    if (initialized && !hasFetchedRef.current) {
      fetchAllWords();
    }
  }, [initialized, fetchAllWords]);

  // Sync to MongoDB after login
  useEffect(() => {
    if (
      isLoggedIn &&
      initialized &&
      allLearnedIds.length > 0 &&
      !synced &&
      status === "authenticated"
    ) {
      syncProgress();
    }
  }, [isLoggedIn, initialized, status]);

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
      // Silent
    } finally {
      setSyncing(false);
    }
  };

  // ✅ Mark learned: remove from local state immediately
  const handleMarkLearned = useCallback(
    (wordId: string) => {
      // Remove from local unlearned list
      setAllUnlearnedWords((prev) => prev.filter((w) => w._id !== wordId));
      // Save to localStorage
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
    },
    [markLearned, isLoggedIn, learnedCount],
  );

  const handleAddToVocabulary = useCallback(
    (word: LearnWord) => {
      if (!isLoggedIn) {
        setLoginModal({
          open: true,
          reason: "vocabulary",
        });
        return;
      }
      addWordToVocabulary(word);
    },
    [isLoggedIn],
  );

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

  // ✅ Paginate unlearned words client-side
  const totalUnlearned = allUnlearnedWords.length;
  const totalPages = Math.max(1, Math.ceil(totalUnlearned / limit));

  // Clamp page
  const safePage = Math.min(currentPage, totalPages);

  const pageWords = allUnlearnedWords.slice(
    (safePage - 1) * limit,
    safePage * limit,
  );

  // Pagination component
  const PaginationBar = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage === 1}
            onClick={() => handlePageChange(safePage - 1)}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>

          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            const isActive = safePage === page;
            const showPage =
              page === 1 ||
              page === totalPages ||
              Math.abs(page - safePage) <= 2;
            const showDots =
              (page === 2 && safePage > 4) ||
              (page === totalPages - 1 && safePage < totalPages - 3);

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
            disabled={safePage === totalPages}
            onClick={() => handlePageChange(safePage + 1)}
            className="gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>
            Page {safePage} of {totalPages}
          </span>
          <span>·</span>
          <button
            onClick={() => handlePageChange(1)}
            disabled={safePage === 1}
            className="hover:text-foreground disabled:opacity-40 transition-colors"
          >
            First
          </button>
          <span>·</span>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={safePage === totalPages}
            className="hover:text-foreground disabled:opacity-40 transition-colors"
          >
            Last
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Public header */}
      {!isLoggedIn && (
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                D
              </div>
              <span className="font-bold hidden sm:block">DeutschTracker</span>
            </div>

            <div className="flex items-center gap-2">
              {syncing && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
              )}
              {learnedCount > 0 && (
                <Link href="/learn/review">
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
              Learn German
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {loading
                ? "Loading..."
                : `${totalUnlearned} words remaining · ${learnedCount} learned`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isLoggedIn && learnedCount > 0 && (
              <Link href="/learn/review">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Review ({learnedCount})
                </Button>
              </Link>
            )}

            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">
                Per page:
              </span>
              <Select
                value={limit.toString()}
                onValueChange={(v) => handleLimitChange(parseInt(v))}
              >
                <SelectTrigger className="w-24 h-9">
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

        {/* Progress */}
        {totalAvailable > 0 && learnedCount > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-medium flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Progress
                </span>
                <span className="text-muted-foreground">
                  {learnedCount}/{totalAvailable} (
                  {Math.round((learnedCount / totalAvailable) * 100)}
                  %)
                </span>
              </div>
              <Progress
                value={(learnedCount / totalAvailable) * 100}
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
          <div className="text-center py-16">
            <BookOpen className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold">Words not loaded</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Please seed the database first.
            </p>
          </div>
        )}

        {/* All done */}
        {!loading && seeded && totalUnlearned === 0 && learnedCount > 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="text-5xl">🏆</div>
            <h3 className="text-xl font-bold">All words learned!</h3>
            <p className="text-muted-foreground">
              You learned all {learnedCount} words!
            </p>
            <Link href="/learn/review">
              <Button className="gap-2">
                <Eye className="w-4 h-4" />
                Review All Words
              </Button>
            </Link>
          </div>
        )}

        {/* Loading */}
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

        {/* ✅ Pagination TOP */}
        {!loading && seeded && totalUnlearned > 0 && (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Words {(safePage - 1) * limit + 1}–
                {Math.min(safePage * limit, totalUnlearned)} of {totalUnlearned}{" "}
                remaining
              </span>
              <span>
                Page {safePage}/{totalPages}
              </span>
            </div>

            <PaginationBar />
          </>
        )}

        {/* ✅ Word cards — only current page */}
        {!loading && seeded && pageWords.length > 0 && (
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {pageWords.map((word) => (
                <PublicWordCard
                  key={word._id}
                  word={word}
                  isLearned={false}
                  onMarkLearned={handleMarkLearned}
                  onUnmarkLearned={unmarkLearned}
                  onAddToVocabulary={handleAddToVocabulary}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ✅ Pagination BOTTOM */}
        {!loading && seeded && totalUnlearned > 0 && <PaginationBar />}

        {/* Guest banner */}
        {!isLoggedIn && seeded && !loading && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    🚀 Want full features?
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Login free for vocabulary tracker, quiz, flashcards and
                    more.
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
                  className="gap-1.5 shrink-0"
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
