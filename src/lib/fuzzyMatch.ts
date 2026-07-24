// Optimal string alignment distance — Levenshtein plus adjacent-transposition,
// which covers the most common typo pattern (swapped letters, e.g. "protien").
function editDistance(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  const d: number[][] = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));

  for (let i = 0; i <= al; i++) d[i][0] = i;
  for (let j = 0; j <= bl; j++) d[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }
  return d[al][bl];
}

function thresholdFor(len: number): number {
  // Distance 2 is loose enough to false-match unrelated words of similar
  // length (e.g. "paneer" / "planner" are distance 2 apart) — cap at 1 for
  // all but genuinely long words, where a 2-edit gap is still a small
  // fraction of the word.
  if (len <= 3) return 0;
  if (len <= 9) return 1;
  return 2;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function fuzzyTokenMatch(a: string, b: string): boolean {
  if (a === b) return true;
  // Substring containment only counts for near-equal lengths (plurals,
  // minor typos). Without the length cap, "vitamin" matches inside
  // "multivitamin" and pulls in unrelated vitamin-C skincare for a
  // multivitamin-supplement search.
  if (a.length >= 3 && b.length >= 3 && Math.abs(a.length - b.length) <= 2 && (a.includes(b) || b.includes(a))) {
    return true;
  }
  return editDistance(a, b) <= thresholdFor(Math.max(a.length, b.length));
}

/** True if every word in `phrase` fuzzily matches some word in `query`. */
export function fuzzyPhraseMatch(query: string, phrase: string): boolean {
  const queryTokens = tokenize(query);
  const phraseTokens = tokenize(phrase);
  if (phraseTokens.length === 0 || queryTokens.length === 0) return false;
  return phraseTokens.every((pt) => queryTokens.some((qt) => fuzzyTokenMatch(qt, pt)));
}

// Natural-language filler words a user types around their real intent
// ("dry skin ROUTINE", "high protein DIET") that don't correspond to
// anything in the catalog. Requiring every query word to match a product
// meant these silently zeroed out otherwise-good searches.
const STOPWORDS = new Set([
  "routine", "routines", "diet", "plan", "daily", "good", "for", "the", "a",
  "an", "my", "me", "need", "needs", "want", "wants", "please", "help",
  "some", "any", "products", "product", "of", "to", "with",
]);

/** Drops stopwords, but never returns an empty list (falls back to the originals). */
export function filterStopwords(tokens: string[]): string[] {
  const filtered = tokens.filter((t) => !STOPWORDS.has(t));
  return filtered.length > 0 ? filtered : tokens;
}
