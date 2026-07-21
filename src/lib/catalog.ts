import rawCatalog from "@/data/catalog.json";
import type { CategoryTile, Product } from "@/lib/types";
import { tokenize, fuzzyTokenMatch } from "@/lib/fuzzyMatch";

export const catalog = rawCatalog as Product[];

export function getProduct(id: string): Product | undefined {
  return catalog.find((p) => p.id === id);
}

export function searchCatalog(query: string): Product[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  return catalog.filter((p) => {
    const targetText = [p.name, p.brand, p.subcategory, ...p.tags].join(" ").replace(/_/g, " ");
    const targetTokens = tokenize(targetText);
    return queryTokens.every((qt) => targetTokens.some((tt) => fuzzyTokenMatch(qt, tt)));
  });
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
