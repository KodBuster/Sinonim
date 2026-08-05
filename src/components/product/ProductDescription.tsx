import type { ProductDetails } from "@/lib/products";

type ProductDescriptionProps = {
  product: ProductDetails;
};

export function ProductDescription({ product }: ProductDescriptionProps) {
  return (
    <div className="bg-brand-surface rounded-xl p-6 md:p-8">
      <h2 className="font-heading text-xl text-brand-olive-dark mb-4">
        Описание
      </h2>
      <p className="text-brand-muted leading-relaxed">{product.description}</p>
    </div>
  );
}
