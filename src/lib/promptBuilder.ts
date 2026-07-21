import { catalog } from "@/lib/catalog";
import evidenceData from "@/data/evidence.json";
import routineTemplatesData from "@/data/routines.json";
import type { EvidenceEntry } from "@/lib/routineEngine";

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

export interface PromptBundle {
  template: RoutineTemplate;
  catalogSlice: { id: string; name: string; brand: string; price: number; size: string; subcategory: string; tags: string[] }[];
  evidenceSlice: { id: string; claim: string; strength: string; study_count: number }[];
  system: string;
}

export function buildPrompt(routineId: string, answers: string[]): PromptBundle | null {
  const template = templates.find((t) => t.id === routineId);
  if (!template) return null;

  const subcats = new Set(template.steps.map((s) => s.subcategory));
  const catalogSlice = catalog
    .filter((p) => subcats.has(p.subcategory))
    .map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      size: p.size,
      subcategory: p.subcategory,
      tags: p.tags,
    }));

  const evidenceIds = new Set(template.steps.map((s) => s.evidence_id).filter(Boolean) as string[]);
  const evidenceSlice = evidence
    .filter((e) => evidenceIds.has(e.id))
    .map((e) => ({ id: e.id, claim: e.claim, strength: e.strength, study_count: e.study_count }));

  const stepsList = template.steps
    .map((s) => `- ${s.step} (${s.subcategory}${s.optional ? ", optional" : ""})`)
    .join("\n");

  const system = `You are Ritual, an evidence-based routine advisor embedded in the Blinkit grocery/quick-commerce app.

Task: compose a routine titled around "${template.title}" using the user's consult answers: ${JSON.stringify(
    answers
  )}.

Rules (do not break these):
1. Recommend ONLY products from the CATALOG list below. Never invent a product or sku_id.
2. Every item needs a one-sentence "why" grounded in the product and, where relevant, the evidence provided. Do not overstate evidence.
3. Use an evidence_id from the EVIDENCE list below only when that evidence entry genuinely applies to the chosen product's properties. Otherwise set evidence_id to null. Never invent an evidence_id.
4. If there's an honest "you don't need X" observation (e.g. a step with weak/preference-level evidence), include one in skip_note, else null.
5. Suggested routine steps: \n${stepsList}\n Pick one product per step (skip optional steps if nothing fits well).
6. Keep all prose concise — no more than 120 words total across all "why" fields combined.
7. Output must be a single JSON object with this exact shape and nothing else:
{"routine_title": string, "items": [{"sku_id": string, "why": string, "evidence_id": string|null}], "skip_note": string|null, "followup_suggestions": [string, string]}

CATALOG:
${JSON.stringify(catalogSlice)}

EVIDENCE:
${JSON.stringify(evidenceSlice)}`;

  return { template, catalogSlice, evidenceSlice, system };
}
