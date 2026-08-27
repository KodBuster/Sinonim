import { unstable_cache } from "next/cache";
import {
  fetchAdvantShopSearch,
  fetchAdvantShopSearchAutocomplete,
} from "@/lib/advantshop/search";
import { loadAdvantShopProductDetails } from "@/lib/advantshop/catalog";
import {
  findMatchingArtNo,
  mergeAutocompleteResults,
  productMatchesArtQuery,
  searchCatalogByArtNo,
  searchCatalogProductsByArtNo,
} from "@/lib/art-search";
import {
  CATALOG_REVALIDATE_SECONDS,
  isAdvantShopConfigured,
} from "@/lib/advantshop/config";
import {
  CATALOG_CATEGORY_SLUGS,
  CATEGORIES,
  PRODUCTS,
  type CategorySlug,
  type Product,
} from "@/lib/products";
import type { SearchAutocompleteResult } from "@/lib/search-types";
import { getCatalogProducts } from "@/lib/products-service";

const getCachedAdvantShopSearch = unstable_cache(
  async (query: string, sort: string) => fetchAdvantShopSearch(query, { sort }),
  ["advantshop-search", "by-product-id-v2"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["search"] }
);

/** Morphological / colloquial queries → catalog categories. */
const SEARCH_CATEGORY_SYNONYMS: Record<string, CategorySlug[]> = {
  кольцо: ["rings"],
  кольца: ["rings"],
  колечко: ["rings"],
  ring: ["rings"],
  rings: ["rings"],
  серьга: ["earrings"],
  серьги: ["earrings"],
  сережки: ["earrings"],
  earring: ["earrings"],
  earrings: ["earrings"],
  колье: ["pendants"],
  кулон: ["pendants"],
  подвеска: ["pendants"],
  pendant: ["pendants"],
  pendants: ["pendants"],
  браслет: ["bracelets"],
  браслеты: ["bracelets"],
  bracelet: ["bracelets"],
  bracelets: ["bracelets"],
  подарок: ["gifts"],
  подарки: ["gifts"],
  gift: ["gifts"],
  gifts: ["gifts"],
};

function searchCatalogByText(catalog: Product[], query: string): Product[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const categoryHits = new Set<CategorySlug>();
  for (const [term, slugs] of Object.entries(SEARCH_CATEGORY_SYNONYMS)) {
    if (normalized.includes(term) || term.includes(normalized)) {
      for (const slug of slugs) categoryHits.add(slug);
    }
  }

  return catalog.filter((product) => {
    if (categoryHits.has(product.category)) return true;

    const category = CATEGORIES[product.category];
    if (
      category.title.toLowerCase().includes(normalized) ||
      category.titlePlural.toLowerCase().includes(normalized)
    ) {
      return true;
    }

    return (
      product.name.toLowerCase().includes(normalized) ||
      product.slug.toLowerCase().includes(normalized) ||
      (product.artNo?.toLowerCase().includes(normalized) ?? false) ||
      (product.offerArtNos ?? []).some((artNo) =>
        artNo.toLowerCase().includes(normalized),
      )
    );
  });
}

function searchCatalogCategoriesByText(
  query: string,
): SearchAutocompleteResult["categories"] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const slugs = new Set<CategorySlug>();
  for (const [term, mapped] of Object.entries(SEARCH_CATEGORY_SYNONYMS)) {
    if (normalized.includes(term) || term.includes(normalized)) {
      for (const slug of mapped) slugs.add(slug);
    }
  }

  for (const slug of CATALOG_CATEGORY_SLUGS) {
    const category = CATEGORIES[slug];
    if (
      category.title.toLowerCase().includes(normalized) ||
      category.titlePlural.toLowerCase().includes(normalized) ||
      slug.includes(normalized)
    ) {
      slugs.add(slug);
    }
  }

  return [...slugs].slice(0, 4).map((slug) => ({
    type: "category" as const,
    slug,
    name: CATEGORIES[slug].titlePlural,
    href: `/shop/${slug}`,
  }));
}

function searchStaticProducts(query: string, sort?: string): Product[] {
  let products = searchCatalogByText(PRODUCTS, query);

  if (sort === "price-asc") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    products = [...products].sort((a, b) => b.price - a.price);
  } else if (sort === "new") {
    products = [...products].sort((a, b) => Number(b.isNew) - Number(a.isNew));
  }

  return products;
}

