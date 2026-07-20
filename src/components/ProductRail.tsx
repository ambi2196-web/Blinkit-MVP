import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function ProductRail({ title, products }: { title: string; products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-5">
      <div className="mb-2 flex items-center justify-between px-4">
        <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
        <span className="text-xs font-semibold text-[#0C831F]">see all</span>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
