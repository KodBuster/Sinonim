"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Product } from "@/lib/products";
import { PreviewCard } from "./PreviewCard";

export function BestSellerCarousel({ products, hasVerifiedHits }: { products: Product[]; hasVerifiedHits: boolean }) {
  const viewport = useRef<HTMLDivElement>(null);
  const scroll = (direction: -1 | 1) => {
    const el = viewport.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".sn-product-card");
    const distance = (card?.getBoundingClientRect().width ?? el.clientWidth * 0.8) + 12;
    el.scrollBy({ left: distance * direction, behavior: "smooth" });
  };

  return (
    <section className="sn-best-sellers" aria-labelledby="sn-best-sellers-title">
      <div className="sn-full-heading">
        <h2 id="sn-best-sellers-title">{hasVerifiedHits ? "Бестселлеры" : "Выбор СИНОНИМ"}</h2>
        <div className="sn-scroll-controls">
          <Link href="/redesign-preview/catalog" className="sn-collection-link">Все украшения ↗</Link>
          <button type="button" onClick={() => scroll(-1)} aria-label="Предыдущие украшения">‹</button>
          <button type="button" onClick={() => scroll(1)} aria-label="Следующие украшения">›</button>
        </div>
      </div>
      {products.length > 0 ? (
        <div className="sn-best-sellers-viewport" ref={viewport} role="region" aria-label="Горизонтальная подборка украшений" tabIndex={0}>
          {products.map(product => <PreviewCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="sn-best-sellers-empty" role="status">
          <div className="sn-best-sellers-skeleton" aria-hidden="true">{Array.from({length: 5}, (_, index) => <span key={index} />)}</div>
          <p>Подборка появится после подключения тестового окружения к AdvantShop. Цены и товары не подменяем макетными данными.</p>
        </div>
      )}
    </section>
  );
}
