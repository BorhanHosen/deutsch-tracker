"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Tag,
  BookOpen,
  Check,
  Plus,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LearnWordData {
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

interface PublicWordCardProps {
  word: LearnWordData;
  isLearned: boolean;
  onMarkLearned: (id: string) => void;
  onUnmarkLearned: (id: string) => void;
  onAddToVocabulary: (word: LearnWordData) => void;
}

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function PublicWordCard({
  word,
  isLearned,
  onMarkLearned,
  onUnmarkLearned,
  onAddToVocabulary,
}: PublicWordCardProps) {
  const [speakingWord, setSpeakingWord] = useState(false);
  const [speakingSentence, setSpeakingSentence] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [justLearned, setJustLearned] = useState(false);

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

  const handleMarkLearned = () => {
    setJustLearned(true);
    setTimeout(() => {
      onMarkLearned(word._id);
    }, 600);
  };

  return (
    <AnimatePresence>
      {!justLearned && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            height: 0,
            marginBottom: 0,
            transition: { duration: 0.4 },
          }}
        >
          <Card
            className={cn(
              "transition-all duration-200 overflow-hidden",
              isLearned
                ? "border-green-500/30 bg-green-500/5 opacity-60"
                : "hover:border-primary/30",
            )}
          >
            <CardContent className="p-5">
              {/* Word number badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium bg-secondary/80 px-2 py-0.5 rounded-full">
                  #{word.order}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {word.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${difficultyColor[word.difficulty]}`}
                  >
                    {word.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Main Word */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-bold text-primary leading-none">
                    {word.german}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full shrink-0"
                    onClick={() => speak(word.german, "word")}
                    disabled={speakingWord}
                  >
                    <Volume2
                      className={cn(
                        "w-4 h-4",
                        speakingWord
                          ? "text-primary animate-pulse"
                          : "text-muted-foreground",
                      )}
                    />
                  </Button>
                </div>

                {word.ipa && (
                  <p className="text-xs text-muted-foreground font-mono mb-1">
                    /{word.ipa}/
                  </p>
                )}

                <p className="text-lg font-semibold text-foreground">
                  {word.english}
                </p>
                {word.bangla && (
                  <p className="text-sm text-muted-foreground">{word.bangla}</p>
                )}
              </div>

              {/* Tags */}
              {word.tags && word.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {word.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes */}
              {word.notes && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5 mb-3">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    💡 {word.notes}
                  </p>
                </div>
              )}

              {/* Example Sentence */}
              {word.exampleSentence && (
                <div className="bg-secondary/50 border border-border rounded-lg p-3 mb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <BookOpen className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Example
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-primary leading-relaxed">
                        {word.exampleSentence}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {word.exampleEnglish}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
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

              {/* Action Buttons */}
              {!isLearned ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddToVocabulary(word)}
                    className="flex-1 gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Vocabulary
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleMarkLearned}
                    className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Learned
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Learned ✓</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUnmarkLearned(word._id)}
                    className="text-xs text-muted-foreground gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Undo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
