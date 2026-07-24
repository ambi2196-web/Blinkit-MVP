import { fuzzyPhraseMatch } from "@/lib/fuzzyMatch";

export type Intent = "dry_skin" | "oily_acne" | "skin_general" | "high_protein" | "beard" | "sleep";

// Order matters: classifyQuery returns the first match, so specific
// skin-type intents (dry_skin, oily_acne) must be checked before the
// generic skin_general fallback, or a clearly-specified query like
// "dry skin" would get routed to the generic path instead.
const INTENT_KEYWORDS: Record<Intent, string[]> = {
  dry_skin: ["dry skin", "dry face", "flaky skin", "tight skin", "skin feels tight"],
  oily_acne: ["oily skin", "acne", "pimple", "breakout", "acne prone", "acne-prone"],
  skin_general: ["skin routine", "skin care", "skincare", "skin"],
  high_protein: ["protein", "high protein", "muscle", "gym diet", "bulk", "bulking"],
  beard: ["beard", "beard growth", "beard care", "patchy beard"],
  sleep: ["sleep", "wind down", "wind-down", "insomnia", "better sleep", "sleep routine"],
};

export const INTENT_LABELS: Record<Intent, string> = {
  dry_skin: "dry-skin routine",
  oily_acne: "oily / acne-prone routine",
  skin_general: "skin routine",
  high_protein: "high-protein routine",
  beard: "beard-grooming routine",
  sleep: "wind-down routine",
};

export function classifyQuery(query: string): Intent | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS) as [Intent, string[]][]) {
    if (keywords.some((k) => fuzzyPhraseMatch(q, k))) return intent;
  }
  return null;
}
