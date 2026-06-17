"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  XCircle,
  Trophy,
  RefreshCw,
  ArrowRight,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { dispatchXPUpdate } from "@/lib/xp-event";

interface Question {
  wordId: string;
  german: string;
  english: string;
  correctAnswer: string;
  options: string[];
  mode: string;
}

interface QuizResult {
  wordId: string;
  correct: boolean;
  rating: number;
}

type QuizState = "setup" | "playing" | "answered" | "finished";

const CATEGORIES = [
  "all",
  "Food",
  "Travel",
  "Daily Life",
  "Family",
  "Shopping",
  "University",
  "Technology",
  "Other",
];

export default function QuizPage() {
  const [state, setState] = useState<QuizState>("setup");
  const [mode, setMode] = useState("multiple");
  const [category, setCategory] = useState("all");
  const [count, setCount] = useState("10");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState<null | {
    correct: number;
    total: number;
    xpEarned: number;
    score: number;
  }>(null);

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const startQuiz = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        mode,
        count,
        category,
      });
      const res = await fetch(`/api/quiz?${params}`);
      const data = await res.json();

      if (res.ok) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setResults([]);
        setSelected(null);
        setState("playing");
      } else {
        toast.error(data.error || "Failed to load quiz");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (state !== "playing") return;
    setSelected(option);
    setState("answered");

    const correct = option === currentQuestion.correctAnswer;
    const result: QuizResult = {
      wordId: currentQuestion.wordId,
      correct,
      rating: correct ? 4 : 1,
    };

    setResults((prev) => [...prev, result]);
  };

  const speak = (text: string, lang = "de-DE") => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      submitResults();
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setState("playing");
    }
  };

  const submitResults = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ results }),
      });
      const data = await res.json();

      if (res.ok) {
        setFinalScore(data);
        dispatchXPUpdate();

        // ✅ Show task progress notification
        if (data.taskProgress) {
          const tp = data.taskProgress;
          if (tp.completed) {
            toast.success(
              `✅ Task complete: "${tp.title}" +${tp.bonusXP} bonus XP!`,
              { duration: 5000 },
            );
          }
        }

        setState("finished");
      } else {
        toast.error("Failed to save results");
        setState("finished");
      }
    } catch {
      toast.error("Something went wrong");
      setState("finished");
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setState("setup");
    setQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
    setResults([]);
    setFinalScore(null);
  };

  // Setup Screen
  if (state === "setup") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Quiz</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Test your German vocabulary knowledge
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Quiz Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quiz Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    value: "multiple",
                    label: "German → English",
                    desc: "See German, pick English",
                    emoji: "🇩🇪",
                  },
                  {
                    value: "reverse",
                    label: "English → German",
                    desc: "See English, pick German",
                    emoji: "🔄",
                  },
                ].map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      mode === m.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <p className="font-medium text-sm">
                      {m.emoji} {m.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {m.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "all" ? "All Categories" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Questions</label>
              <div className="flex gap-2">
                {["5", "10", "15", "20"].map((n) => (
                  <Button
                    key={n}
                    variant={count === n ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCount(n)}
                    className="flex-1"
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={startQuiz}
              disabled={loading}
              className="w-full h-11"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Brain className="w-4 h-4 mr-2" />
              )}
              {loading ? "Loading..." : "Start Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Finished Screen
  if (state === "finished") {
    const score = finalScore?.score || 0;
    const emoji =
      score >= 90 ? "🏆" : score >= 70 ? "🎉" : score >= 50 ? "👍" : "💪";

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="text-6xl mb-4">{emoji}</div>
              <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-muted-foreground mb-6">
                {score >= 70
                  ? "Great job! Keep it up!"
                  : "Keep practicing to improve!"}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-primary">
                    {finalScore?.score ?? 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Score</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-green-500">
                    {finalScore?.correct ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Correct</p>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-2xl font-bold text-yellow-500">
                    +{finalScore?.xpEarned ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    XP Earned
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={resetQuiz} className="flex-1 gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/vocabulary")}
                  className="flex-1"
                >
                  View Vocabulary
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Result breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Question Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {questions.map((q, i) => {
              const result = results[i];
              return (
                <div
                  key={q.wordId}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg text-sm",
                    result?.correct ? "bg-green-500/10" : "bg-red-500/10",
                  )}
                >
                  {result?.correct ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <span className="font-medium text-primary">{q.german}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{q.english}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Playing Screen
  if (!currentQuestion) return null;

  const isCorrect = selected === currentQuestion.correctAnswer;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="font-medium">
            {results.filter((r) => r.correct).length} correct
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
        >
          <Card>
            <CardContent className="p-6">
              {/* Question */}
              <div className="text-center mb-6">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                  {mode === "reverse"
                    ? "What is the German word for?"
                    : "What does this mean?"}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-3xl font-bold text-primary">
                    {mode === "reverse"
                      ? currentQuestion.english
                      : currentQuestion.german}
                  </h2>
                  {mode !== "reverse" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => speak(currentQuestion.german)}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option) => {
                  let variant: "default" | "outline" = "outline";
                  let className = "";

                  if (state === "answered" && selected) {
                    if (option === currentQuestion.correctAnswer) {
                      className =
                        "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                    } else if (option === selected && !isCorrect) {
                      className =
                        "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                    }
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={state === "answered"}
                      className={cn(
                        "w-full p-3 rounded-xl border-2 text-left text-sm font-medium transition-all",
                        "hover:border-primary/50 disabled:cursor-default",
                        selected === option && state === "answered"
                          ? className
                          : "border-border",
                        state !== "answered" && "hover:bg-secondary/50",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Answer feedback */}
              {state === "answered" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <div
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg text-sm",
                      isCorrect
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-red-500/10 text-red-700 dark:text-red-400",
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>
                      {isCorrect
                        ? "Correct! +5 XP"
                        : `Wrong! Answer: ${currentQuestion.correctAnswer}`}
                    </span>
                  </div>

                  <Button
                    onClick={nextQuestion}
                    disabled={submitting}
                    className="w-full mt-3 gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : currentIndex + 1 >= questions.length ? (
                      <>
                        <Trophy className="w-4 h-4" />
                        See Results
                      </>
                    ) : (
                      <>
                        Next Question
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
