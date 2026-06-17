"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, SortAsc, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SentenceCard } from "@/components/sentences/SentenceCard";
import { SentenceCardSkeleton } from "@/components/sentences/SentenceCardSkeleton";
import Link from "next/link";
import { toast } from "sonner";
import { ISentence } from "@/types";

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

export default function SentencesPage() {
  const [sentences, setSentences] = useState<ISentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [order, setOrder] = useState("desc");

  const fetchSentences = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        search,
        category,
        difficulty,
        sort: "createdAt",
        order,
      });

      const res = await fetch(`/api/sentences?${params}`);
      const data = await res.json();

      if (res.ok) {
        setSentences(data.sentences);
        setTotal(data.total);
        setPages(data.pages);
      } else {
        toast.error("Failed to fetch sentences");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, category, difficulty, order]);

  useEffect(() => {
    const t = setTimeout(fetchSentences, 300);
    return () => clearTimeout(t);
  }, [fetchSentences]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/sentences/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Sentence deleted");
        fetchSentences();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sentences</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {total} sentence
            {total !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Link href="/sentences/add">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Sentence
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sentences..."
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

          <Button
            variant={order === "asc" ? "default" : "outline"}
            size="sm"
            className="h-9"
            onClick={() => setOrder((p) => (p === "desc" ? "asc" : "desc"))}
          >
            <SortAsc className="w-3 h-3 mr-1" />
            {order === "desc" ? "Newest" : "Oldest"}
          </Button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SentenceCardSkeleton key={i} />
          ))}
        </div>
      ) : sentences.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <PenLine className="w-14 h-14 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {search || category !== "all" || difficulty !== "all"
              ? "No sentences match your filters"
              : "No sentences yet"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {search || category !== "all" || difficulty !== "all"
              ? "Try adjusting your filters"
              : "Start writing German sentences"}
          </p>
          {!search && category === "all" && difficulty === "all" && (
            <Link href="/sentences/add">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Write First Sentence
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {sentences.map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <SentenceCard sentence={s} onDelete={handleDelete} />
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
