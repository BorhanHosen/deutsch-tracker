"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ISentence } from "@/types";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";

interface SentenceCardProps {
  sentence: ISentence;
  onDelete: (id: string) => void;
}

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function SentenceCard({ sentence, onDelete }: SentenceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(sentence.german);
    u.lang = "de-DE";
    u.rate = 0.85;
    setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  // Highlight vocabulary words in the sentence
  const renderGerman = (text: string) => {
    if (!sentence.wordsUsed || sentence.wordsUsed.length === 0) {
      return <span>{text}</span>;
    }

    const words = text.split(" ");
    return (
      <>
        {words.map((word, i) => {
          const clean = word.toLowerCase().replace(/[.,!?;:'"()]/g, "");
          const isVocab = sentence.wordsUsed.some(
            (w) => w.toLowerCase() === clean,
          );
          return (
            <span key={i}>
              {isVocab ? (
                <span className="text-primary font-semibold underline decoration-dotted decoration-primary/40">
                  {word}
                </span>
              ) : (
                word
              )}
              {i < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </>
    );
  };

  return (
    <Card className="hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-4">
        {/* German sentence */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold leading-relaxed">
              {renderGerman(sentence.german)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {sentence.english}
            </p>
            {sentence.bangla && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {sentence.bangla}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={speak}
            disabled={speaking}
          >
            <Volume2
              className={`w-4 h-4 ${
                speaking
                  ? "text-primary animate-pulse"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="outline" className="text-xs">
            {sentence.category}
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs ${difficultyColor[sentence.difficulty]}`}
          >
            {sentence.difficulty}
          </Badge>
          {sentence.wordsUsed && sentence.wordsUsed.length > 0 && (
            <Badge
              variant="outline"
              className="text-xs text-blue-600 border-blue-500/20 bg-blue-500/10"
            >
              <BookOpen className="w-2.5 h-2.5 mr-1" />
              {sentence.wordsUsed.length} vocab word
              {sentence.wordsUsed.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Expand for details */}
        {(sentence.notes ||
          (sentence.wordsUsed && sentence.wordsUsed.length > 0)) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {expanded ? "Less" : "More details"}
          </button>
        )}

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 space-y-2"
          >
            {sentence.notes && (
              <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                📝 {sentence.notes}
              </p>
            )}
            {sentence.wordsUsed && sentence.wordsUsed.length > 0 && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-2">
                <p className="text-xs font-medium text-blue-600 mb-1.5">
                  Vocabulary words used:
                </p>
                <div className="flex flex-wrap gap-1">
                  {sentence.wordsUsed.map((w) => (
                    <span
                      key={w}
                      className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(sentence.createdAt)}
          </span>

          <div className="flex items-center gap-1">
            <Link href={`/sentences/edit/${sentence._id}`}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Edit className="w-3 h-3" />
              </Button>
            </Link>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete sentence?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(sentence._id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
