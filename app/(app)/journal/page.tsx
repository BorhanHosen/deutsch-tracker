"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NotebookPen,
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  highlightedWords: string[];
  wordCount: number;
  createdAt: string;
}

const ENCOURAGEMENTS = [
  "Great writing! Keep it up! 🌟",
  "Wunderbar! Your German is improving! 🎉",
  "Excellent practice! 💪",
  "Sehr gut! Well done! 🏆",
  "Amazing effort! Keep writing! ✨",
];

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/journal");
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries);
      }
    } catch {
      toast.error("Failed to load journal");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please write something");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (res.ok) {
        const encouragement =
          ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        toast.success(encouragement);

        if (data.highlightedWords?.length > 0) {
          toast.info(
            `${data.highlightedWords.length} vocabulary word(s) found in your entry!`,
          );
        }

        setTitle("");
        setContent("");
        setShowForm(false);
        fetchEntries();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Entry deleted");
        fetchEntries();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const renderHighlighted = (text: string, words: string[]) => {
    if (!words || words.length === 0) return text;

    const parts = text.split(
      new RegExp(
        `(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
        "gi",
      ),
    );

    return parts.map((part, i) => {
      const isHighlighted = words.some(
        (w) => w.toLowerCase() === part.toLowerCase(),
      );
      return isHighlighted ? (
        <mark
          key={i}
          className="bg-yellow-400/30 text-yellow-700 dark:text-yellow-300 rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journal</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Write freely in German to practice
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      {/* Write Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <NotebookPen className="w-4 h-4 text-primary" />
                  Write a Journal Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>
                    Title{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    placeholder="Give your entry a title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Write in German <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    placeholder="Heute war ein guter Tag. Ich habe Deutsch gelernt..."
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="resize-none font-medium"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {content.trim().split(/\s+/).filter(Boolean).length} words
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    💡 Words from your vocabulary will be automatically
                    highlighted in your entry!
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <NotebookPen className="w-4 h-4 mr-2" />
                    )}
                    {submitting ? "Saving..." : "Save Entry"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setTitle("");
                      setContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16">
          <NotebookPen className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No journal entries yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Start writing to practice your German
          </p>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Write First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {entries.map((entry, i) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:border-primary/30 transition-all">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">
                          {entry.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(entry.createdAt)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {entry.wordCount} words
                          </span>
                          {entry.highlightedWords?.length > 0 && (
                            <Badge
                              variant="outline"
                              className="text-xs text-yellow-600 border-yellow-500/30 bg-yellow-500/10"
                            >
                              <BookOpen className="w-2.5 h-2.5 mr-1" />
                              {entry.highlightedWords.length} vocab
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            setExpandedId(
                              expandedId === entry._id ? null : entry._id,
                            )
                          }
                        >
                          {expandedId === entry._id ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(entry._id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Preview */}
                    {expandedId !== entry._id && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {entry.content}
                      </p>
                    )}

                    {/* Full content */}
                    <AnimatePresence>
                      {expandedId === entry._id && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            height: 0,
                          }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                          }}
                          exit={{
                            opacity: 0,
                            height: 0,
                          }}
                          className="mt-3 pt-3 border-t border-border"
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {renderHighlighted(
                              entry.content,
                              entry.highlightedWords || [],
                            )}
                          </p>

                          {entry.highlightedWords?.length > 0 && (
                            <div className="mt-3 p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                              <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1.5">
                                Vocabulary words used:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {entry.highlightedWords.map((w) => (
                                  <span
                                    key={w}
                                    className="text-xs bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full"
                                  >
                                    {w}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
