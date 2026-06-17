"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, SortAsc, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WordCard } from "@/components/vocabulary/WordCard";
import { WordCardSkeleton } from "@/components/vocabulary/WordCardSkeleton";
import Link from "next/link";
import { toast } from "sonner";
import { IWord } from "@/types";

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

const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Date Added" },
  { value: "german", label: "Alphabetical" },
  { value: "frequency", label: "Frequency" },
  { value: "quizScore", label: "Quiz Score" },
];

export default function VocabularyPage() {
  const [words, setWords] = useState<IWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search,
        category,
        difficulty,
        sort,
        order,
        favorites: favoritesOnly.toString(),
      });
      const res = await fetch(`/api/vocabulary?${params}`);
      const data = await res.json();
      if (res.ok) {
        setWords(data.words);
        setTotal(data.total);
        setPages(data.pages);
      } else {
        toast.error("Failed to fetch vocabulary");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, category, difficulty, sort, order, favoritesOnly]);

  useEffect(() => {
    const t = setTimeout(fetchWords, 300);
    return () => clearTimeout(t);
  }, [fetchWords]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/vocabulary/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Word deleted");
        fetchWords();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleFavorite = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/vocabulary/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !current }),
      });
      if (res.ok) {
        setWords((prev) =>
          prev.map((w) => (w._id === id ? { ...w, isFavorite: !current } : w)),
        );
        toast.success(
          !current ? "Added to favorites" : "Removed from favorites",
        );
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Vocabulary</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total} word{total !== 1 ? "s" : ""} in your collection
          </p>
        </div>
        <Link href="/vocabulary/add">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Word
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search words..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-36 h-9">
              <Filter className="w-3 h-3 mr-1" />
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

          <Select
            value={difficulty}
            onValueChange={(v) => {
              setDifficulty(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTIES.map((d) => (
                <SelectItem key={d} value={d}>
                  {d === "all"
                    ? "All Levels"
                    : d.charAt(0).toUpperCase() + d.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(v) => {
              setSort(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-40 h-9">
              <SortAsc className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={order === "asc" ? "default" : "outline"}
            size="sm"
            className="h-9"
            onClick={() => setOrder((p) => (p === "desc" ? "asc" : "desc"))}
          >
            {order === "desc" ? "↓ Newest" : "↑ Oldest"}
          </Button>

          <Button
            variant={favoritesOnly ? "default" : "outline"}
            size="sm"
            className="h-9 gap-1"
            onClick={() => {
              setFavoritesOnly((p) => !p);
              setCurrentPage(1);
            }}
          >
            <Star className="w-3 h-3" />
            Favorites
          </Button>
        </div>

        {/* Active filters */}
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="secondary">
              &quot;{search}&quot;
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            </Badge>
          )}
          {category !== "all" && (
            <Badge variant="secondary">
              {category}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => setCategory("all")}
              >
                ×
              </button>
            </Badge>
          )}
          {difficulty !== "all" && (
            <Badge variant="secondary">
              {difficulty}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => setDifficulty("all")}
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Words Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <WordCardSkeleton key={i} />
          ))}
        </div>
      ) : words.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <BookOpen className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {search || category !== "all" || difficulty !== "all"
              ? "No words match your filters"
              : "No words yet"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {search || category !== "all" || difficulty !== "all"
              ? "Try adjusting your filters"
              : "Start building your vocabulary"}
          </p>
          {!search && category === "all" && difficulty === "all" && (
            <Link href="/vocabulary/add">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add First Word
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {words.map((word, i) => (
                <motion.div
                  key={word._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <WordCard
                    word={word}
                    onDelete={handleDelete}
                    onFavorite={handleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              {Array.from({
                length: Math.min(pages, 5),
              }).map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  className="w-9"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === pages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
