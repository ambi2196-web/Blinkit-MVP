"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { INTENT_QUESTIONS } from "@/lib/consultQuestions";
import { composeRoutine, getRoutineIdForIntent, type ComposedRoutine } from "@/lib/routineEngine";
import type { Intent } from "@/lib/queryClassifier";
import RoutineCard from "@/components/RoutineCard";

const VALID_INTENTS = Object.keys(INTENT_QUESTIONS) as Intent[];

const FALLBACK_QUERY_TEXT: Record<Intent, string> = {
  dry_skin: "dry skin",
  oily_acne: "acne",
  high_protein: "high protein",
  beard: "beard growth",
  sleep: "sleep routine",
};

interface ConsultApiResponse {
  routine?: ComposedRoutine;
  source?: "llm" | "fallback";
  blocked?: boolean;
  rateLimited?: boolean;
  message?: string;
  error?: string;
}

export default function ConsultFlow() {
  const searchParams = useSearchParams();
  const intentParam = searchParams.get("intent");
  const intent = VALID_INTENTS.includes(intentParam as Intent) ? (intentParam as Intent) : null;
  const query = searchParams.get("q") || (intent ? FALLBACK_QUERY_TEXT[intent] : "");

  const [answers, setAnswers] = useState<string[]>([]);
  const [building, setBuilding] = useState(false);
  const [routine, setRoutine] = useState<ComposedRoutine | null>(null);
  const [source, setSource] = useState<"llm" | "fallback" | null>(null);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  if (!intent) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-sm text-gray-600">
          That routine type isn&apos;t recognized. Try starting from a search like &quot;dry skin&quot;.
        </p>
        <Link href="/" className="mt-3 inline-block text-sm font-semibold text-[#0C831F]">
          ← Back home
        </Link>
      </div>
    );
  }

  const questions = INTENT_QUESTIONS[intent];
  const step = answers.length;
  const isDone = step >= questions.length;

  const buildRoutine = async (finalAnswers: string[]) => {
    setBuilding(true);
    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, answers: finalAnswers }),
      });
      const data: ConsultApiResponse = await res.json();

      if (data.blocked || data.rateLimited) {
        setBlockedMessage(data.message ?? "That's not something I can help with here.");
        setBuilding(false);
        return;
      }

      if (data.routine) {
        setRoutine(data.routine);
        setSource(data.source ?? "fallback");
        setBuilding(false);
        return;
      }

      throw new Error(data.error ?? "No routine returned");
    } catch {
      const routineId = getRoutineIdForIntent(intent, finalAnswers);
      const fallbackRoutine = routineId ? composeRoutine(routineId) : null;
      setRoutine(fallbackRoutine);
      setSource("fallback");
      setBuilding(false);
    }
  };

  const handleAnswer = (option: string) => {
    const next = [...answers, option];
    setAnswers(next);
    if (next.length >= questions.length) {
      buildRoutine(next);
    }
  };

  if (blockedMessage) {
    return (
      <div className="px-4 pt-6 text-center">
        <p className="text-sm text-gray-600">{blockedMessage}</p>
        <Link href="/" className="mt-3 inline-block text-sm font-semibold text-[#0C831F]">
          ← Back home
        </Link>
      </div>
    );
  }

  if (isDone && !building) {
    if (!routine) {
      return (
        <div className="px-4 pt-6 text-center">
          <p className="text-sm text-gray-600">Couldn&apos;t build a routine for that combination yet.</p>
          <Link href="/" className="mt-3 inline-block text-sm font-semibold text-[#0C831F]">
            ← Back home
          </Link>
        </div>
      );
    }

    return (
      <div className="px-4 pt-4 pb-6">
        {source === "fallback" && (
          <p className="mb-2 text-center text-[11px] text-gray-400">
            Showing our evidence-checked baseline routine for this combination.
          </p>
        )}
        <RoutineCard routine={routine} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
      {questions.slice(0, step).map((q, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-gray-800 shadow-sm">
            {q.question}
          </div>
          <div className="max-w-[85%] self-end rounded-2xl rounded-tr-sm bg-[#0C831F] px-3 py-2 text-sm text-white shadow-sm">
            {answers[i]}
          </div>
        </div>
      ))}

      {building ? (
        <div className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
          Building your routine…
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-gray-800 shadow-sm">
            {questions[step].question}
          </div>
          <div className="flex flex-wrap gap-2">
            {questions[step].options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="rounded-full border border-[#0C831F] px-3 py-1.5 text-sm font-medium text-[#0C831F] hover:bg-green-50"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
