"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  RefreshCw,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Minus,
  CheckCircle2,
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
import { toast } from "sonner";
import { IWord } from "@/types";
import { cn } from "@/lib/utils";

type FlashcardState = "setup" | "front" | "back" | "done";

export default function FlashcardsPage() {
  const [fcState, setFcState] = useState<FlashcardState>("setup");
  const [mode, setMode] = useState("due");
  const [words, setWords] = useState<IWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<Record<string, number>>({});
  const [sessionStats, setSessionStats] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [flipped, setFlipped] = useState(false);

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0;

  const loadCards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/flashcards?mode=${mode}`);
      const data = await res.json();

      if (res.ok) {
        if (data.words.length === 0) {
          toast.info(
            mode === "due" ? "No cards due for review!" : "No cards found",
          );
          return;
        }
        setWords(data.words);
        setCurrentIndex(0);
        setFlipped(false);
        setRating({});
        setSessionStats({
          easy: 0,
          medium: 0,
          hard: 0,
        });
        setFcState("front");
      } else {
        toast.error(data.error || "Failed to load");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const speak = () => {
    if (!currentWord || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(currentWord.german);
    u.lang = "de-DE";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const handleRating = async (r: number) => {
    if (!currentWord) return;

    // Update session stats
    if (r >= 4) {
      setSessionStats((s) => ({
        ...s,
        easy: s.easy + 1,
      }));
    } else if (r === 3) {
      setSessionStats((s) => ({
        ...s,
        medium: s.medium + 1,
      }));
    } else {
      setSessionStats((s) => ({
        ...s,
        hard: s.hard + 1,
      }));
    }

    setRating((prev) => ({
      ...prev,
      [currentWord._id]: r,
    }));

    try {
      await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wordId: currentWord._id,
          rating: r,
        }),
      });
    } catch {
      // Silent fail - continue session
    }

    // Move to next card
    if (currentIndex + 1 >= words.length) {
      setFcState("done");
    } else {
      setCurrentIndex((i) => i + 1);
      setFlipped(false);
    }
  };

  // Setup Screen
  if (fcState === "setup") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review vocabulary with spaced repetition
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Review Mode</label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due">📅 Due for Review</SelectItem>
                  <SelectItem value="weak">
                    💪 Weak Words (under 50%)
                  </SelectItem>
                  <SelectItem value="all">📚 All Words</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium">How to rate cards:</p>
              <div className="space-y-1.5">
                {[
                  {
                    icon: "😰",
                    label: "Hard",
                    desc: "Review again in 1 day",
                    rating: 1,
                  },
                  {
                    icon: "🤔",
                    label: "Medium",
                    desc: "Review in 3 days",
                    rating: 3,
                  },
                  {
                    icon: "😊",
                    label: "Easy",
                    desc: "Review in 7+ days",
                    rating: 5,
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span>{r.icon}</span>
                    <span className="font-medium">{r.label}:</span>
                    <span className="text-muted-foreground">{r.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={loadCards}
              disabled={loading}
              className="w-full h-11"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <CreditCard className="w-4 h-4 mr-2" />
              )}
              {loading ? "Loading..." : "Start Review"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Done Screen
  if (fcState === "done") {
    const total = sessionStats.easy + sessionStats.medium + sessionStats.hard;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
              <p className="text-muted-foreground mb-6">
                You reviewed {total} cards
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-green-500/10 rounded-xl p-3">
                  <p className="text-2xl font-bold text-green-500">
                    {sessionStats.easy}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Easy 😊</p>
                </div>
                <div className="bg-yellow-500/10 rounded-xl p-3">
                  <p className="text-2xl font-bold text-yellow-500">
                    {sessionStats.medium}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Medium 🤔
                  </p>
                </div>
                <div className="bg-red-500/10 rounded-xl p-3">
                  <p className="text-2xl font-bold text-red-500">
                    {sessionStats.hard}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Hard 😰</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setFcState("setup");
                    setWords([]);
                  }}
                  className="flex-1 gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Review Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/vocabulary")}
                  className="flex-1"
                >
                  Vocabulary
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Card Screen
  if (!currentWord) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Card {currentIndex + 1} of {words.length}
          </span>
          <div className="flex gap-2 text-xs">
            <span className="text-green-500">{sessionStats.easy} easy</span>
            <span className="text-yellow-500">
              {sessionStats.medium} medium
            </span>
            <span className="text-red-500">{sessionStats.hard} hard</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            className="cursor-pointer"
            onClick={() => setFlipped(!flipped)}
          >
            <Card className="min-h-70 flex flex-col border-2 hover:border-primary/40 transition-colors">
              <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                {/* Category + Difficulty */}
                <div className="flex gap-2 mb-6">
                  <Badge variant="outline" className="text-xs">
                    {currentWord.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {currentWord.difficulty}
                  </Badge>
                </div>

                <AnimatePresence mode="wait">
                  {!flipped ? (
                    <motion.div
                      key="front"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        German
                      </p>
                      <div className="flex items-center gap-3 justify-center">
                        <h2 className="text-4xl font-bold text-primary">
                          {currentWord.german}
                        </h2>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            speak();
                          }}
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {currentWord.pronunciation && (
                        <p className="text-sm text-muted-foreground font-mono">
                          /{currentWord.pronunciation}/
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-4">
                        Tap to reveal answer
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3 w-full"
                    >
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        English
                      </p>
                      <h2 className="text-3xl font-bold text-foreground">
                        {currentWord.english}
                      </h2>
                      {currentWord.bangla && (
                        <p className="text-lg text-muted-foreground">
                          {currentWord.bangla}
                        </p>
                      )}
                      {currentWord.notes && (
                        <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2 mt-2">
                          {currentWord.notes}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rating Buttons - only show after flip */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="space-y-3"
          >
            <p className="text-sm text-center text-muted-foreground">
              How well did you know this?
            </p>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="border-red-500/30 hover:bg-red-500/10 hover:text-red-600 gap-2 h-12"
                onClick={() => handleRating(1)}
              >
                <ThumbsDown className="w-4 h-4" />
                Hard
              </Button>
              <Button
                variant="outline"
                className="border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-600 gap-2 h-12"
                onClick={() => handleRating(3)}
              >
                <Minus className="w-4 h-4" />
                Medium
              </Button>
              <Button
                variant="outline"
                className="border-green-500/30 hover:bg-green-500/10 hover:text-green-600 gap-2 h-12"
                onClick={() => handleRating(5)}
              >
                <ThumbsUp className="w-4 h-4" />
                Easy
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
