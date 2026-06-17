"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
        </div>

        {/* Error code */}
        <div className="space-y-2">
          <h1 className="text-7xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-bold text-foreground">
            Seite nicht gefunden
          </h2>
          <p className="text-muted-foreground">Page not found</p>
          <p className="text-sm text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        {/* German vocab card style */}
        <div className="bg-card border border-border rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">die Seite</span>
            <span className="text-xs text-muted-foreground font-mono">
              /ˈzaɪtə/
            </span>
          </div>
          <p className="text-sm text-foreground">the page</p>
          <p className="text-xs text-muted-foreground">
            Diese Seite existiert nicht. — This page does not exist.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex-1 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
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
