"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  RefreshCw,
  Timer,
  CheckCircle2,
  XCircle,
  Shuffle,
  ArrowRight,
  Star,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WordItem {
  _id: string;
  german: string;
  english: string;
}

interface SentenceItem {
  _id: string;
  german: string;
  english: string;
  wordsUsed: string[];
}

// ─────────────────────────────────────────────
// WORD SCRAMBLE
// ─────────────────────────────────────────────
function WordScramble({ words }: { words: WordItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [state, setState] = useState<
    "playing" | "correct" | "wrong" | "finished"
  >("playing");

  const currentWord = words[currentIndex];

  const scrambleWord = useCallback((word: string): string => {
    if (word.length <= 1) return word;
    const arr = word.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const result = arr.join("");
    return result === word ? scrambleWord(word) : result;
  }, []);

  useEffect(() => {
    if (currentWord) {
      // Use just the main word without article
      const wordOnly =
        currentWord.german.split(" ").pop() || currentWord.german;
      setScrambled(scrambleWord(wordOnly));
      setInput("");
      setState("playing");
      setTimeLeft(30);
    }
  }, [currentIndex, currentWord, scrambleWord]);

  useEffect(() => {
    if (state !== "playing") return;
    if (timeLeft <= 0) {
      setState("wrong");
      setTotalAttempts((t) => t + 1);
      setTimeout(() => {
        if (currentIndex + 1 >= words.length) {
          setState("finished");
        } else {
          setCurrentIndex((i) => i + 1);
        }
      }, 1500);
      return;
    }
    const t = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, state, currentIndex, words.length]);

  const handleSubmit = () => {
    if (!input.trim() || !currentWord) return;
    setTotalAttempts((t) => t + 1);
    // Check against full german or just the word part
    const wordOnly = currentWord.german.split(" ").pop() || currentWord.german;
    const correct =
      input.trim().toLowerCase() === wordOnly.toLowerCase() ||
      input.trim().toLowerCase() === currentWord.german.toLowerCase();

    if (correct) {
      setScore((s) => s + Math.ceil(timeLeft / 3));
      setState("correct");
    } else {
      setState("wrong");
    }

    setTimeout(() => {
      if (currentIndex + 1 >= words.length) {
        setState("finished");
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 1500);
  };

  const reset = () => {
    setCurrentIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setState("playing");
  };

  if (state === "finished") {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="text-5xl">{score > 50 ? "🏆" : "💪"}</div>
        <h3 className="text-xl font-bold">Game Over!</h3>
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <div className="bg-secondary/50 rounded-xl p-3">
            <p className="text-2xl font-bold text-primary">{score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3">
            <p className="text-2xl font-bold text-green-500">{words.length}</p>
            <p className="text-xs text-muted-foreground">Words</p>
          </div>
        </div>
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Play Again
        </Button>
      </div>
    );
  }

  if (!currentWord) return null;

  const wordOnly = currentWord.german.split(" ").pop() || currentWord.german;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          {currentIndex + 1}/{words.length}
        </Badge>
        <div
          className={cn(
            "flex items-center gap-1.5 text-sm font-bold",
            timeLeft <= 10 ? "text-red-500" : "text-foreground",
          )}
        >
          <Timer className="w-4 h-4" />
          {timeLeft}s
        </div>
        <Badge
          variant="outline"
          className="text-yellow-600 border-yellow-500/30"
        >
          <Star className="w-3 h-3 mr-1" />
          {score}
        </Badge>
      </div>

      <Progress value={(timeLeft / 30) * 100} className="h-2" />

      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Unscramble this German word
            </p>
            <p className="text-sm text-muted-foreground">
              Hint: {currentWord.english}
            </p>
          </div>

          <div className="flex justify-center gap-2 flex-wrap my-4">
            {scrambled.split("").map((char, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary"
              >
                {char}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {state === "correct" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center gap-2 text-green-600"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">
                  Correct! +{Math.ceil(timeLeft / 3)} pts
                </span>
              </motion.div>
            )}
            {state === "wrong" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center gap-1 text-red-500"
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">Wrong!</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Answer: <strong className="text-primary">{wordOnly}</strong>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {state === "playing" && (
            <div className="flex gap-2">
              <Input
                placeholder="Type the word..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="text-center font-medium"
                autoFocus
              />
              <Button onClick={handleSubmit}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// MATCHING PAIRS
// ─────────────────────────────────────────────
interface MatchCard {
  id: string;
  text: string;
  type: "german" | "english";
  wordId: string;
  matched: boolean;
  selected: boolean;
}

function MatchingPairs({ words }: { words: WordItem[] }) {
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selected, setSelected] = useState<MatchCard | null>(null);
  const [matches, setMatches] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongPair, setWrongPair] = useState<string[]>([]);

  const setupGame = useCallback(() => {
    const gameWords = words.slice(0, 6);
    const newCards: MatchCard[] = [];

    gameWords.forEach((w) => {
      newCards.push({
        id: `g-${w._id}`,
        text: w.german,
        type: "german",
        wordId: w._id,
        matched: false,
        selected: false,
      });
      newCards.push({
        id: `e-${w._id}`,
        text: w.english,
        type: "english",
        wordId: w._id,
        matched: false,
        selected: false,
      });
    });

    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    setCards(newCards);
    setSelected(null);
    setMatches(0);
    setAttempts(0);
    setFinished(false);
    setWrongPair([]);
  }, [words]);

  useEffect(() => {
    if (words.length >= 2) setupGame();
  }, [setupGame]);

  const handleClick = (card: MatchCard) => {
    if (card.matched || card.selected || wrongPair.length > 0) return;

    if (!selected) {
      setSelected(card);
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, selected: true } : c)),
      );
      return;
    }

    if (selected.id === card.id) {
      setSelected(null);
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, selected: false } : c)),
      );
      return;
    }

    setAttempts((a) => a + 1);

    const isMatch =
      selected.wordId === card.wordId && selected.type !== card.type;

    if (isMatch) {
      const newMatches = matches + 1;
      setMatches(newMatches);
      setCards((prev) =>
        prev.map((c) =>
          c.wordId === card.wordId
            ? {
                ...c,
                matched: true,
                selected: false,
              }
            : c,
        ),
      );
      setSelected(null);
      if (newMatches >= Math.min(words.length, 6)) {
        setTimeout(() => setFinished(true), 500);
      }
    } else {
      setWrongPair([selected.id, card.id]);
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, selected: true } : c)),
      );
      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === selected.id || c.id === card.id
              ? { ...c, selected: false }
              : c,
          ),
        );
        setSelected(null);
        setWrongPair([]);
      }, 800);
    }
  };

  if (finished) {
    const accuracy =
      attempts > 0 ? Math.round((matches / attempts) * 100) : 100;
    return (
      <div className="text-center space-y-4 py-6">
        <div className="text-5xl">🎉</div>
        <h3 className="text-xl font-bold">All Matched!</h3>
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <div className="bg-secondary/50 rounded-xl p-3">
            <p className="text-2xl font-bold text-green-500">{matches}</p>
            <p className="text-xs text-muted-foreground">Pairs</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3">
            <p className="text-2xl font-bold text-primary">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>
        <Button onClick={setupGame} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          {matches}/{Math.min(words.length, 6)} pairs
        </Badge>
        <Badge variant="outline" className="text-muted-foreground">
          {attempts} attempts
        </Badge>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {cards.map((card) => {
          const isWrong = wrongPair.includes(card.id);
          return (
            <motion.button
              key={card.id}
              onClick={() => handleClick(card)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "p-2.5 rounded-xl border-2 text-xs font-medium transition-all min-h-16 flex items-center justify-center text-center",
                card.matched
                  ? "border-green-500/30 bg-green-500/10 text-green-600 cursor-default"
                  : card.selected && !isWrong
                    ? "border-primary bg-primary/10 text-primary"
                    : isWrong
                      ? "border-red-500/30 bg-red-500/10 text-red-600"
                      : "border-border hover:border-primary/40 bg-secondary/30",
              )}
            >
              <span className="leading-tight">{card.text}</span>
            </motion.button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Match each German word with its English meaning
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// SENTENCE BUILDER (Dynamic from DB)
// ─────────────────────────────────────────────

// Fallback static sentences if user has none
const FALLBACK_SENTENCES = [
  {
    german: "Ich lerne jeden Tag Deutsch.",
    english: "I learn German every day.",
  },
  {
    german: "Das Wetter ist heute schön.",
    english: "The weather is beautiful today.",
  },
  {
    german: "Ich gehe in die Schule.",
    english: "I go to school.",
  },
  {
    german: "Berlin ist eine schöne Stadt.",
    english: "Berlin is a beautiful city.",
  },
  {
    german: "Ich habe einen Hund.",
    english: "I have a dog.",
  },
  {
    german: "Wir essen zusammen zu Abend.",
    english: "We eat dinner together.",
  },
  {
    german: "Heute ist ein guter Tag.",
    english: "Today is a good day.",
  },
  {
    german: "Er kauft heute ein Buch.",
    english: "He buys a book today.",
  },
];

interface SentenceChallenge {
  words: string[];
  correct: string;
  english: string;
}

function SentenceBuilder({ sentences }: { sentences: SentenceItem[] }) {
  const [challenges, setChallenges] = useState<SentenceChallenge[]>([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [available, setAvailable] = useState<string[]>([]);
  const [built, setBuilt] = useState<string[]>([]);
  const [state, setState] = useState<"playing" | "correct" | "wrong">(
    "playing",
  );
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Build challenges from sentences
  useEffect(() => {
    const source =
      sentences.length >= 4
        ? sentences
        : FALLBACK_SENTENCES.map((s, i) => ({
            _id: `fallback-${i}`,
            german: s.german,
            english: s.english,
            wordsUsed: [],
          }));

    const built: SentenceChallenge[] = source.slice(0, 10).map((s) => {
      const words = s.german
        .replace(/[.,!?;:'"()]/g, "")
        .split(" ")
        .filter(Boolean);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      return {
        words: shuffled,
        correct: s.german.replace(/[.,!?;:'"()]/g, "").trim(),
        english: s.english,
      };
    });

    setChallenges(built);
  }, [sentences]);

  const challenge = challenges[challengeIndex];

  useEffect(() => {
    if (challenge) {
      setAvailable([...challenge.words].sort(() => Math.random() - 0.5));
      setBuilt([]);
      setState("playing");
    }
  }, [challengeIndex, challenge]);

  const addWord = (word: string, index: number) => {
    if (state !== "playing") return;
    setBuilt((prev) => [...prev, word]);
    setAvailable((prev) => prev.filter((_, i) => i !== index));
  };

  const removeWord = (word: string, index: number) => {
    if (state !== "playing") return;
    setAvailable((prev) => [...prev, word]);
    setBuilt((prev) => prev.filter((_, i) => i !== index));
  };

  const checkAnswer = () => {
    if (!challenge) return;
    const answer = built.join(" ");
    const correct = answer.toLowerCase() === challenge.correct.toLowerCase();
    if (correct) {
      setScore((s) => s + 10);
      setState("correct");
    } else {
      setState("wrong");
    }
  };

  const nextChallenge = () => {
    if (challengeIndex + 1 >= challenges.length) {
      setFinished(true);
    } else {
      setChallengeIndex((i) => i + 1);
    }
  };

  const reset = () => {
    setChallengeIndex(0);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="text-5xl">🧩</div>
        <h3 className="text-xl font-bold">All Done!</h3>
        <div className="bg-secondary/50 rounded-xl p-4 max-w-xs mx-auto">
          <p className="text-3xl font-bold text-primary">{score}</p>
          <p className="text-sm text-muted-foreground">Final Score</p>
        </div>
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Play Again
        </Button>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Loading challenges...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline">
          {challengeIndex + 1}/{challenges.length}
        </Badge>
        <Badge
          variant="outline"
          className="text-yellow-600 border-yellow-500/30"
        >
          <Star className="w-3 h-3 mr-1" />
          {score}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Build this sentence:
            </p>
            <p className="text-sm font-semibold text-primary">
              &ldquo;{challenge.english}&rdquo;
            </p>
          </div>

          {/* Build area */}
          <div className="min-h-13 border-2 border-dashed border-border rounded-xl p-2 flex flex-wrap gap-2 items-center">
            {built.length === 0 ? (
              <p className="text-xs text-muted-foreground w-full text-center">
                Click words below to build
              </p>
            ) : (
              built.map((word, i) => (
                <motion.button
                  key={`${word}-${i}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  onClick={() => removeWord(word, i)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all",
                    state === "correct"
                      ? "border-green-500/30 bg-green-500/10 text-green-700 cursor-default"
                      : state === "wrong"
                        ? "border-red-500/30 bg-red-500/10 text-red-700"
                        : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
                  )}
                >
                  {word}
                </motion.button>
              ))
            )}
          </div>

          {/* Available words */}
          <div className="flex flex-wrap gap-2">
            {available.map((word, i) => (
              <motion.button
                key={`${word}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => addWord(word, i)}
                disabled={state !== "playing"}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border-2 border-border bg-secondary/50 hover:border-primary/40 hover:bg-secondary transition-all disabled:opacity-50"
              >
                {word}
              </motion.button>
            ))}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {state === "correct" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-green-600 bg-green-500/10 rounded-lg p-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">Correct! +10 points</span>
              </motion.div>
            )}
            {state === "wrong" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1 bg-red-500/10 rounded-lg p-2.5"
              >
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Not quite right</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Correct:{" "}
                  <span className="text-primary font-medium">
                    {challenge.correct}
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex gap-2">
            {state === "playing" ? (
              <>
                <Button
                  onClick={checkAnswer}
                  disabled={built.length === 0}
                  className="flex-1"
                >
                  Check Answer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAvailable(
                      [...challenge.words].sort(() => Math.random() - 0.5),
                    );
                    setBuilt([]);
                  }}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button onClick={nextChallenge} className="flex-1 gap-2">
                {challengeIndex + 1 >= challenges.length ? (
                  <>
                    See Results
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN GAMES PAGE
// ─────────────────────────────────────────────

export default function GamesPage() {
  const [words, setWords] = useState<WordItem[]>([]);
  const [sentences, setSentences] = useState<SentenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState("scramble");

  const fetchGameData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch words and sentences in parallel
      const [wordsRes, sentencesRes] = await Promise.all([
        fetch("/api/vocabulary?limit=50&sort=createdAt&order=desc"),
        fetch("/api/sentences?limit=20&sort=createdAt&order=desc"),
      ]);

      const [wordsData, sentencesData] = await Promise.all([
        wordsRes.json(),
        sentencesRes.json(),
      ]);

      if (wordsRes.ok && wordsData.words) {
        // Shuffle words for variety
        const shuffled = [...wordsData.words].sort(() => Math.random() - 0.5);
        setWords(shuffled);
      }

      if (sentencesRes.ok && sentencesData.sentences) {
        // Shuffle sentences
        const shuffled = [...sentencesData.sentences].sort(
          () => Math.random() - 0.5,
        );
        setSentences(shuffled);
      }
    } catch {
      toast.error("Failed to load game data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  const games = [
    {
      id: "scramble",
      label: "Word Scramble",
      emoji: "🔤",
      desc: "Unscramble German words",
      minWords: 1,
    },
    {
      id: "matching",
      label: "Matching Pairs",
      emoji: "🃏",
      desc: "Match German to English",
      minWords: 2,
    },
    {
      id: "builder",
      label: "Sentence Builder",
      emoji: "🧩",
      desc: "Build correct sentences",
      minWords: 0,
    },
  ];

  const getMinWords = () => {
    const game = games.find((g) => g.id === activeGame);
    return game?.minWords || 4;
  };

  const hasEnoughData = () => {
    if (activeGame === "builder") return true;
    if (activeGame === "matching") return words.length >= 2;
    return words.length >= 1;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Games</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Practice German through fun mini games
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchGameData}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Refresh
        </Button>
      </div>

      {/* Game selector */}
      <div className="grid grid-cols-3 gap-3">
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGame(g.id)}
            className={cn(
              "p-3 rounded-xl border-2 text-left transition-all",
              activeGame === g.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40",
            )}
          >
            <div className="text-2xl mb-1">{g.emoji}</div>
            <p className="text-xs font-semibold leading-tight">{g.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
              {g.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Game content */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-primary" />
            {games.find((g) => g.id === activeGame)?.label}
            {!loading && (
              <span className="text-xs font-normal text-muted-foreground ml-auto">
                {activeGame !== "builder"
                  ? `${words.length} words from your vocabulary`
                  : `${sentences.length > 0 ? sentences.length : FALLBACK_SENTENCES.length} sentences`}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Loading your words...
              </p>
            </div>
          ) : !hasEnoughData() ? (
            <div className="text-center py-8 space-y-3">
              <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground/30" />
              <h3 className="font-semibold">Not enough words</h3>
              <p className="text-sm text-muted-foreground">
                Add at least {activeGame === "matching" ? "2" : "1"} words to
                your vocabulary to play this game.
              </p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/vocabulary/add")}
              >
                Add Words
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGame}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                {activeGame === "scramble" && <WordScramble words={words} />}
                {activeGame === "matching" && <MatchingPairs words={words} />}
                {activeGame === "builder" && (
                  <SentenceBuilder sentences={sentences} />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
