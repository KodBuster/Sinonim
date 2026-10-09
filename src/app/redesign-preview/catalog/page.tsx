import { isAdvantShopConfigured } from "@/lib/advantshop/config";
import { fetchAdvantShopProducts } from "@/lib/advantshop/catalog";
import type { Product } from "@/lib/products";
import { PreviewCatalog } from "@/components/redesign/PreviewCatalog";

export const dynamic = "force-dynamic";

export default async function PreviewCatalogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const query = await searchParams;
  let products: Product[] = [];
  if (isAdvantShopConfigured()) {
    try {
      products = await fetchAdvantShopProducts({ includeOutOfStock: true });
    } catch (error) {
      console.error("SYNONYM redesign preview: AdvantShop catalog unavailable", error);
    }
  }
  return <PreviewCatalog products={products} initialCategory={query.category ?? "all"} />;
}
