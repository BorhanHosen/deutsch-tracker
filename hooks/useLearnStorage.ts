"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "deutschtracker_learned";
const PAGE_KEY = "deutschtracker_learn_page";
const LIMIT_KEY = "deutschtracker_learn_limit";

export function useLearnStorage() {
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setLearnedIds(new Set(ids));
      }
    } catch {
      // Ignore parse errors
    }
    setInitialized(true);
  }, []);

  // Save to localStorage whenever learnedIds changes
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(learnedIds)));
    } catch {
      // Ignore storage errors
    }
  }, [learnedIds, initialized]);

  const markLearned = useCallback((wordId: string) => {
    setLearnedIds((prev) => {
      const next = new Set(prev);
      next.add(wordId);
      return next;
    });
  }, []);

  const unmarkLearned = useCallback((wordId: string) => {
    setLearnedIds((prev) => {
      const next = new Set(prev);
      next.delete(wordId);
      return next;
    });
  }, []);

  const isLearned = useCallback(
    (wordId: string) => learnedIds.has(wordId),
    [learnedIds],
  );

  const clearAll = useCallback(() => {
    setLearnedIds(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const getStoredPage = useCallback((): number => {
    try {
      return parseInt(localStorage.getItem(PAGE_KEY) || "1");
    } catch {
      return 1;
    }
  }, []);

  const setStoredPage = useCallback((page: number) => {
    try {
      localStorage.setItem(PAGE_KEY, page.toString());
    } catch {
      // ignore
    }
  }, []);

  const getStoredLimit = useCallback((): number => {
    try {
      const stored = parseInt(localStorage.getItem(LIMIT_KEY) || "5");
      return [5, 10, 20, 50].includes(stored) ? stored : 5;
    } catch {
      return 5;
    }
  }, []);

  const setStoredLimit = useCallback((limit: number) => {
    try {
      localStorage.setItem(LIMIT_KEY, limit.toString());
    } catch {
      // ignore
    }
  }, []);

  return {
    learnedIds,
    learnedCount: learnedIds.size,
    markLearned,
    unmarkLearned,
    isLearned,
    clearAll,
    initialized,
    getStoredPage,
    setStoredPage,
    getStoredLimit,
    setStoredLimit,
    allLearnedIds: Array.from(learnedIds),
  };
}
