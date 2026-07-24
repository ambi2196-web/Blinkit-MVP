import type { Intent } from "@/lib/queryClassifier";

export interface ConsultQuestion {
  question: string;
  options: string[];
}

export const INTENT_QUESTIONS: Record<Intent, ConsultQuestion[]> = {
  dry_skin: [
    { question: "What's your skin like most days?", options: ["Dry", "Oily", "Combo", "Sensitive"] },
    { question: "Current routine?", options: ["Nothing", "Just face wash", "Full routine"] },
    { question: "Budget for the full routine?", options: ["Under ₹500", "₹500–1200", "No limit"] },
  ],
  oily_acne: [
    { question: "What's your skin like most days?", options: ["Oily", "Acne-prone", "Combo", "Not sure"] },
    { question: "Current routine?", options: ["Nothing", "Just face wash", "Full routine"] },
    { question: "Budget for the full routine?", options: ["Under ₹500", "₹500–1200", "No limit"] },
  ],
  skin_general: [
    { question: "What's your skin like most days?", options: ["Dry", "Oily", "Combo", "Sensitive"] },
    { question: "Current routine?", options: ["Nothing", "Just face wash", "Full routine"] },
    { question: "Budget for the full routine?", options: ["Under ₹500", "₹500–1200", "No limit"] },
  ],
  high_protein: [
    { question: "Diet preference?", options: ["Vegetarian", "Eggetarian", "Non-vegetarian"] },
    { question: "Main goal?", options: ["Muscle gain", "General fitness", "Weight management"] },
    { question: "Budget for the day's picks?", options: ["Under ₹500", "₹500–1500", "No limit"] },
  ],
  beard: [
    { question: "Beard stage?", options: ["Just starting out", "Patchy growth", "Established, needs upkeep"] },
    { question: "Current routine?", options: ["Nothing", "Just a trimmer", "Full routine"] },
    { question: "Budget?", options: ["Under ₹500", "₹500–1200", "No limit"] },
  ],
  sleep: [
    { question: "What's disrupting your sleep most?", options: ["Screen time before bed", "Racing thoughts", "No consistent routine"] },
    { question: "Current wind-down habit?", options: ["None", "Sometimes journal", "Have a routine already"] },
    { question: "Budget?", options: ["Under ₹500", "₹500–1200", "No limit"] },
  ],
};
