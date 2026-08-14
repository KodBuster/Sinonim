"use client";

import { getProductCaratWeightLabel } from "@/lib/product-weight";
import type { ProductDetails } from "@/lib/products";
import { useProductSelection } from "./ProductSelectionContext";

type ProductCharacteristicsProps = {
  product: ProductDetails;
};

export function ProductCharacteristics({ product }: ProductCharacteristicsProps) {
  const { selectedSize } = useProductSelection();
  const diamondWeight = getProductCaratWeightLabel(product, selectedSize);

  return (
    <div className="bg-brand-surface rounded-xl p-6 md:p-8">
      <h2 className="font-heading text-xl text-brand-olive-dark mb-4">
        Характеристики
      </h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-brand-sand pb-3">
          <dt className="text-brand-muted">Металл</dt>
          <dd className="text-brand-text text-right">{product.metal}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-brand-sand pb-3">
          <dt className="text-brand-muted">Тип камня</dt>
          <dd className="text-brand-text text-right">Лабораторный бриллиант</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-brand-sand pb-3">
          <dt className="text-brand-muted">Огранка</dt>
          <dd className="text-brand-text text-right">{product.cut}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-brand-sand pb-3">
          <dt className="text-brand-muted">Вес бриллианта</dt>
          <dd className="text-brand-text text-right">{diamondWeight} карат</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-brand-sand pb-3">
          <dt className="text-brand-muted">Цвет</dt>
          <dd className="text-brand-text text-right">{product.color}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-brand-muted">Чистота</dt>
          <dd className="text-brand-text text-right">{product.clarity}</dd>
        </div>
      </dl>
    </div>
  );
}
