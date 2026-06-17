"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { dispatchXPUpdate } from "@/lib/xp-event";

interface LearnWord {
  _id: string;
  german: string;
  english: string;
  bangla: string;
  ipa: string;
  category: string;
  difficulty: string;
  tags: string[];
  notes: string;
  exampleSentence: string;
  exampleEnglish: string;
}

export function useAddToVocabulary() {
  const [adding, setAdding] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState<Set<string>>(new Set());

  const addToVocabulary = useCallback(
    async (word: LearnWord) => {
      if (adding.has(word._id) || added.has(word._id)) {
        return;
      }

      setAdding((prev) => {
        const next = new Set(prev);
        next.add(word._id);
        return next;
      });

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
            toast.info(`"${word.german}" is already in your vocabulary`);
          } else {
            toast.success(
              `"${word.german}" added to vocabulary! +${data.xpEarned} XP`,
            );
            dispatchXPUpdate();

            // Show task progress
            if (data.taskProgress) {
              const tp = data.taskProgress;
              if (tp.completed) {
                toast.success(
                  `✅ Task complete: "${tp.title}" +${tp.bonusXP} bonus XP!`,
                  { duration: 5000 },
                );
              } else {
                toast.info(
                  `📋 Task: ${tp.completedCount}/${tp.targetCount} words`,
                  { duration: 3000 },
                );
              }
            }
          }

          // Mark as added regardless
          setAdded((prev) => {
            const next = new Set(prev);
            next.add(word._id);
            return next;
          });
        } else {
          toast.error(data.error || "Failed to add word");
        }
      } catch {
        toast.error("Something went wrong");
      } finally {
        setAdding((prev) => {
          const next = new Set(prev);
          next.delete(word._id);
          return next;
        });
      }
    },
    [adding, added],
  );

  const isAdding = useCallback(
    (wordId: string) => adding.has(wordId),
    [adding],
  );

  const isAdded = useCallback((wordId: string) => added.has(wordId), [added]);

  return { addToVocabulary, isAdding, isAdded };
}
