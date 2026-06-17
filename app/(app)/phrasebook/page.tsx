"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Volume2, Copy, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Phrase {
  german: string;
  english: string;
  bangla?: string;
}

const PHRASEBOOK: Record<string, Phrase[]> = {
  Greetings: [
    {
      german: "Guten Morgen!",
      english: "Good morning!",
      bangla: "শুভ সকাল!",
    },
    {
      german: "Guten Tag!",
      english: "Good day!",
      bangla: "শুভ দিন!",
    },
    {
      german: "Guten Abend!",
      english: "Good evening!",
      bangla: "শুভ সন্ধ্যা!",
    },
    {
      german: "Gute Nacht!",
      english: "Good night!",
      bangla: "শুভ রাত্রি!",
    },
    {
      german: "Hallo! Wie geht es Ihnen?",
      english: "Hello! How are you?",
      bangla: "হ্যালো! আপনি কেমন আছেন?",
    },
    {
      german: "Mir geht es gut, danke!",
      english: "I am fine, thank you!",
      bangla: "আমি ভালো আছি, ধন্যবাদ!",
    },
    {
      german: "Auf Wiedersehen!",
      english: "Goodbye!",
      bangla: "বিদায়!",
    },
    {
      german: "Tschüss!",
      english: "Bye! (informal)",
      bangla: "বাই!",
    },
    {
      german: "Bitte.",
      english: "Please.",
      bangla: "দয়া করে।",
    },
    {
      german: "Danke schön!",
      english: "Thank you very much!",
      bangla: "অনেক ধন্যবাদ!",
    },
    {
      german: "Entschuldigung!",
      english: "Excuse me / Sorry!",
      bangla: "মাফ করবেন!",
    },
    {
      german: "Es tut mir leid.",
      english: "I am sorry.",
      bangla: "আমি দুঃখিত।",
    },
  ],
  Restaurant: [
    {
      german: "Einen Tisch für zwei Personen, bitte.",
      english: "A table for two, please.",
    },
    {
      german: "Die Speisekarte, bitte.",
      english: "The menu, please.",
    },
    {
      german: "Ich möchte bestellen.",
      english: "I would like to order.",
    },
    {
      german: "Was empfehlen Sie?",
      english: "What do you recommend?",
    },
    {
      german: "Ich bin Vegetarier.",
      english: "I am a vegetarian.",
    },
    {
      german: "Das schmeckt sehr gut!",
      english: "This tastes very good!",
    },
    {
      german: "Die Rechnung, bitte.",
      english: "The bill, please.",
    },
    {
      german: "Wo ist die Toilette?",
      english: "Where is the toilet?",
    },
    {
      german: "Ich habe eine Allergie.",
      english: "I have an allergy.",
    },
    {
      german: "Ohne Fleisch, bitte.",
      english: "Without meat, please.",
    },
  ],
  Travel: [
    {
      german: "Wo ist der Bahnhof?",
      english: "Where is the train station?",
    },
    {
      german: "Wie viel kostet das?",
      english: "How much does that cost?",
    },
    {
      german: "Ich verstehe nicht.",
      english: "I do not understand.",
    },
    {
      german: "Sprechen Sie Englisch?",
      english: "Do you speak English?",
    },
    {
      german: "Können Sie das bitte wiederholen?",
      english: "Can you please repeat that?",
    },
    {
      german: "Ich suche das Hotel.",
      english: "I am looking for the hotel.",
    },
    {
      german: "Wie komme ich zum Flughafen?",
      english: "How do I get to the airport?",
    },
    {
      german: "Eine Fahrkarte nach Berlin, bitte.",
      english: "One ticket to Berlin, please.",
    },
    {
      german: "Wann fährt der nächste Zug?",
      english: "When does the next train leave?",
    },
    {
      german: "Ich habe meinen Pass verloren.",
      english: "I have lost my passport.",
    },
  ],
  Shopping: [
    {
      german: "Ich schaue mich nur um.",
      english: "I am just looking around.",
    },
    {
      german: "Haben Sie das in meiner Größe?",
      english: "Do you have this in my size?",
    },
    {
      german: "Kann ich das anprobieren?",
      english: "Can I try this on?",
    },
    {
      german: "Zu teuer!",
      english: "Too expensive!",
    },
    {
      german: "Haben Sie etwas Günstigeres?",
      english: "Do you have something cheaper?",
    },
    {
      german: "Ich nehme es.",
      english: "I will take it.",
    },
    {
      german: "Wo ist die Kasse?",
      english: "Where is the cash register?",
    },
    {
      german: "Kann ich mit Karte zahlen?",
      english: "Can I pay by card?",
    },
  ],
  University: [
    {
      german: "Wo ist die Bibliothek?",
      english: "Where is the library?",
    },
    {
      german: "Ich studiere Deutsch.",
      english: "I study German.",
    },
    {
      german: "Wann beginnt die Vorlesung?",
      english: "When does the lecture start?",
    },
    {
      german: "Ich habe eine Frage.",
      english: "I have a question.",
    },
    {
      german: "Können Sie das bitte erklären?",
      english: "Can you please explain that?",
    },
    {
      german: "Ich verstehe die Aufgabe nicht.",
      english: "I do not understand the task.",
    },
    {
      german: "Wann ist die Prüfung?",
      english: "When is the exam?",
    },
    {
      german: "Ich muss noch lernen.",
      english: "I still need to study.",
    },
  ],
  Emergency: [
    {
      german: "Hilfe!",
      english: "Help!",
    },
    {
      german: "Rufen Sie die Polizei!",
      english: "Call the police!",
    },
    {
      german: "Rufen Sie einen Arzt!",
      english: "Call a doctor!",
    },
    {
      german: "Ich brauche einen Krankenwagen.",
      english: "I need an ambulance.",
    },
    {
      german: "Ich bin verletzt.",
      english: "I am injured.",
    },
    {
      german: "Wo ist das nächste Krankenhaus?",
      english: "Where is the nearest hospital?",
    },
    {
      german: "Es ist ein Notfall!",
      english: "It is an emergency!",
    },
    {
      german: "Ich habe mein Handy verloren.",
      english: "I have lost my phone.",
    },
  ],
};

