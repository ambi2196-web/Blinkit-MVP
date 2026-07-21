"use client";

import { useState } from "react";
import type { ComposedRoutine } from "@/lib/routineEngine";

const MAX_MESSAGES = 5;

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export default function FollowupChat({
  query,
  answers,
  routine,
}: {
  query: string;
  answers: string[];
  routine: ComposedRoutine;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const limitReached = userMessageCount >= MAX_MESSAGES;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || limitReached) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          answers,
          followup: text,
          routineContext: {
            title: routine.title,
            items: routine.items.map((i) => ({ name: i.product.name, why: i.why })),
          },
        }),
      });
      const data = await res.json();
      const reply = data.blocked || data.rateLimited ? data.message : data.answer;
      setMessages((prev) => [...prev, { role: "assistant", text: reply ?? "Couldn't get an answer just now." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Couldn't reach the advisor just now — please try again." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Ask a follow-up
      </p>

      <div className="flex flex-col gap-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "max-w-[85%] self-end rounded-2xl rounded-tr-sm bg-[#0C831F] px-3 py-2 text-sm text-white"
                : "max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-gray-100 px-3 py-2 text-sm text-gray-800"
            }
          >
            {m.text}
          </div>
        ))}
        {sending && (
          <div className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-gray-100 px-3 py-2 text-sm text-gray-500">
            Thinking…
          </div>
        )}
      </div>

      {limitReached ? (
        <p className="mt-3 text-center text-xs text-gray-400">
          You&apos;ve reached the 5-message limit for this session.
        </p>
      ) : (
        <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. can I use this with retinol?"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0C831F]"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-lg bg-[#0C831F] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      )}
    </div>
  );
}