function getStaticAutocomplete(query: string): SearchAutocompleteResult {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { products: [], categories: [] };
  }

  const categories = CATALOG_CATEGORY_SLUGS.filter((slug) => {
    const category = CATEGORIES[slug];
    return (
      category.titlePlural.toLowerCase().includes(normalized) ||
      category.title.toLowerCase().includes(normalized) ||
      slug.includes(normalized)
    );
  })
    .slice(0, 4)
    .map((slug: CategorySlug) => ({
      type: "category" as const,
      slug,
      name: CATEGORIES[slug].titlePlural,
      href: `/shop/${slug}`,
    }));

  const products = searchStaticProducts(normalized).slice(0, 6).map((product) => ({
    type: "product" as const,
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
    artNo: product.artNo,
    href: `/products/${product.slug}`,
  }));

  return { products, categories };
}

async function searchModificationArtProducts(
  catalog: Product[],
  query: string,
): Promise<Product[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized.includes("-")) {
    return [];
  }

  const direct = searchCatalogProductsByArtNo(catalog, query);
  if (
    direct.some((product) =>
      findMatchingArtNo(product, query)?.toLowerCase() === normalized,
    )
  ) {
    return direct;
  }

  const base = normalized.replace(/-\d+$/, "");
  const candidates = catalog
    .filter((product) =>
      [product.artNo, ...(product.offerArtNos ?? [])].some((artNo) =>
        artNo?.toLowerCase().startsWith(base),
      ),
    )
    .slice(0, 8);

  const products: Product[] = [];
  for (const candidate of candidates) {
    const details = await loadAdvantShopProductDetails(candidate);
    if (!details) continue;

    if (productMatchesArtQuery(details, query)) {
      products.push(details);
    }
  }

  return products;
}

async function searchModificationArtInCatalog(
  catalog: Product[],
  query: string,
  limit = 6,
): Promise<SearchAutocompleteResult> {
  const normalized = query.trim().toLowerCase();
  if (!normalized.includes("-")) {
    return { products: [], categories: [] };
  }

  const direct = searchCatalogByArtNo(catalog, query, limit);
  if (direct.products.some((product) => product.artNo?.toLowerCase() === normalized)) {
    return direct;
  }

  const base = normalized.replace(/-\d+$/, "");
  const candidates = catalog
    .filter((product) =>
      [product.artNo, ...(product.offerArtNos ?? [])].some((artNo) =>
        artNo?.toLowerCase().startsWith(base),
      ),
    )
    .slice(0, 8);

  const products = [];
  for (const candidate of candidates) {
    const details = await loadAdvantShopProductDetails(candidate);
    if (!details) continue;

    const match = searchCatalogByArtNo([details], query, 1);
    if (match.products[0]) {
      products.push(match.products[0]);
    }
    if (products.length >= limit) break;
  }

  return { products, categories: [] };
}

export async function getSearchAutocomplete(
  query: string
): Promise<SearchAutocompleteResult> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { products: [], categories: [] };
  }

  if (isAdvantShopConfigured()) {
    const catalog = await getCatalogProducts();
    const localMatches = searchCatalogByArtNo(catalog, trimmed);
    const textMatches = {
      products: searchCatalogByText(catalog, trimmed)
        .slice(0, 6)
        .map((product) => ({
          type: "product" as const,
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.image,
          artNo: product.artNo,
          href: `/products/${product.slug}`,
        })),
      categories: searchCatalogCategoriesByText(trimmed),
    };
    const modificationMatches = localMatches.products.some(
      (product) => product.artNo?.toLowerCase() === trimmed.toLowerCase(),
    )
      ? { products: [], categories: [] }
      : await searchModificationArtInCatalog(catalog, trimmed);

    try {
      const remote = await fetchAdvantShopSearchAutocomplete(trimmed);
      return mergeAutocompleteResults(
        mergeAutocompleteResults(
          mergeAutocompleteResults(localMatches, textMatches),
          modificationMatches,
        ),
        remote,
      );
    } catch (error) {
      const fallback = mergeAutocompleteResults(
        mergeAutocompleteResults(localMatches, textMatches),
        modificationMatches,
      );
      if (fallback.products.length || fallback.categories.length) {
        return fallback;
      }
      throw error;
    }
  }

  return getStaticAutocomplete(trimmed);
}

export async function getSearchProducts(
  query: string,
  options?: { sort?: string }
): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const sort = options?.sort ?? "default";

  if (isAdvantShopConfigured()) {
    const catalog = await getCatalogProducts();
    const localMatches = searchCatalogProductsByArtNo(catalog, trimmed);
    const textMatches = searchCatalogByText(catalog, trimmed);
    const modificationMatches = await searchModificationArtProducts(catalog, trimmed);
    const remoteMatches = await getCachedAdvantShopSearch(trimmed, sort);

    const merged = new Map<string, Product>();
    for (const product of [
      ...localMatches,
      ...textMatches,
      ...modificationMatches,
      ...remoteMatches,
    ]) {
      merged.set(product.id, product);
    }

    let products = [...merged.values()];
    if (sort === "price-asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === "new") {
      products.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    }
    return products;
  }

  return searchStaticProducts(trimmed, sort);
}
