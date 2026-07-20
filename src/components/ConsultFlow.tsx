"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { INTENT_QUESTIONS } from "@/lib/consultQuestions";
import { composeRoutine, getRoutineIdForIntent } from "@/lib/routineEngine";
import type { Intent } from "@/lib/queryClassifier";
import RoutineCard from "@/components/RoutineCard";

const VALID_INTENTS = Object.keys(INTENT_QUESTIONS) as Intent[];

export default function ConsultFlow() {
  const searchParams = useSearchParams();
  const intentParam = searchParams.get("intent");
  const intent = VALID_INTENTS.includes(intentParam as Intent) ? (intentParam as Intent) : null;

  const [answers, setAnswers] = useState<string[]>([]);
  const [building, setBuilding] = useState(false);

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

  const handleAnswer = (option: string) => {
    const next = [...answers, option];
    setAnswers(next);
    if (next.length >= questions.length) {
      setBuilding(true);
      setTimeout(() => setBuilding(false), 700);
    }
  };

  if (isDone && !building) {
    const routineId = getRoutineIdForIntent(intent, answers);
    const routine = routineId ? composeRoutine(routineId) : null;

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
