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
  followup?: string;
  routineContext?: { title: string; items: { name: string; why: string }[] };
}

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

async function handleFollowup(
  body: ConsultRequestBody,
  followup: string
): Promise<NextResponse> {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { answer: "Follow-up answers need a live connection that isn't configured right now — please check back later." },
      { status: 200 }
    );
  }

  const routineContext = body.routineContext;
  const itemsList = routineContext?.items.map((i) => `- ${i.name}: ${i.why}`).join("\n") ?? "(no routine context)";

  const system = `You are Ritual, an evidence-based routine advisor embedded in the Blinkit app. The user just received this routine: "${
    routineContext?.title ?? "their routine"
  }".
Items in the routine:
${itemsList}

Answer the user's follow-up question about this routine in under 80 words, plainly and honestly.
Rules:
- If the question asks about medical dosing, prescriptions, diagnosing a condition, pregnancy, or anything needing a doctor, say briefly that it's one for a doctor rather than guessing — do not answer the medical specifics.
- Don't invent studies or statistics you're not already grounded in.
- Don't recommend brand-new products outside this routine; you can reference the ones already listed.
- Respond with plain text only, no JSON, no markdown.`;

  try {
    const answer = await callGroq(
      [
        { role: "system", content: system },
        { role: "user", content: followup },
      ],
      { jsonMode: false, maxTokens: 200 }
    );
    return NextResponse.json({ answer: answer.trim() });
  } catch (err) {
    console.error("[/api/consult] followup call threw:", err);
    return NextResponse.json(
      { answer: "Couldn't reach the advisor just now — please try again in a moment." },
      { status: 200 }
    );
  }
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
  const followup = body.followup?.trim();

  // Blocked-topic checks are free (no LLM call) and run before the rate
  // limit is consumed, so a refused query never costs the user's quota.
  const blockedResponse = followup
    ? checkBlockedTopic(followup)
    : checkBlockedTopic(query) ?? checkBlockedTopic(answers.join(" "));
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

  if (followup) {
    return handleFollowup(body, followup);
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
