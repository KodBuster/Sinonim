import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getFeaturedProducts } from "@/lib/products-service";

export function FeaturedProductsFallback() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="aspect-square rounded-xl bg-brand-surface animate-pulse"
        />
      ))}
    </div>
  );
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (!products.length) {
    return (
      <p className="text-sm text-brand-muted">
        Не удалось загрузить подборку.{" "}
        <Link href="/shop" className="text-brand-terracotta hover:underline">
          Перейти в каталог
        </Link>
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
