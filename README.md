# Ritual by Blinkit — MVP

An evidence-based routine advisor embedded inside a Blinkit-replica UI. Type a problem ("dry skin", "high protein"), answer 3 quick questions, and get a Routine Card of real Blinkit products with evidence chips — add the whole basket to cart in one tap.

**This is a concept prototype** built for a fellowship submission. It is not affiliated with Blinkit, uses no real payments or accounts, and demonstrates a feature idea inside an existing product's UI.

## What this demonstrates

- Problem-shaped search → guided consult → multi-category basket, as one flow.
- Evidence chips that make a recommendation feel verified, not "random ChatGPT."
- Why an LLM is useful here: it turns unstructured intent ("skin feels tight after shower") into a reasoned, personalized basket — something a co-occurrence recommender can't do.
- Why it isn't just a ChatGPT wrapper: every `sku_id` and `evidence_id` the model returns is validated server-side against the real catalog and evidence base before it's shown. The model can never invent a product or a citation — invalid output triggers one retry, then falls back to a deterministic, evidence-linked baseline routine.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + Tailwind |
| AI | Groq API, `openai/gpt-oss-120b`, temperature 0.3 |
| Data | Static JSON in `src/data/` — catalog, evidence, routine templates, blocked topics |
| State | React context + `localStorage` for the cart |
| Deploy | Vercel |

## Data

- `src/data/catalog.json` — ~110 SKUs transcribed from the live Blinkit site (real names, brands, prices, sizes) across personal care, pharma/wellness, grocery, grooming, and home/habit categories.
- `src/data/evidence.json` — 15 entries, each with real, verifiable citations (PubMed/PMC/Wiley/Lancet/Annals of Internal Medicine), honestly tagged `strong` / `moderate` / `preference`.
- `src/data/routines.json` — 6 routine templates (dry-skin, oily/acne, high-protein veg/non-veg, beard-grooming, wind-down) anchoring the LLM to vetted structures instead of free-styling.
- `src/data/blocked_topics.json` — keyword guard for prescription, medical, pregnancy, minors, weight-loss-drug, and mental-health queries, checked before any Groq call.

## How the consult flow works

1. **Search intercept** (`src/lib/queryClassifier.ts`) — a cheap keyword classifier detects problem-shaped queries and surfaces a Ritual banner above normal search results.
2. **Guided consult** (`ConsultFlow.tsx`) — 3 tappable-chip questions per intent, rendered as a chat transcript.
3. **`/api/consult`** (`src/app/api/consult/route.ts`) — blocked-topic check → rate limit → build a trimmed prompt (only the catalog slice and evidence entries relevant to that routine template, to stay well under Groq's free-tier token budget) → call Groq → validate the JSON against the real catalog/evidence → one retry with the validation errors appended → graceful fallback to the deterministic composer (`routineEngine.ts`) if the LLM still fails.
4. **Routine Card** — title, total price, per-item why + evidence chip (opens a bottom sheet with the real sources), an honest "you don't need X" skip note, and add-all-to-cart.
5. **Follow-up chat** — free-text Q&A grounded in the displayed routine, capped at 5 messages per session.

## Local setup

```bash
npm install
```

Create `.env.local` in this directory:

```
GROQ_API_KEY=your-groq-api-key
```

Get a free key at [console.groq.com](https://console.groq.com). Without a key set, `/api/consult` gracefully falls back to the deterministic routine composer — the app still works, just without live LLM reasoning.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Rate limits

Groq's free tier applies per API key, not per visitor, so `/api/consult` enforces two in-memory caps (`src/lib/rateLimiter.ts`):

- 15 requests per session (per IP)
- 180 requests per day, globally, across everyone using the deployed demo

Both are generous for a small-group demo; a visitor won't come close to hitting them.

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this from the deployed app).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. In the project's **Settings → Environment Variables**, add `GROQ_API_KEY` with your key.
4. Deploy. Every push to `main` redeploys automatically.

## Non-goals

No real payments, login, order tracking, admin panel, full Blinkit catalog, open-ended medical advice, sponsored placements, or mobile app. Web-responsive, mobile-first page only.
