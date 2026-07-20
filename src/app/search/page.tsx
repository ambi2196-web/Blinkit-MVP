import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getByCategory, searchCatalog } from "@/lib/catalog";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string; subcategory?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, subcategory } = await searchParams;

  const results = q ? searchCatalog(q) : category ? getByCategory(category, subcategory) : [];

  const heading = q ? `Results for "${q}"` : category ? category.replace(/_/g, " ") : "Search";

  return (
    <main>
      <Header />
      <div className="px-4 pt-4">
        <h1 className="mb-3 text-base font-bold capitalize text-gray-900">{heading}</h1>

        {results.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-500">
            No products found. Try a different search.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3 pb-6">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
