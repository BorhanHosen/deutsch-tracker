"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Volume2, ArrowLeft, Sparkles, Lightbulb } from "lucide-react";
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
import { dispatchXPUpdate } from "@/lib/xp-event";

const schema = z.object({
  german: z.string().min(2, "German sentence is required"),
  english: z.string().min(1, "English translation is required"),
  bangla: z.string(),
  category: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  notes: z.string(),
});

type FormData = {
  german: string;
  english: string;
  bangla: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  notes: string;
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

const PROMPTS = [
  "Ich lerne jeden Tag Deutsch.",
  "Das Wetter ist heute schön.",
  "Ich gehe in die Schule.",
  "Mein Haus ist groß.",
  "Ich esse gern Pizza.",
  "Berlin ist eine schöne Stadt.",
  "Ich habe einen Hund.",
  "Heute ist ein guter Tag.",
];

export default function AddSentencePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      german: "",
      english: "",
      bangla: "",
      category: "Other",
      difficulty: "beginner",
      notes: "",
    },
  });

  const germanText = watch("german");

  const speak = () => {
    if (!germanText || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(germanText);
    u.lang = "de-DE";
    u.rate = 0.85;
    setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/sentences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success(`Sentence added! +${result.xpEarned} XP 🎉`);
        dispatchXPUpdate();

        // ✅ Show task progress notification
        if (result.taskProgress) {
          const tp = result.taskProgress;
          if (tp.completed) {
            toast.success(
              `✅ Task complete: "${tp.title}" +${tp.bonusXP} bonus XP!`,
              { duration: 5000 },
            );
          } else {
            toast.info(
              `📋 Task progress: ${tp.completedCount}/${tp.targetCount} sentences`,
              { duration: 3000 },
            );
          }
        }

        router.push("/sentences");
      } else {
        toast.error(result.error || "Failed to add");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sentences">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add Sentence</h1>
          <p className="text-muted-foreground text-sm">
            Practice writing in German
          </p>
        </div>
      </div>

      {/* Example prompts */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Quick Start — Click to use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setValue("german", p)}
                className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary transition-all"
              >
                {p}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Sentence Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* German */}
              <div className="space-y-1.5">
                <Label htmlFor="german">
                  German Sentence <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="german"
                    placeholder="e.g. Ich lerne jeden Tag neue Wörter."
                    rows={3}
                    {...register("german")}
                    className="pr-12 resize-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={speak}
                    disabled={!germanText || speaking}
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
                {errors.german && (
                  <p className="text-xs text-destructive">
                    {errors.german.message}
                  </p>
                )}
              </div>

              {/* English */}
              <div className="space-y-1.5">
                <Label htmlFor="english">
                  English Translation{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="english"
                  placeholder="e.g. I learn new words every day."
                  rows={2}
                  {...register("english")}
                  className="resize-none"
                />
                {errors.english && (
                  <p className="text-xs text-destructive">
                    {errors.english.message}
                  </p>
                )}
              </div>

              {/* Bangla */}
              <div className="space-y-1.5">
                <Label htmlFor="bangla">
                  Bangla Translation{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="bangla"
                  placeholder="e.g. আমি প্রতিদিন নতুন শব্দ শিখি।"
                  rows={2}
                  {...register("bangla")}
                  className="resize-none"
                />
              </div>

              {/* Category + Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    defaultValue="Other"
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
                    defaultValue="beginner"
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

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Grammar notes or memory tips..."
                  {...register("notes")}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {loading ? "Adding..." : "Add Sentence"}
                </Button>
                <Link href="/sentences">
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
