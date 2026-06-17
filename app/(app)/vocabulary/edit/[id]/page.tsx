"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Volume2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

const schema = z.object({
  german: z.string().min(1, "Required"),
  english: z.string().min(1, "Required"),
  bangla: z.string(),
  pronunciation: z.string(),
  category: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  notes: z.string(),
  tags: z.string(),
});

type FormData = {
  german: string;
  english: string;
  bangla: string;
  pronunciation: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  notes: string;
  tags: string;
};

const CATEGORIES = [
  "Food",
  "Travel",
  "Daily Life",
  "Family",
  "Shopping",
  "University",
  "Technology",
  "Other",
];

export default function EditWordPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      german: "",
      english: "",
      bangla: "",
      pronunciation: "",
      category: "Other",
      difficulty: "beginner",
      notes: "",
      tags: "",
    },
  });

  const germanWord = watch("german");

  // ✅ Fetch single word by ID directly
  useEffect(() => {
    const fetchWord = async () => {
      try {
        const res = await fetch(`/api/vocabulary/${id}`);
        const data = await res.json();

        if (res.ok && data.word) {
          const word = data.word;
          reset({
            german: word.german || "",
            english: word.english || "",
            bangla: word.bangla || "",
            pronunciation: word.pronunciation || "",
            category: word.category || "Other",
            difficulty: word.difficulty || "beginner",
            notes: word.notes || "",
            tags: word.tags ? word.tags.join(", ") : "",
          });
        } else {
          setNotFound(true);
          toast.error("Word not found");
          router.push("/vocabulary");
        }
      } catch {
        toast.error("Failed to load word");
        router.push("/vocabulary");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchWord();
  }, [id, reset, router]);

  const speak = () => {
    if (!germanWord || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(germanWord);
    u.lang = "de-DE";
    u.rate = 0.9;
    setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const tagsArray = data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const res = await fetch(`/api/vocabulary/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          tags: tagsArray,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Word updated successfully!");
        router.push("/vocabulary");
      } else {
        toast.error(result.error || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading word...</p>
        </div>
      </div>
    );
  }

  if (notFound) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/vocabulary">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Word</h1>
          <p className="text-muted-foreground text-sm">
            Update your vocabulary entry
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Word Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* German + Pronunciation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="german">
                    German Word <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="german"
                      placeholder="e.g. das Haus"
                      {...register("german")}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={speak}
                      disabled={!germanWord || speaking}
                    >
                      <Volume2
                        className={`w-3.5 h-3.5 ${
                          speaking ? "text-primary animate-pulse" : ""
                        }`}
                      />
                    </Button>
                  </div>
                  {errors.german && (
                    <p className="text-xs text-destructive">
                      {errors.german.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pronunciation">IPA Pronunciation</Label>
                  <Input
                    id="pronunciation"
                    placeholder="e.g. haʊs"
                    {...register("pronunciation")}
                  />
                </div>
              </div>

              {/* English + Bangla */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="english">
                    English Meaning <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="english"
                    placeholder="e.g. house"
                    {...register("english")}
                  />
                  {errors.english && (
                    <p className="text-xs text-destructive">
                      {errors.english.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bangla">
                    Bangla{" "}
                    <span className="text-muted-foreground text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="bangla"
                    placeholder="e.g. বাড়ি"
                    {...register("bangla")}
                  />
                </div>
              </div>

              {/* Category + Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={watch("category")}
                    onValueChange={(v) => setValue("category", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Difficulty</Label>
                  <Select
                    value={watch("difficulty")}
                    onValueChange={(v) =>
                      setValue("difficulty", v as FormData["difficulty"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">🟢 Beginner</SelectItem>
                      <SelectItem value="intermediate">
                        🟡 Intermediate
                      </SelectItem>
                      <SelectItem value="advanced">🔴 Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <Label htmlFor="tags">
                  Tags{" "}
                  <span className="text-muted-foreground text-xs">
                    (comma separated)
                  </span>
                </Label>
                <Input
                  id="tags"
                  placeholder="e.g. noun, home, common"
                  {...register("tags")}
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Memory tips, example sentences..."
                  rows={3}
                  {...register("notes")}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Link href="/vocabulary">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