export default function PhrasebookPage() {
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("Greetings");

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const toggleFavorite = (german: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(german)) {
        next.delete(german);
      } else {
        next.add(german);
      }
      return next;
    });
  };

  // Search across all categories
  const searchResults =
    search.trim().length > 0
      ? Object.entries(PHRASEBOOK).flatMap(([cat, phrases]) =>
          phrases
            .filter(
              (p) =>
                p.german.toLowerCase().includes(search.toLowerCase()) ||
                p.english.toLowerCase().includes(search.toLowerCase()),
            )
            .map((p) => ({ ...p, category: cat })),
        )
      : [];

  const favoritesList = Object.values(PHRASEBOOK)
    .flat()
    .filter((p) => favorites.has(p.german));

  const PhraseCard = ({
    phrase,
    category,
  }: {
    phrase: Phrase;
    category?: string;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group">
      <div className="flex-1 min-w-0 mr-3">
        <p className="font-medium text-sm text-primary">{phrase.german}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{phrase.english}</p>
        {phrase.bangla && (
          <p className="text-xs text-muted-foreground">{phrase.bangla}</p>
        )}
        {category && (
          <Badge variant="outline" className="text-xs mt-1">
            {category}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => speak(phrase.german)}
        >
          <Volume2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => copy(phrase.german)}
        >
          <Copy className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => toggleFavorite(phrase.german)}
        >
          <Star
            className={cn(
              "w-3.5 h-3.5",
              favorites.has(phrase.german)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground",
            )}
          />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Phrasebook</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Common German phrases for everyday situations
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search phrases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Search Results */}
      {search.trim().length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No phrases found
              </p>
            ) : (
              searchResults.map((p) => (
                <PhraseCard key={p.german} phrase={p} category={p.category} />
              ))
            )}
          </CardContent>
        </Card>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col"
        >
          <TabsList className="flex flex-wrap w-auto h-auto gap-1 p-1">
            {[...Object.keys(PHRASEBOOK), "⭐ Favorites"].map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs font-bold">
                {cat}
                {cat === "⭐ Favorites" && favorites.size > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                  >
                    {favorites.size}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(PHRASEBOOK).map(([cat, phrases]) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <Card>
                <CardContent className="p-4 space-y-2">
                  {phrases.map((phrase) => (
                    <PhraseCard key={phrase.german} phrase={phrase} />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          <TabsContent value="⭐ Favorites" className="mt-4">
            <Card>
              <CardContent className="p-4">
                {favoritesList.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No favorites yet. Click the star on any phrase!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {favoritesList.map((phrase) => (
                      <PhraseCard key={phrase.german} phrase={phrase} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
