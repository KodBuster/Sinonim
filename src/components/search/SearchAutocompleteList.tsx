"use client";

import { ProductImage } from "@/components/catalog/ProductImage";
import Link from "next/link";
import {
  flattenAutocompleteSuggestions,
  type SearchAutocompleteResult,
  type SearchAutocompleteSuggestion,
} from "@/lib/search-types";

type SearchAutocompleteListProps = {
  query: string;
  result: SearchAutocompleteResult | null;
  loading: boolean;
  open: boolean;
  activeIndex: number;
  listId: string;
  onSelect: (suggestion: SearchAutocompleteSuggestion) => void;
  onShowAll: () => void;
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
}

export function SearchAutocompleteList({
  query,
  result,
  loading,
  open,
  activeIndex,
  listId,
  onSelect,
  onShowAll,
}: SearchAutocompleteListProps) {
  if (!open || query.trim().length < 2) {
    return null;
  }

  const suggestions = result ? flattenAutocompleteSuggestions(result) : [];
  const hasSuggestions = suggestions.length > 0;

  if (loading && !hasSuggestions) {
    return (
      <div
        id={listId}
        role="listbox"
        className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-brand-olive/15 bg-white shadow-lg"
      >
        <p className="px-4 py-3 text-sm text-brand-muted">Ищем подсказки…</p>
      </div>
    );
  }

  if (!hasSuggestions) {
    return (
      <div
        id={listId}
        role="listbox"
        className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-brand-olive/15 bg-white shadow-lg"
      >
        <p className="px-4 py-3 text-sm text-brand-muted">Ничего не найдено</p>
        <a
          href={`/search?q=${encodeURIComponent(query.trim())}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.preventDefault();
            onShowAll();
          }}
          className="block w-full border-t border-brand-sand px-4 py-3 text-left text-sm text-brand-terracotta hover:bg-brand-surface transition-colors"
        >
          Искать «{query}» во всём каталоге
        </a>
      </div>
    );
  }

  let itemIndex = -1;

  return (
    <div
      id={listId}
      role="listbox"
      className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-brand-olive/15 bg-white shadow-lg"
    >
      {result?.categories.length ? (
        <div className="border-b border-brand-sand">
          <p className="px-4 pt-3 pb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-muted">
            Категории
          </p>
          <ul>
            {result.categories.map((category) => {
              itemIndex += 1;
              const isActive = itemIndex === activeIndex;

              return (
                <li key={`category-${category.slug}`}>
                  <Link
                    href={category.href}
                    role="option"
                    aria-selected={isActive}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onSelect(category)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-brand-surface text-brand-olive-dark"
                        : "text-brand-text hover:bg-brand-surface"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-sand text-brand-terracotta">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M4 7h16M4 12h10M4 17h16"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="truncate">{category.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {result?.products.length ? (
        <div>
          <p className="px-4 pt-3 pb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-muted">
            Товары
          </p>
          <ul>
            {result.products.map((product) => {
              itemIndex += 1;
              const isActive = itemIndex === activeIndex;

              return (
                <li key={`product-${product.id}`}>
                  <Link
                    href={product.href}
                    role="option"
                    aria-selected={isActive}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onSelect(product)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-brand-surface text-brand-olive-dark"
                        : "text-brand-text hover:bg-brand-surface"
                    }`}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-brand-sand">
                      <ProductImage
                        src={product.image}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{product.name}</span>
                      {product.artNo ? (
                        <span className="block truncate text-xs text-brand-muted">
                          Арт. {product.artNo}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-sm text-brand-olive-dark">
                      {formatPrice(product.price)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <a
        href={`/search?q=${encodeURIComponent(query.trim())}`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.preventDefault();
          onShowAll();
        }}
        className="block w-full border-t border-brand-sand px-4 py-3 text-left text-sm text-brand-terracotta hover:bg-brand-surface transition-colors"
      >
        {loading ? "Загрузка…" : `Показать все результаты для «${query}»`}
      </a>
    </div>
  );
}
