import routineTemplatesData from "@/data/routines.json";
import evidenceData from "@/data/evidence.json";
import { catalog } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import type { Intent } from "@/lib/queryClassifier";

export interface EvidenceEntry {
  id: string;
  claim: string;
  strength: string;
  study_count: number;
  plain_summary: string;
  sources: { title: string; journal: string; year: number; url: string }[];
  applies_to_tags: string[];
}

interface RoutineStep {
  step: string;
  subcategory: string;
  catalog_tags: string[];
  evidence_id: string | null;
  optional?: boolean;
}

interface RoutineTemplate {
  id: string;
  title: string;
  trigger_tags: string[];
  reviewed_by: string;
  steps: RoutineStep[];
  skip_candidates: { catalog_tags: string[]; note: string }[];
}

const evidence = evidenceData as EvidenceEntry[];
const templates = routineTemplatesData as RoutineTemplate[];

export interface RoutineItem {
  step: string;
  product: Product;
  why: string;
  evidence?: EvidenceEntry;
}

export interface ComposedRoutine {
  title: string;
  reviewedBy: string;
  items: RoutineItem[];
  skipNote: string | null;
  totalPrice: number;
}

// Keyed by catalog tag, not step name, so the "why" text can only ever
// describe an ingredient/property the selected product actually has —
// a routine's step name (e.g. "serum") says nothing about which active
// ingredient a given routine variant actually needs.
const TAG_WHY: [string, (p: Product) => string][] = [
  ["ceramide", () => `Ceramide formula — repairs the barrier that's making skin feel tight.`],
  ["hyaluronic_acid", () => `Hyaluronic acid — pulls extra moisture into the skin and helps it stay there.`],
  ["niacinamide", () => `Niacinamide — reduces excess oil and calms breakout-prone skin.`],
  ["salicylic_acid", () => `Salicylic acid — clears out pores and reduces acne-causing buildup.`],
  ["sun_protection", () => `Broad-spectrum sunscreen — daily use is proven to slow visible skin aging.`],
  ["fragrance_free", (p) => `${p.brand} — fragrance-free and gentle enough for daily use.`],
  ["high_protein", (p) => `${p.name} — a solid protein source to build your day around.`],
  ["fiber", (p) => `${p.name} — adds fiber that most diets fall short on.`],
  ["probiotic", (p) => `${p.name} — probiotic-rich, a good pick alongside a high-protein day.`],
  ["vegetarian_protein", (p) => `${p.name} — a plant-based protein pick.`],
  ["whey", (p) => `${p.name} — fast-digesting protein that's easy to fit around workouts.`],
  ["creatine", (p) => `${p.name} — well-studied for strength gains alongside resistance training.`],
  ["beard_growth", (p) => `${p.name} — softens the beard and supports the skin underneath as it grows in.`],
  ["trimmer", (p) => `${p.name} — keeps growth even while it fills in.`],
  ["beard_care", (p) => `${p.name} — keeps the beard and skin underneath clean without over-drying.`],
  ["warm_light", (p) => `${p.name} — warm, dim light in the evening supports natural melatonin release.`],
  ["journaling_habit", (p) => `${p.name} — a low-effort way to try reflective journaling before bed.`],
];

function deriveWhy(product: Product, ev: EvidenceEntry | undefined): string {
  // A step's own evidence claim (when assigned in routines.json) always wins —
  // it reflects the reasoning that step was built for. Tag-based text is only
  // a fallback for steps with no evidence_id, so it can never contradict a
  // claim tied to a different property the product happens to also carry
  // (e.g. a sunscreen that also carries an incidental niacinamide tag).
  if (ev) return ev.claim.endsWith(".") ? ev.claim : ev.claim + ".";
  for (const [tag, fn] of TAG_WHY) {
    if (product.tags.includes(tag)) return fn(product);
  }
  return `${product.name} fits this routine.`;
}

function pickProduct(subcategory: string, tags: string[], usedIds: Set<string>): Product | undefined {
  const pool = catalog.filter((p) => p.subcategory === subcategory && !usedIds.has(p.id));
  return (
    pool.find((p) => tags.every((t) => p.tags.includes(t))) ??
    pool.find((p) => tags.some((t) => p.tags.includes(t))) ??
    pool[0]
  );
}

export function composeRoutine(routineId: string): ComposedRoutine | null {
  const template = templates.find((t) => t.id === routineId);
  if (!template) return null;

  const items: RoutineItem[] = [];
  const usedIds = new Set<string>();
  for (const step of template.steps) {
    const product = pickProduct(step.subcategory, step.catalog_tags, usedIds);
    if (!product) continue;
    usedIds.add(product.id);
    const ev = step.evidence_id ? evidence.find((e) => e.id === step.evidence_id) : undefined;
    const why = deriveWhy(product, ev);
    items.push({ step: step.step, product, why, evidence: ev });
  }

  const skipNote = template.skip_candidates[0]?.note ?? null;
  const totalPrice = items.reduce((sum, i) => sum + i.product.price, 0);

  return { title: template.title, reviewedBy: template.reviewed_by, items, skipNote, totalPrice };
}

export function getRoutineIdForIntent(intent: Intent, answers: string[]): string | null {
  switch (intent) {
    case "dry_skin":
      return "routine-dry-skin-starter";
    case "oily_acne":
      return "routine-oily-acne-basic";
    case "skin_general": {
      // The consult's own first question (skin type) resolves the
      // ambiguity a generic "skin routine" search query left open.
      const skinType = answers[0]?.toLowerCase() ?? "";
      return skinType.includes("dry") || skinType.includes("sensitive")
        ? "routine-dry-skin-starter"
        : "routine-oily-acne-basic";
    }
    case "high_protein": {
      const diet = answers[0]?.toLowerCase() ?? "";
      return diet.includes("veg") && !diet.includes("non") && !diet.includes("egg")
        ? "routine-high-protein-veg"
        : "routine-high-protein-nonveg";
    }
    case "beard":
      return "routine-beard-grooming-starter";
    case "sleep":
      return "routine-wind-down-sleep";
    default:
      return null;
  }
}

export function buildComposedFromLLM(output: {
  routine_title: string;
  items: { sku_id: string; why: string; evidence_id: string | null }[];
  skip_note: string | null;
}): ComposedRoutine {
  const items: RoutineItem[] = output.items
    .map((i) => {
      const product = catalog.find((p) => p.id === i.sku_id);
      if (!product) return null;
      const ev = i.evidence_id ? evidence.find((e) => e.id === i.evidence_id) : undefined;
      return { step: "", product, why: i.why, evidence: ev } as RoutineItem;
    })
    .filter((i): i is RoutineItem => i !== null);

  const totalPrice = items.reduce((sum, i) => sum + i.product.price, 0);

  return {
    title: output.routine_title,
    reviewedBy: "AI-composed and validated against the catalog & evidence base",
    items,
    skipNote: output.skip_note,
    totalPrice,
  };
}
