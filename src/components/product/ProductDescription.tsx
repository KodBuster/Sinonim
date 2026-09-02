"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductDetails } from "@/lib/products";
import { normalizeProductDescription } from "@/lib/product-description";

type ProductDescriptionProps = {
  product: ProductDetails;
};

export function ProductDescription({ product }: ProductDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const [canToggle, setCanToggle] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const description = normalizeProductDescription(product.description);

  useEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;
    // Полный текст всегда в DOM; clamp только визуальный — для SEO безопасно.
    setCanToggle(el.scrollHeight > el.clientHeight + 1);
  }, [description, expanded]);

  return (
    <div className="bg-brand-surface rounded-xl p-6 md:p-8">
      <h2 className="font-heading text-xl text-brand-olive-dark mb-4">
        Описание
      </h2>
      <p
        ref={textRef}
        id="product-description"
        className={`text-brand-muted leading-relaxed ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {description}
      </p>
      {canToggle ? (
        <button
          type="button"
          className="mt-3 text-sm text-brand-terracotta hover:text-brand-terracotta-logo transition-colors"
          aria-expanded={expanded}
          aria-controls="product-description"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Свернуть" : "Читать далее"}
        </button>
      ) : null}
    </div>
  );
}
