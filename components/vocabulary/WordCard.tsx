"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Trash2,
  Edit,
  Volume2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
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
import { IWord } from "@/types";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";

interface WordCardProps {
  word: IWord;
  onDelete: (id: string) => void;
  onFavorite: (id: string, current: boolean) => void;
}

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function WordCard({ word, onDelete, onFavorite }: WordCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word.german);
    u.lang = "de-DE";
    u.rate = 0.9;
    setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  return (
    <Card className="hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <CardContent className="p-4">
        {/* Top */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-primary">{word.german}</h3>
              {word.pronunciation && (
                <span className="text-xs text-muted-foreground font-mono">
                  /{word.pronunciation}/
                </span>
              )}
            </div>
            <p className="text-sm text-foreground mt-0.5">{word.english}</p>
            {word.bangla && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {word.bangla}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={speak}
              disabled={speaking}
            >
              <Volume2
                className={`w-3.5 h-3.5 ${speaking ? "text-primary animate-pulse" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onFavorite(word._id, word.isFavorite)}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  word.isFavorite
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Badge variant="outline" className="text-xs">
            {word.category}
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs ${difficultyColor[word.difficulty]}`}
          >
            {word.difficulty}
          </Badge>
          {word.frequency > 1 && (
            <Badge
              variant="outline"
              className="text-xs text-blue-600 border-blue-500/20 bg-blue-500/10"
            >
              <RotateCcw className="w-2.5 h-2.5 mr-1" />
              {word.frequency}×
            </Badge>
          )}
          {word.quizScore > 0 && (
            <Badge
              variant="outline"
              className={`text-xs ${
                word.quizScore >= 70
                  ? "text-green-600 border-green-500/20 bg-green-500/10"
                  : "text-red-600 border-red-500/20 bg-red-500/10"
              }`}
            >
              {word.quizScore}%
            </Badge>
          )}
        </div>

        {/* Expand */}
        {(word.notes || (word.tags && word.tags.length > 0)) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {expanded ? "Less" : "More"}
          </button>
        )}

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-2 space-y-2"
          >
            {word.notes && (
              <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                {word.notes}
              </p>
            )}
            {word.tags && word.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {word.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(word.createdAt)}
          </span>

          <div className="flex items-center gap-1">
            <Link href={`/vocabulary/edit/${word._id}`}>
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
                  <AlertDialogTitle>
                    Delete &quot;{word.german}&quot;?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(word._id)}
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
