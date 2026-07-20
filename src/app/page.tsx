import Header from "@/components/Header";
import CategoryTiles from "@/components/CategoryTiles";
import ProductRail from "@/components/ProductRail";
import { getByCategory, getTopDiscounted } from "@/lib/catalog";

export default function Home() {
  const hotDeals = getTopDiscounted(10);
  const freshNeeds = getByCategory("grocery").slice(0, 10);
  const skincare = getByCategory("personal_care").slice(0, 10);

  return (
    <main>
      <Header />
      <CategoryTiles />
      <ProductRail title="Hot deals" products={hotDeals} />
      <ProductRail title="Your daily fresh needs" products={freshNeeds} />
      <ProductRail title="Skincare essentials" products={skincare} />
    </main>
  );
}
