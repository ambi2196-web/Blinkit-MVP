import { NextRequest, NextResponse } from "next/server";
import { classifyQuery } from "@/lib/queryClassifier";
import { getRoutineIdForIntent, composeRoutine, buildComposedFromLLM } from "@/lib/routineEngine";
import { buildPrompt } from "@/lib/promptBuilder";
import { callGroq } from "@/lib/groqClient";
import { parseAndValidate } from "@/lib/validateRoutineOutput";
import { checkBlockedTopic } from "@/lib/blockedTopics";
import { checkRateLimit } from "@/lib/rateLimiter";

interface ConsultRequestBody {
  query: string;
  answers: string[];
}

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function POST(req: NextRequest) {
  let body: ConsultRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const query = (body.query ?? "").trim();
  const answers = Array.isArray(body.answers) ? body.answers : [];

  const blockedResponse = checkBlockedTopic(query) ?? checkBlockedTopic(answers.join(" "));
  if (blockedResponse) {
    return NextResponse.json({ blocked: true, message: blockedResponse });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    const message =
      rateLimit.reason === "global"
        ? "This demo is warming up again — please try again in a bit."
        : "You've hit the demo's per-session limit. Please try again a little later.";
    return NextResponse.json({ rateLimited: true, message }, { status: 429 });
  }

  const intent = classifyQuery(query);
  if (!intent) {
    return NextResponse.json({ error: "Could not classify a routine type for this query." }, { status: 400 });
  }

  const routineId = getRoutineIdForIntent(intent, answers);
  if (!routineId) {
    return NextResponse.json({ error: "No routine template for this intent." }, { status: 400 });
  }

  const fallback = () => {
    const routine = composeRoutine(routineId);
    return NextResponse.json({ routine, source: "fallback" });
  };

  if (!process.env.GROQ_API_KEY) {
    return fallback();
  }

  const prompt = buildPrompt(routineId, answers);
  if (!prompt) return fallback();

  try {
    const first = await callGroq([
      { role: "system", content: prompt.system },
      { role: "user", content: "Compose the routine now, following the rules exactly." },
    ]);

    let { output, result } = parseAndValidate(first);

    if (!result.valid) {
      console.error("[/api/consult] first attempt invalid:", result.errors, "raw:", first);
      const retry = await callGroq([
        { role: "system", content: prompt.system },
        { role: "user", content: "Compose the routine now, following the rules exactly." },
        { role: "system", content: `Your previous response had these problems, fix them and respond again with ONLY the corrected JSON object: ${result.errors.join("; ")}` },
      ]);
      ({ output, result } = parseAndValidate(retry));
      if (!result.valid) {
        console.error("[/api/consult] retry also invalid:", result.errors, "raw:", retry);
      }
    }

    if (!result.valid || !output) {
      return fallback();
    }

    return NextResponse.json({ routine: buildComposedFromLLM(output), source: "llm" });
  } catch (err) {
    console.error("[/api/consult] Groq call threw:", err);
    return fallback();
  }
}
