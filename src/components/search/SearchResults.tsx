import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getSiteUrl } from "@/lib/site-url";

const SEARCH_GRID =
  "grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 lg:gap-6";

type SearchFormNativeProps = {
  defaultQuery?: string;
  className?: string;
  compact?: boolean;
  autoFocus?: boolean;
};

/**
 * Native GET form with absolute action URL.
 * Forces a full document navigation (no App Router soft-nav),
 * which is what works on iOS Safari 16 alongside plain size links.
 */
export function SearchFormNative({
  defaultQuery = "",
  className = "",
  compact = false,
  autoFocus = false,
}: SearchFormNativeProps) {
  const action = `${getSiteUrl()}/search`;

  return (
    <form
      action={action}
      method="get"
      className={`relative ${className}`}
      role="search"
      acceptCharset="UTF-8"
    >
      <div className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={defaultQuery}
          autoFocus={autoFocus}
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Кольцо, серьги, артикул…"
          className={`min-w-0 flex-1 rounded-lg border border-brand-olive/20 bg-white px-4 text-base text-brand-text placeholder:text-brand-muted focus:border-brand-olive focus:outline-none focus:ring-2 focus:ring-brand-olive/20 ${
            compact ? "py-2" : "py-2.5"
          }`}
        />
        <input
          type="submit"
          value="Найти"
          className={`shrink-0 cursor-pointer touch-manipulation rounded-lg border-0 bg-brand-terracotta px-4 font-medium text-white transition-colors hover:bg-brand-terracotta-logo [-webkit-tap-highlight-color:transparent] ${
            compact ? "py-2 text-sm" : "py-2.5 text-base"
          }`}
        />
      </div>
    </form>
  );
}

type SearchResultsProps = {
  query: string;
  products: Product[];
  error?: string;
};

export function SearchResults({ query, products, error }: SearchResultsProps) {
  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
        <nav className="text-sm text-brand-muted mb-6" aria-label="Хлебные крошки">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <a href="/" className="hover:text-brand-terracotta transition-colors">
                Главная
              </a>
            </li>
            <li aria-hidden>/</li>
            <li>
              <span className="text-brand-text">Поиск</span>
            </li>
          </ol>
        </nav>

        <div className="mb-8 md:mb-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            Каталог
          </p>
          <h1 className="font-heading text-3xl md:text-4xl text-brand-olive-dark mb-4">
            Поиск
          </h1>
          <SearchFormNative defaultQuery={query} className="max-w-xl" autoFocus />
        </div>

        {!query ? (
          <p className="text-brand-muted text-sm md:text-base">
            Введите название украшения или артикул.
          </p>
        ) : null}

        {query && error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
            <p className="text-brand-text mb-4">{error}</p>
            <a
              href={`/search?q=${encodeURIComponent(query)}`}
              className="inline-flex rounded-lg bg-brand-terracotta px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-terracotta-logo transition-colors"
            >
              Попробовать снова
            </a>
          </div>
        ) : null}

        {query && !error && products.length === 0 ? (
          <p className="py-12 text-center text-brand-muted">
            По запросу «{query}» ничего не найдено.
          </p>
        ) : null}

        {query && !error && products.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-brand-muted">
              Найдено: {products.length}
            </p>
            <div className={SEARCH_GRID}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
