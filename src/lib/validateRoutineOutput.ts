import { getProduct } from "@/lib/catalog";
import evidenceData from "@/data/evidence.json";
import type { EvidenceEntry } from "@/lib/routineEngine";

const evidence = evidenceData as EvidenceEntry[];

export interface LLMRoutineOutput {
  routine_title: string;
  items: { sku_id: string; why: string; evidence_id: string | null }[];
  skip_note: string | null;
  followup_suggestions: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function parseAndValidate(raw: string): { output: LLMRoutineOutput | null; result: ValidationResult } {
  const errors: string[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { output: null, result: { valid: false, errors: ["Response was not valid JSON."] } };
  }

  const obj = parsed as Partial<LLMRoutineOutput>;

  if (typeof obj.routine_title !== "string" || !obj.routine_title.trim()) {
    errors.push("routine_title is missing or not a string.");
  }
  if (!Array.isArray(obj.items) || obj.items.length === 0) {
    errors.push("items must be a non-empty array.");
  } else {
    obj.items.forEach((item, i) => {
      if (!item || typeof item.sku_id !== "string" || !getProduct(item.sku_id)) {
        errors.push(`items[${i}].sku_id "${item?.sku_id}" does not exist in the catalog.`);
      }
      if (!item || typeof item.why !== "string" || !item.why.trim()) {
        errors.push(`items[${i}].why is missing or not a string.`);
      }
      if (item && item.evidence_id !== null && item.evidence_id !== undefined) {
        if (typeof item.evidence_id !== "string" || !evidence.find((e) => e.id === item.evidence_id)) {
          errors.push(`items[${i}].evidence_id "${item.evidence_id}" does not exist in the evidence base.`);
        }
      }
    });
  }
  if (obj.skip_note !== null && obj.skip_note !== undefined && typeof obj.skip_note !== "string") {
    errors.push("skip_note must be a string or null.");
  }
  if (obj.followup_suggestions !== undefined && !Array.isArray(obj.followup_suggestions)) {
    errors.push("followup_suggestions must be an array of strings.");
  }

  if (errors.length > 0) {
    return { output: null, result: { valid: false, errors } };
  }

  return {
    output: {
      routine_title: obj.routine_title!,
      items: obj.items!,
      skip_note: obj.skip_note ?? null,
      followup_suggestions: obj.followup_suggestions ?? [],
    },
    result: { valid: true, errors: [] },
  };
}
