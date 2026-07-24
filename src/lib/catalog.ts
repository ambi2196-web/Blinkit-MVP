import rawCatalog from "@/data/catalog.json";
import type { CategoryTile, Product } from "@/lib/types";
import { tokenize, fuzzyTokenMatch, filterStopwords } from "@/lib/fuzzyMatch";

export const catalog = rawCatalog as Product[];

export function getProduct(id: string): Product | undefined {
  return catalog.find((p) => p.id === id);
}

// Everyday words for a concept the catalog only tags differently —
// e.g. products are tagged "fragrance", not "smell".
const SEARCH_SYNONYMS: Record<string, string[]> = {
  smell: ["fragrance", "perfume", "scent"],
  scent: ["fragrance", "perfume"],
  fragrant: ["fragrance"],
  hydrating: ["hydration", "hyaluronic"],
  gym: ["workout", "muscle_building"],
};

function expandSynonyms(token: string): string[] {
  return [token, ...(SEARCH_SYNONYMS[token] ?? [])];
}

// Tags whose meaning is a negation of one of their own words — splitting on
// "_" would let "fragrance_free" match a search for "fragrance", which is
// backwards. Keep these as one unsplit token instead.
const NEGATION_TAGS = new Set(["fragrance_free", "oil_free", "sugar_free", "low_fat"]);

function tagToSearchText(tag: string): string {
  return NEGATION_TAGS.has(tag) ? tag.replace(/_/g, "") : tag.replace(/_/g, " ");
}

export function searchCatalog(query: string): Product[] {
  const rawTokens = tokenize(query);
  if (rawTokens.length === 0) return [];
  const queryTokens = filterStopwords(rawTokens);

  return catalog
    .map((p) => {
      const targetText = [
        p.name,
        p.brand,
        p.subcategory.replace(/_/g, " "),
        ...p.tags.map(tagToSearchText),
      ].join(" ");
      const targetTokens = tokenize(targetText);
      const score = queryTokens.reduce((count, qt) => {
        const candidates = expandSynonyms(qt);
        const matched = candidates.some((c) => targetTokens.some((tt) => fuzzyTokenMatch(c, tt)));
        return matched ? count + 1 : count;
      }, 0);
      return { product: p, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.product);
}

export function getByCategory(category: string, subcategory?: string): Product[] {
  return catalog.filter(
    (p) => p.category === category && (!subcategory || p.subcategory === subcategory)
  );
}

export function getTopDiscounted(n: number): Product[] {
  return [...catalog]
    .filter((p) => p.mrp > p.price)
    .sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp)
    .slice(0, n);
}

export const CATEGORY_TILES: CategoryTile[] = [
  { label: "Skincare", emoji: "🧴", category: "personal_care", subcategory: "moisturizer" },
  { label: "Sunscreen", emoji: "☀️", category: "personal_care", subcategory: "sunscreen" },
  { label: "Hair Care", emoji: "💇", category: "personal_care", subcategory: "shampoo" },
  { label: "Protein", emoji: "💪", category: "pharma_wellness", subcategory: "protein_supplement" },
  { label: "Vitamins", emoji: "💊", category: "pharma_wellness", subcategory: "vitamins" },
  { label: "Dairy & Paneer", emoji: "🧀", category: "grocery", subcategory: "paneer" },
  { label: "Oats & Sprouts", emoji: "🥣", category: "grocery", subcategory: "oats" },
  { label: "Perfume", emoji: "🌸", category: "grooming", subcategory: "perfume" },
  { label: "Beard Care", emoji: "🧔", category: "grooming", subcategory: "beard_care" },
  { label: "Water Bottles", emoji: "🚰", category: "home_habit", subcategory: "water_bottle" },
  { label: "Journals", emoji: "📓", category: "home_habit", subcategory: "journal" },
  { label: "Night Lamps", emoji: "🛏️", category: "home_habit", subcategory: "night_lamp" },
];
