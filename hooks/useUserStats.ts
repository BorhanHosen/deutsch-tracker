"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getXPProgress } from "@/lib/utils";

interface UserStats {
  xp: number;
  streak: number;
  longestStreak: number;
  level: string;
  badges: string[];
}

export function useUserStats() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    streak: 0,
    longestStreak: 0,
    level: "A1",
    badges: [],
  });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/refresh", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      refresh();
    }
  }, [session?.user?.email, refresh]);

  useEffect(() => {
    if (!session?.user?.email) return;
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [session?.user?.email, refresh]);

  useEffect(() => {
    const handleXPUpdate = () => refresh();
    window.addEventListener("xp-updated", handleXPUpdate);
    return () => window.removeEventListener("xp-updated", handleXPUpdate);
  }, [refresh]);

  // ✅ Compute progress within current level
  const xpProgress = getXPProgress(stats.xp);

  return {
    stats,
    refresh,
    loading,
    xpProgress,
  };
}
