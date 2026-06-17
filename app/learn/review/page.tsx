"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Search,
  Volume2,
  Tag,
  RotateCcw,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoginPromptModal } from "@/components/learn/LoginPromptModal";
import { useLearnStorage } from "@/hooks/useLearnStorage";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ReviewWord {
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
  { value: 5, label: "5 per page" },
  { value: 10, label: "10 per page" },
  { value: 20, label: "20 per page" },
  { value: 50, label: "50 per page" },
];

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};

function ReviewWordCard({
  word,
  onUnlearn,
}: {
  word: ReviewWord;
  onUnlearn: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [speakingWord, setSpeakingWord] = useState(false);
  const [speakingSentence, setSpeakingSentence] = useState(false);

  const speak = (text: string, type: "word" | "sentence") => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = type === "word" ? 0.8 : 0.85;
    if (type === "word") {
      setSpeakingWord(true);
      u.onend = () => setSpeakingWord(false);
      u.onerror = () => setSpeakingWord(false);
    } else {
      setSpeakingSentence(true);
      u.onend = () => setSpeakingSentence(false);
      u.onerror = () => setSpeakingSentence(false);
    }
    window.speechSynthesis.speak(u);
  };

  return (
    <Card className="hover:border-primary/30 transition-all">
      <CardContent className="p-4">
        {/* Top */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-primary">{word.german}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => speak(word.german, "word")}
                disabled={speakingWord}
              >
                <Volume2
                  className={cn(
                    "w-3.5 h-3.5",
                    speakingWord
                      ? "text-primary animate-pulse"
                      : "text-muted-foreground",
                  )}
                />
              </Button>
              {word.ipa && (
                <span className="text-xs text-muted-foreground font-mono">
                  /{word.ipa}/
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground mt-0.5">
              {word.english}
            </p>
            {word.bangla && (
              <p className="text-xs text-muted-foreground">{word.bangla}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge
              variant="outline"
              className={`text-xs ${difficultyColor[word.difficulty]}`}
            >
              {word.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              #{word.order}
            </Badge>
          </div>
        </div>

        {/* Category + Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline" className="text-xs">
            {word.category}
          </Badge>
          {word.tags &&
            word.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full"
              >
                <Tag className="w-2 h-2" />
                {tag}
              </span>
            ))}
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors"
        >
          <BookOpen className="w-3 h-3" />
          {expanded ? "Hide details" : "Show notes & example"}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              {word.notes && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    💡 {word.notes}
                  </p>
                </div>
              )}

              {word.exampleSentence && (
                <div className="bg-secondary/50 border border-border rounded-lg p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Example Sentence
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        {word.exampleSentence}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {word.exampleEnglish}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => speak(word.exampleSentence, "sentence")}
                      disabled={speakingSentence}
                    >
                      <Volume2
                        className={cn(
                          "w-3.5 h-3.5",
                          speakingSentence
                            ? "text-primary animate-pulse"
                            : "text-muted-foreground",
                        )}
                      />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-green-600 font-medium">✓ Learned</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUnlearn(word._id)}
            className="text-xs text-muted-foreground gap-1 h-7"
          >
            <RotateCcw className="w-3 h-3" />
            Move back to Learn
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReviewPage() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const {
    learnedIds,
    learnedCount,
    unmarkLearned,
    initialized,
    getStoredLimit,
    setStoredLimit,
  } = useLearnStorage();

  // All learned words fetched from API
  const [allWords, setAllWords] = useState<ReviewWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loginModal, setLoginModal] = useState(false);

  // Init limit
  useEffect(() => {
    if (initialized) {
      setLimit(getStoredLimit());
    }
  }, [initialized, getStoredLimit]);

  // Fetch ALL words then filter to learned ones
  const fetchLearnedWords = useCallback(async () => {
    if (!initialized) return;

    const ids = Array.from(learnedIds);
    if (ids.length === 0) {
      setAllWords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch all words in batches
      const allFetched: ReviewWord[] = [];
      let page = 1;
      const batchSize = 100;

      while (true) {
        const res = await fetch(
          `/api/learn/public?page=${page}&limit=${batchSize}`,
        );
        const data = await res.json();

        if (!res.ok || !data.words || data.words.length === 0) break;

        allFetched.push(...data.words);

        if (page >= data.pages) break;
        page++;
      }

      // Filter to only learned words
      const learnedWords = allFetched
        .filter((w) => ids.includes(w._id))
        .sort((a, b) => a.order - b.order);

      setAllWords(learnedWords);
    } catch {
      toast.error("Failed to load words");
    } finally {
      setLoading(false);
    }
  }, [learnedIds, initialized]);

  useEffect(() => {
    fetchLearnedWords();
  }, [fetchLearnedWords]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleUnlearn = (wordId: string) => {
    unmarkLearned(wordId);
    toast.success("Moved back to Learn");
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setStoredLimit(newLimit);
    setCurrentPage(1);
  };

  // Filter by search
  const filteredWords = allWords.filter(
    (w) =>
      search === "" ||
      w.german.toLowerCase().includes(search.toLowerCase()) ||
      w.english.toLowerCase().includes(search.toLowerCase()) ||
      w.bangla.toLowerCase().includes(search.toLowerCase()),
  );

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filteredWords.length / limit));
  const paginatedWords = filteredWords.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const PaginationBar = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="space-y-3">
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

          {Array.from({
            length: totalPages,
          }).map((_, i) => {
            const page = i + 1;
            const isActive = currentPage === page;
            const showPage =
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 2;
            const showDots =
              (page === 2 && currentPage > 4) ||
              (page === totalPages - 1 && currentPage < totalPages - 3);

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
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <span>·</span>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="hover:text-foreground disabled:opacity-40"
          >
            First
          </button>
          <span>·</span>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="hover:text-foreground disabled:opacity-40"
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
            <div className="flex items-center gap-3">
              <Link href="/learn">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-base">Review</h1>
                <p className="text-xs text-muted-foreground">
                  {learnedCount} learned
                </p>
              </div>
            </div>

            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setLoginModal(true)}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save Progress</span>
              <span className="sm:hidden">Login</span>
            </Button>
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
        {/* Logged-in page header */}
        {isLoggedIn && (
          <div className="flex items-center gap-3">
            <Link href="/learn">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Review</h1>
              <p className="text-muted-foreground text-sm">
                {learnedCount} word
                {learnedCount !== 1 ? "s" : ""} learned
              </p>
            </div>
            <Link href="/learn">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Learn
              </Button>
            </Link>
          </div>
        )}

        {/* Guest warning */}
        {!isLoggedIn && learnedCount > 0 && (
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                ⚠️ Progress saved in this browser only.
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <button
                  onClick={() => setLoginModal(true)}
                  className="text-primary hover:underline"
                >
                  Login free
                </button>{" "}
                to save permanently.
              </p>
            </CardContent>
          </Card>
        )}

        {/* ✅ CONTROLS AT TOP */}
        {learnedCount > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search learned words..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>

            {/* Limit selector */}
            <div className="flex items-center gap-2 shrink-0">
              <Settings2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Per page:
              </span>
              <Select
                value={limit.toString()}
                onValueChange={(v) => handleLimitChange(parseInt(v))}
              >
                <SelectTrigger className="w-32 h-9">
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
        )}

        {/* Results info */}
        {!loading && filteredWords.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {search
                ? `${filteredWords.length} result${filteredWords.length !== 1 ? "s" : ""}`
                : `${filteredWords.length} word${filteredWords.length !== 1 ? "s" : ""} learned`}
            </span>
            <span>
              {(currentPage - 1) * limit + 1}–
              {Math.min(currentPage * limit, filteredWords.length)} of{" "}
              {filteredWords.length}
            </span>
          </div>
        )}

        {/* ✅ PAGINATION AT TOP */}
        {!loading && <PaginationBar />}

        {/* Empty state */}
        {!loading && learnedCount === 0 && (
          <div className="text-center py-16 space-y-4">
            <BookOpen className="w-14 h-14 mx-auto text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">No words reviewed yet</h3>
            <p className="text-muted-foreground text-sm">
              Go to Learn and click Learned to move words here
            </p>
            <Link href="/learn">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go to Learn
              </Button>
            </Link>
          </div>
        )}

        {/* Loading */}
        {loading && learnedCount > 0 && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Word list */}
        {!loading && paginatedWords.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence>
              {paginatedWords.map((word, i) => (
                <motion.div
                  key={word._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.03,
                  }}
                >
                  <ReviewWordCard word={word} onUnlearn={handleUnlearn} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* No search results */}
        {!loading &&
          search &&
          filteredWords.length === 0 &&
          learnedCount > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No words match &quot;{search}
                &quot;
              </p>
              <button
                onClick={() => setSearch("")}
                className="text-primary text-sm hover:underline mt-1"
              >
                Clear search
              </button>
            </div>
          )}

        {/* ✅ PAGINATION AT BOTTOM TOO */}
        {!loading && <PaginationBar />}
      </div>

      <LoginPromptModal
        isOpen={loginModal}
        onClose={() => setLoginModal(false)}
        reason="sync"
        learnedCount={learnedCount}
      />
    </>
  );
}
