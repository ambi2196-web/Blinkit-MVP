import Link from "next/link";
import { CATEGORY_TILES } from "@/lib/catalog";

export default function CategoryTiles() {
  return (
    <section className="grid grid-cols-4 gap-3 px-4 pt-4">
      {CATEGORY_TILES.map((tile) => (
        <Link
          key={tile.label}
          href={`/search?category=${tile.category}${tile.subcategory ? `&subcategory=${tile.subcategory}` : ""}`}
          className="flex flex-col items-center gap-1 rounded-xl bg-white p-2 text-center shadow-sm"
        >
          <span className="text-2xl">{tile.emoji}</span>
          <span className="text-[10px] font-medium leading-tight text-gray-700">{tile.label}</span>
        </Link>
      ))}
    </section>
  );
}
