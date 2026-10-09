"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";
import { PreviewCard } from "./PreviewCard";

const categoryNames: Record<string,string> = {
  all: "Все украшения", rings: "Кольца", earrings: "Серьги", pendants: "Колье", bracelets: "Браслеты",
};
type Sort = "new" | "price-asc" | "price-desc";

export function PreviewCatalog({ products, initialCategory, initialSort = "new", initialPrice = "all" }: { products: Product[]; initialCategory: string; initialSort?: string; initialPrice?: string }) {
  const [category, setCategory] = useState(initialCategory in categoryNames ? initialCategory : "all");
  const [sort, setSort] = useState<Sort>(initialSort === "price-asc" || initialSort === "price-desc" ? initialSort : "new");
  const [priceRange, setPriceRange] = useState(["all", "under15000", "15000to30000", "over30000"].includes(initialPrice) ? initialPrice : "all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Keep shareable filters and browser back/forward synchronized with the UI.
  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const nextCategory = params.get("category") ?? "all";
      const nextSort = params.get("sort") ?? "new";
      const nextPrice = params.get("price") ?? "all";
      setCategory(nextCategory in categoryNames ? nextCategory : "all");
      setSort(nextSort === "price-asc" || nextSort === "price-desc" ? nextSort : "new");
      setPriceRange(["all", "under15000", "15000to30000", "over30000"].includes(nextPrice) ? nextPrice : "all");
    };
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  function changeUrl(next: { category?: string; sort?: Sort; priceRange?: string }) {
    const url = new URL(window.location.href);
    const updates: [string, string | undefined, string][] = [
      ["category", next.category, "all"],
      ["sort", next.sort, "new"],
      ["price", next.priceRange, "all"],
    ];
    for (const [name, value, defaultValue] of updates) {
      if (value === undefined) continue;
      if (value === defaultValue) url.searchParams.delete(name);
      else url.searchParams.set(name, value);
    }
    window.history.pushState(null, "", url.pathname + url.search + url.hash);
  }

  function chooseCategory(value: string) {
    setCategory(value);
    changeUrl({ category: value });
  }
  function choosePrice(value: string) {
    setPriceRange(value);
    changeUrl({ priceRange: value });
  }
  function chooseSort(value: Sort) {
    setSort(value);
    changeUrl({ sort: value });
  }

  const filtered = useMemo(() => {
    let items = products.filter(p => category === "all" || p.category === category);
    if (priceRange === "under15000") items = items.filter(p => p.price < 15000);
    if (priceRange === "15000to30000") items = items.filter(p => p.price >= 15000 && p.price < 30000);
    if (priceRange === "over30000") items = items.filter(p => p.price >= 30000);
    if (sort === "new") items = [...items].sort((a,b) => Number(b.isNew)-Number(a.isNew));
    if (sort === "price-asc") items = [...items].sort((a,b) => a.price-b.price);
    if (sort === "price-desc") items = [...items].sort((a,b) => b.price-a.price);
    return items;
  }, [products, category, priceRange, sort]);

  return <main className="sn-container sn-catalog">
    <nav className="sn-breadcrumbs"><a href="/redesign-preview">Главная</a> / Каталог</nav>
    <h1>{categoryNames[category] ?? "Все украшения"}</h1>
    <p className="sn-catalog-intro">Украшения из серебра 925 с огранёнными синтетическими алмазами.</p>
    <div className="sn-category-pills">{Object.entries(categoryNames).map(([key,label]) =>
      <button type="button" key={key} onClick={() => chooseCategory(key)} className={category===key ? "is-active":""}>{label}</button>
    )}</div>
    <div className="sn-catalog-toolbar">
      <button type="button" className="sn-filter-button" onClick={() => setFiltersOpen(v=>!v)} aria-expanded={filtersOpen}>Фильтры ☷</button>
      <span>{filtered.length} изделий</span>
      <label>Сортировка <select value={sort} onChange={e => chooseSort(e.target.value as Sort)}>
        <option value="new">Новинки</option><option value="price-asc">По возрастанию цены</option><option value="price-desc">По убыванию цены</option>
      </select></label>
    </div>
    <div className="sn-catalog-layout">
      <aside className={"sn-filters" + (filtersOpen ? " is-open" : "")}>
        <h2>Категории</h2>
        {Object.entries(categoryNames).map(([key,label]) =>
          <label key={key}><input type="radio" name="sn-category" checked={category===key} onChange={() => chooseCategory(key)}/> {label}</label>
        )}
        <h2>Цена</h2>
        {[["all","Любая"],["under15000","До 15 000 ₽"],["15000to30000","15 000–30 000 ₽"],["over30000","От 30 000 ₽"]].map(([key,label]) =>
          <label key={key}><input type="radio" name="sn-price" checked={priceRange===key} onChange={() => choosePrice(key)}/> {label}</label>
        )}
        <button type="button" className="sn-clear" onClick={() => {setCategory("all");setPriceRange("all");setSort("new");changeUrl({category:"all",priceRange:"all",sort:"new"});}}>Сбросить фильтры</button>
      </aside>
      <section aria-label="Результаты каталога" aria-live="polite">
        {filtered.length ? <div className="sn-product-grid sn-catalog-results">{filtered.map(p => <PreviewCard key={p.id} product={p}/>)}</div> :
          <p className="sn-notice">{products.length === 0 ? "Нет ответа от AdvantShop в тестовом окружении. Выдуманные товары и цены не отображаются." : "По заданным фильтрам товаров нет."}</p>}
      </section>
    </div>
  </main>;
}
