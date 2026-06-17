"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Etwas ist schiefgelaufen
          </h1>
          <p className="text-muted-foreground">Something went wrong</p>
          {error.message && (
            <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3 font-mono text-left break-all">
              {error.message}
            </p>
          )}
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        {/* German vocab style */}
        <div className="bg-card border border-border rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">der Fehler</span>
            <span className="text-xs text-muted-foreground font-mono">
              /ˈfeːlɐ/
            </span>
          </div>
          <p className="text-sm text-foreground">the error / mistake</p>
          <p className="text-xs text-muted-foreground">
            Ein Fehler ist aufgetreten. — An error has occurred.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={reset} variant="outline" className="flex-1 gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            className="flex-1 gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
