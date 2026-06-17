import connectDB from "@/lib/mongodb";
import LearnWord from "@/models/LearnWord";

export interface LearnWordLite {
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

interface Cache {
  words: LearnWordLite[] | null;
  fetchedAt: number;
}

// Module-level cache survives across requests
// in the same serverless instance (warm lambda)
const cache: Cache = {
  words: null,
  fetchedAt: 0,
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getAllLearnWords(): Promise<LearnWordLite[]> {
  const now = Date.now();

  if (cache.words && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.words;
  }

  await connectDB();

  const words = await LearnWord.find()
    .sort({ order: 1 })
    .select(
      "order german ipa english bangla category difficulty tags notes exampleSentence exampleEnglish",
    )
    .lean();

  const mapped = JSON.parse(JSON.stringify(words)) as LearnWordLite[];

  cache.words = mapped;
  cache.fetchedAt = now;

  return mapped;
}

// Call this after seeding/reseeding so the
// cache doesn't serve stale data
export function invalidateLearnWordsCache() {
  cache.words = null;
  cache.fetchedAt = 0;
}
