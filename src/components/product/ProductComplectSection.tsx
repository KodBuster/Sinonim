import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product } from "@/lib/products";

type ProductComplectSectionProps = {
  products: Product[];
};

export function ProductComplectSection({
  products,
}: ProductComplectSectionProps) {
  if (!products.length) return null;

  const gridClass =
    products.length === 1
      ? "grid grid-cols-1 max-w-sm"
      : products.length === 2
        ? "grid grid-cols-2 gap-4 md:gap-6 max-w-2xl"
        : "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6";

  return (
    <div className="mt-16 md:mt-20">
      <h2 className="font-heading text-2xl md:text-3xl text-brand-olive-dark mb-8">
        Комплект к этому украшению
      </h2>
      <div className={gridClass}>
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
}
