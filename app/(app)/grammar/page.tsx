"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const speak = (text: string) => {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "de-DE";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
};

function ExampleRow({ german, english }: { german: string; english: string }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 group">
      <div className="flex-1">
        <p className="text-sm font-medium text-primary">{german}</p>
        <p className="text-xs text-muted-foreground">{english}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => speak(german)}
      >
        <Volume2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export default function GrammarPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Grammar Reference</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Essential German grammar rules and examples
        </p>
      </div>

      <Tabs defaultValue="articles" className="flex flex-col">
        <TabsList className="flex flex-wrap h-auto w-auto gap-1 p-1">
          {[
            { value: "articles", label: "Articles" },
            {
              value: "conjugation",
              label: "Conjugation",
            },
            {
              value: "structure",
              label: "Sentence Structure",
            },
            { value: "cases", label: "Cases" },
            { value: "tenses", label: "Tenses" },
            { value: "mistakes", label: "Mistakes" },
          ].map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Articles */}
        <TabsContent value="articles" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Der, Die, Das — German Articles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Every German noun has a grammatical gender. There is no simple
                rule — you must learn the article with each word.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    article: "der",
                    gender: "Masculine",
                    color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
                    examples: [
                      "der Mann (man)",
                      "der Tag (day)",
                      "der Hund (dog)",
                    ],
                  },
                  {
                    article: "die",
                    gender: "Feminine",
                    color: "text-red-600 bg-red-500/10 border-red-500/20",
                    examples: [
                      "die Frau (woman)",
                      "die Stadt (city)",
                      "die Katze (cat)",
                    ],
                  },
                  {
                    article: "das",
                    gender: "Neuter",
                    color: "text-green-600 bg-green-500/10 border-green-500/20",
                    examples: [
                      "das Kind (child)",
                      "das Haus (house)",
                      "das Buch (book)",
                    ],
                  },
                ].map((g) => (
                  <div
                    key={g.article}
                    className={`p-3 rounded-xl border ${g.color}`}
                  >
                    <p className="text-2xl font-bold mb-1">{g.article}</p>
                    <p className="text-xs font-medium mb-2">{g.gender}</p>
                    {g.examples.map((e) => (
                      <p key={e} className="text-xs opacity-80">
                        {e}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-1">
                  💡 Plural — always &quot;die&quot;
                </p>
                <p className="text-xs text-muted-foreground">
                  All nouns use &quot;die&quot; in the plural form regardless of
                  their singular gender.
                </p>
                <div className="mt-2 space-y-1">
                  {[
                    ["der Hund → die Hunde", "the dog → the dogs"],
                    ["das Kind → die Kinder", "the child → the children"],
                    ["die Frau → die Frauen", "the woman → the women"],
                  ].map(([g, e]) => (
                    <div
                      key={g}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-primary">{g}</span>
                      <span className="text-muted-foreground">{e}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => speak(g.split("→")[0])}
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verb Conjugation */}
        <TabsContent value="conjugation" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verb Conjugation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  verb: "sein (to be)",
                  forms: [
                    ["ich", "bin", "I am"],
                    ["du", "bist", "you are"],
                    ["er/sie/es", "ist", "he/she/it is"],
                    ["wir", "sind", "we are"],
                    ["ihr", "seid", "you (pl) are"],
                    ["sie/Sie", "sind", "they/you are"],
                  ],
                },
                {
                  verb: "haben (to have)",
                  forms: [
                    ["ich", "habe", "I have"],
                    ["du", "hast", "you have"],
                    ["er/sie/es", "hat", "he/she/it has"],
                    ["wir", "haben", "we have"],
                    ["ihr", "habt", "you (pl) have"],
                    ["sie/Sie", "haben", "they/you have"],
                  ],
                },
                {
                  verb: "lernen (to learn) — regular",
                  forms: [
                    ["ich", "lerne", "I learn"],
                    ["du", "lernst", "you learn"],
                    ["er/sie/es", "lernt", "he/she/it learns"],
                    ["wir", "lernen", "we learn"],
                    ["ihr", "lernt", "you (pl) learn"],
                    ["sie/Sie", "lernen", "they/you learn"],
                  ],
                },
              ].map((v) => (
                <div key={v.verb}>
                  <h3 className="text-sm font-semibold mb-2 text-primary">
                    {v.verb}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {v.forms.map(([pronoun, form, eng]) => (
                      <div
                        key={pronoun}
                        className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 group"
                      >
                        <span className="text-xs text-muted-foreground w-16 shrink-0">
                          {pronoun}
                        </span>
                        <span className="text-sm font-semibold text-primary flex-1">
                          {form}
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {eng}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => speak(`${pronoun} ${form}`)}
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sentence Structure */}
        <TabsContent value="structure" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                German Sentence Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "1. Basic Word Order (SVO)",
                  description:
                    "German follows Subject-Verb-Object order in simple sentences.",
                  examples: [
                    ["Ich lerne Deutsch.", "I learn German."],
                    ["Der Mann kauft ein Buch.", "The man buys a book."],
                    ["Die Frau trinkt Kaffee.", "The woman drinks coffee."],
                  ],
                },
                {
                  title: "2. V2 Rule",
                  description:
                    "The verb must always be the second element in a main clause.",
                  examples: [
                    ["Heute lerne ich Deutsch.", "Today I learn German."],
                    ["Morgen kommt er nach Hause.", "Tomorrow he comes home."],
                    ["Jetzt essen wir.", "Now we eat."],
                  ],
                },
                {
                  title: "3. Subordinate Clauses (verb at end)",
                  description:
                    "In subordinate clauses introduced by conjunctions, the verb goes to the end.",
                  examples: [
                    [
                      "Ich weiß, dass er Deutsch lernt.",
                      "I know that he learns German.",
                    ],
                    [
                      "Er kommt, weil er müde ist.",
                      "He comes because he is tired.",
                    ],
                    ["Ich gehe, wenn du kommst.", "I go when you come."],
                  ],
                },
                {
                  title: "4. Separable Verbs",
                  description:
                    "Some verbs have a separable prefix that goes to the end of the sentence.",
                  examples: [
                    ["Ich stehe um 7 Uhr auf.", "I get up at 7 o'clock."],
                    ["Er ruft seine Mutter an.", "He calls his mother."],
                    ["Wir kommen um 5 Uhr an.", "We arrive at 5 o'clock."],
                  ],
                },
              ].map((rule) => (
                <div key={rule.title}>
                  <h3 className="text-sm font-semibold text-primary mb-1">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {rule.description}
                  </p>
                  <div className="space-y-1.5">
                    {rule.examples.map(([g, e]) => (
                      <ExampleRow key={g} german={g} english={e} />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cases */}
        <TabsContent value="cases" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">German Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                German has 4 cases. The case determines the article form and the
                role of the noun in the sentence.
              </p>

              {/* Article table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 text-xs font-semibold text-muted-foreground">
                        Case
                      </th>
                      <th className="text-center p-2 text-xs font-semibold text-blue-600">
                        Masc
                      </th>
                      <th className="text-center p-2 text-xs font-semibold text-red-600">
                        Fem
                      </th>
                      <th className="text-center p-2 text-xs font-semibold text-green-600">
                        Neut
                      </th>
                      <th className="text-center p-2 text-xs font-semibold text-purple-600">
                        Plural
                      </th>
                      <th className="text-left p-2 text-xs font-semibold text-muted-foreground">
                        Use
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Nominativ", "der", "die", "das", "die", "Subject"],
                      [
                        "Akkusativ",
                        "den",
                        "die",
                        "das",
                        "die",
                        "Direct object",
                      ],
                      ["Dativ", "dem", "der", "dem", "den", "Indirect object"],
                      ["Genitiv", "des", "der", "des", "der", "Possession"],
                    ].map(([cas, masc, fem, neut, pl, use]) => (
                      <tr key={cas} className="border-b border-border/50">
                        <td className="p-2 text-xs font-medium">{cas}</td>
                        <td className="p-2 text-xs text-center font-mono text-blue-600">
                          {masc}
                        </td>
                        <td className="p-2 text-xs text-center font-mono text-red-600">
                          {fem}
                        </td>
                        <td className="p-2 text-xs text-center font-mono text-green-600">
                          {neut}
                        </td>
                        <td className="p-2 text-xs text-center font-mono text-purple-600">
                          {pl}
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">
                          {use}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Examples */}
              <div className="space-y-3">
                {[
                  {
                    case: "Nominativ",
                    badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                    examples: [
                      ["Der Mann schläft.", "The man sleeps. (subject)"],
                      ["Die Frau arbeitet.", "The woman works. (subject)"],
                    ],
                  },
                  {
                    case: "Akkusativ",
                    badge: "bg-red-500/10 text-red-600 border-red-500/20",
                    examples: [
                      ["Ich sehe den Mann.", "I see the man. (direct object)"],
                      [
                        "Er kauft das Buch.",
                        "He buys the book. (direct object)",
                      ],
                    ],
                  },
                  {
                    case: "Dativ",
                    badge: "bg-green-500/10 text-green-600 border-green-500/20",
                    examples: [
                      [
                        "Ich helfe dem Mann.",
                        "I help the man. (indirect object)",
                      ],
                      [
                        "Er gibt der Frau ein Buch.",
                        "He gives the woman a book.",
                      ],
                    ],
                  },
                  {
                    case: "Genitiv",
                    badge:
                      "bg-purple-500/10 text-purple-600 border-purple-500/20",
                    examples: [
                      ["Das Buch des Mannes.", "The man's book. (possession)"],
                      ["Die Tasche der Frau.", "The woman's bag. (possession)"],
                    ],
                  },
                ].map((c) => (
                  <div key={c.case}>
                    <Badge
                      variant="outline"
                      className={`text-xs mb-2 ${c.badge}`}
                    >
                      {c.case}
                    </Badge>
                    <div className="space-y-1.5">
                      {c.examples.map(([g, e]) => (
                        <ExampleRow key={g} german={g} english={e} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tenses */}
        <TabsContent value="tenses" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">German Tenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  tense: "Präsens (Present)",
                  desc: "Used for current actions and general truths",
                  badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                  examples: [
                    [
                      "Ich lerne Deutsch.",
                      "I learn German. / I am learning German.",
                    ],
                    ["Er arbeitet jeden Tag.", "He works every day."],
                    ["Wir essen Brot.", "We eat bread."],
                  ],
                },
                {
                  tense: "Perfekt (Present Perfect)",
                  desc: "Most common past tense in spoken German. Formed with haben/sein + past participle.",
                  badge: "bg-green-500/10 text-green-600 border-green-500/20",
                  examples: [
                    [
                      "Ich habe Deutsch gelernt.",
                      "I have learned German. / I learned German.",
                    ],
                    ["Er ist nach Hause gegangen.", "He went home."],
                    ["Wir haben gegessen.", "We have eaten."],
                  ],
                },
                {
                  tense: "Präteritum (Simple Past)",
                  desc: "Used mainly in written language and with sein/haben/modal verbs.",
                  badge:
                    "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
                  examples: [
                    ["Ich war müde.", "I was tired."],
                    ["Er hatte ein Buch.", "He had a book."],
                    ["Sie lernte Deutsch.", "She learned German."],
                  ],
                },
                {
                  tense: "Futur I (Future)",
                  desc: "Formed with werden + infinitive. Often replaced by Präsens with a time expression.",
                  badge:
                    "bg-purple-500/10 text-purple-600 border-purple-500/20",
                  examples: [
                    ["Ich werde Deutsch lernen.", "I will learn German."],
                    ["Er wird kommen.", "He will come."],
                    ["Wir werden essen.", "We will eat."],
                  ],
                },
              ].map((t) => (
                <div key={t.tense}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-xs ${t.badge}`}>
                      {t.tense}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{t.desc}</p>
                  <div className="space-y-1.5">
                    {t.examples.map(([g, e]) => (
                      <ExampleRow key={g} german={g} english={e} />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Common Mistakes */}
        <TabsContent value="mistakes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Common Mistakes for Bangla/English Speakers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "1. Forgetting the article",
                  desc: "Always learn the article with every noun.",
                  wrong: "Ich kaufe Buch.",
                  correct: "Ich kaufe ein Buch.",
                  explanation: "German requires an article before most nouns.",
                },
                {
                  title: "2. Wrong verb position",
                  desc: "The verb must be second in main clauses.",
                  wrong: "Heute ich lerne Deutsch.",
                  correct: "Heute lerne ich Deutsch.",
                  explanation:
                    "When a time expression starts the sentence, verb comes second.",
                },
                {
                  title: "3. Mixing up sein vs haben",
                  desc: "Movement/change verbs use sein; most others use haben.",
                  wrong: "Ich habe nach Hause gegangen.",
                  correct: "Ich bin nach Hause gegangen.",
                  explanation: "gehen (to go) uses sein in Perfekt.",
                },
                {
                  title: "4. Adjective endings",
                  desc: "Adjectives change their endings based on gender and case.",
                  wrong: "Ich sehe ein groß Haus.",
                  correct: "Ich sehe ein großes Haus.",
                  explanation:
                    "Adjectives need endings: -es for neuter accusative with indefinite article.",
                },
                {
                  title: "5. Using nicht vs kein",
                  desc: "Kein negates nouns; nicht negates everything else.",
                  wrong: "Ich habe nicht Buch.",
                  correct: "Ich habe kein Buch.",
                  explanation: "Use kein to negate nouns (not, no, not a).",
                },
                {
                  title: "6. Capitalizing nouns",
                  desc: "All German nouns are always capitalized.",
                  wrong: "Das ist ein sehr gutes buch.",
                  correct: "Das ist ein sehr gutes Buch.",
                  explanation:
                    "Every noun in German must start with a capital letter.",
                },
              ].map((m) => (
                <div key={m.title} className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {m.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs font-medium text-red-600 mb-1">
                        ❌ Wrong
                      </p>
                      <p className="text-sm font-medium">{m.wrong}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 group">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-green-600">
                          ✅ Correct
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 opacity-0 group-hover:opacity-100"
                          onClick={() => speak(m.correct)}
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium">{m.correct}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                    💡 {m.explanation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
