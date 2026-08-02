import { unstable_cache } from "next/cache";
import type { CategorySlug, Product, ProductDetails } from "@/lib/products";
import { findProductBySlug } from "@/lib/product-slug";
import { parseSetArtNosFromProperties } from "@/lib/product-complect";
import { advantshopClientFetch, advantshopFetch } from "./client";
import { getCategoryUrlMap, CATALOG_REVALIDATE_SECONDS } from "./config";
import { mapCatalogProduct, mapProductDetails } from "./mapper";
import {
  getAdvantShopDetailsStockInfo,
  isAdvantShopProductInStock,
  type AdvantShopStockInfo,
} from "./stock";
import type {
  AdvantShopCatalogProduct,
  AdvantShopCatalogResponse,
  AdvantShopCategoriesResponse,
  AdvantShopProductDetails,
  AdvantShopProperty,
  AdvantShopPropertiesResponse,
} from "./types";

const SORT_MAP: Record<string, string> = {
  default: "NoSorting",
  "price-asc": "AscByPrice",
  "price-desc": "DescByPrice",
  new: "DescByAddingDate",
};

function isMissingCategoryError(error: unknown): boolean {
  return (
    error instanceof Error && error.message.includes("Категория не найдена")
  );
}

function flattenAdvantShopProperties(
  response: AdvantShopPropertiesResponse
): AdvantShopProperty[] {
  if (Array.isArray(response)) {
    return response.flatMap((group) => group.properties ?? []);
  }

  return response.properties ?? [];
}

function getCategorySlugByUrl(url: string): CategorySlug | undefined {
  const map = getCategoryUrlMap();

  for (const [slug, categoryUrl] of Object.entries(map) as [
    CategorySlug,
    string,
  ][]) {
    if (categoryUrl === url) return slug;
  }

  return undefined;
}

async function fetchCatalogPage(body: Record<string, unknown>) {
  return advantshopClientFetch<AdvantShopCatalogResponse>("/api/catalog", {
    method: "POST",
    body,
  });
}

async function fetchAllCatalogProducts(body: Record<string, unknown>) {
  const products: AdvantShopCatalogResponse["products"] = [];
  let page = 1;
  let totalPages = 1;
  const pageSize = 500;

  do {
    const response = await fetchCatalogPage({
      ...body,
      page,
      itemsPerPage: pageSize,
    });
    products.push(...(response.products ?? []));
    totalPages = response.pager?.totalPageCount ?? 1;
    page += 1;
  } while (page <= totalPages);

  return products;
}

async function fetchProductProperties(productId: number): Promise<AdvantShopProperty[]> {
  const response = await advantshopClientFetch<AdvantShopPropertiesResponse>(
    `/api/products/${productId}/properties`,
    { searchParams: { type: "inDetails" } },
  ).catch(() => [] as AdvantShopPropertiesResponse);

  return flattenAdvantShopProperties(response);
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function run() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

const getCachedSetMap = unstable_cache(
  async (): Promise<Record<string, string[]>> => {
    const categoryMap = getCategoryUrlMap();
    const productIds = new Set<number>();

    for (const url of Object.values(categoryMap)) {
      const items = await fetchAllCatalogProducts({
        url,
        sorting: "NoSorting",
      });
      for (const item of items) {
        productIds.add(item.productId);
      }
    }

    const setMap: Record<string, string[]> = {};
    const ids = [...productIds];

    await mapPool(ids, 8, async (productId) => {
      const properties = await fetchProductProperties(productId);
      const setArtNos = parseSetArtNosFromProperties(properties);
      if (setArtNos.length) {
        setMap[String(productId)] = setArtNos;
      }
    });

    return setMap;
  },
  ["advantshop-set-map"],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["catalog"] },
);

async function fetchProductStockInfo(
  productId: number,
  category: CategorySlug,
): Promise<AdvantShopStockInfo | undefined> {
  try {
    const details = await advantshopClientFetch<AdvantShopProductDetails>(
      `/api/products/${productId}`,
    );
    return getAdvantShopDetailsStockInfo(details, category);
  } catch (error) {
    console.warn(
      `AdvantShop stock for product ${productId} unavailable:`,
      error,
    );
    return undefined;
  }
}

async function loadStockInfoMap(
  items: AdvantShopCatalogProduct[],
  category: CategorySlug,
): Promise<Map<number, AdvantShopStockInfo>> {
  const map = new Map<number, AdvantShopStockInfo>();
  const ids = [...new Set(items.map((item) => item.productId))];

  await mapPool(ids, 8, async (productId) => {
    const stock = await fetchProductStockInfo(productId, category);
    if (stock) map.set(productId, stock);
  });

  return map;
}

function resolveListStockInfo(
  item: AdvantShopCatalogProduct,
  stockMap: Map<number, AdvantShopStockInfo>,
): AdvantShopStockInfo {
  const fromDetails = stockMap.get(item.productId);
  if (fromDetails) return fromDetails;

  return {
    stockAmount: undefined,
    inStock: isAdvantShopProductInStock(item),
  };
}

async function mapCatalogItems(
  items: NonNullable<AdvantShopCatalogResponse["products"]>,
  category: CategorySlug,
  setMap: Record<string, string[]>,
  includeOutOfStock = false,
): Promise<Product[]> {
  const stockMap = await loadStockInfoMap(items, category);

  const visible = includeOutOfStock
    ? items
    : items.filter((item) => resolveListStockInfo(item, stockMap).inStock);

  return visible.map((item) =>
    mapCatalogProduct(
      item,
      category,
      setMap[String(item.productId)],
      stockMap.get(item.productId),
    ),
  );
}

export async function fetchAdvantShopCategories() {
  return advantshopFetch<AdvantShopCategoriesResponse>("/api/categories", {
    searchParams: { parentCategoryId: 0, extended: true },
  });
}

export async function fetchAdvantShopProducts(options?: {
  category?: CategorySlug;
  sort?: string;
  /** Если true — не скрывать товары с нулевым остатком (для проверки на чекауте). */
  includeOutOfStock?: boolean;
}): Promise<Product[]> {
  const categoryMap = getCategoryUrlMap();
  const sort = SORT_MAP[options?.sort ?? "default"] ?? "NoSorting";
  const setMap = await getCachedSetMap();
  const includeOutOfStock = Boolean(options?.includeOutOfStock);

  if (options?.category) {
    const categoryUrl = categoryMap[options.category];
    if (!categoryUrl) return [];

    try {
      const items = await fetchAllCatalogProducts({
        url: categoryUrl,
        sorting: sort,
      });
      return mapCatalogItems(items, options.category, setMap, includeOutOfStock);
    } catch (error) {
      if (isMissingCategoryError(error)) {
        console.warn(
          `AdvantShop category not found for "${options.category}" (url: ${categoryUrl})`
        );
        return [];
      }
      throw error;
    }
  }

  const slugs = Object.keys(categoryMap) as CategorySlug[];
  if (!slugs.length) return [];

  const results = await Promise.all(
    slugs.map(async (slug) => {
      const url = categoryMap[slug];
      if (!url) return [] as Product[];

      try {
        const items = await fetchAllCatalogProducts({ url, sorting: sort });
        return mapCatalogItems(items, slug, setMap, includeOutOfStock);
      } catch (error) {
        if (isMissingCategoryError(error)) {
          console.warn(
            `AdvantShop category not found for "${slug}" (url: ${url})`
          );
          return [] as Product[];
        }
        throw error;
      }
    })
  );

  const merged = new Map<string, Product>();
  for (const list of results) {
    for (const product of list) {
      merged.set(product.id, product);
    }
  }

  return Array.from(merged.values());
}

export async function loadAdvantShopProductDetails(
  summary: Product,
): Promise<ProductDetails | undefined> {
  const [details, propertiesResponse] = await Promise.all([
    advantshopClientFetch<AdvantShopProductDetails>(
      `/api/products/${summary.id}`,
    ),
    advantshopClientFetch<AdvantShopPropertiesResponse>(
      `/api/products/${summary.id}/properties`,
      { searchParams: { type: "inDetails" } },
    ).catch(() => [] as AdvantShopPropertiesResponse),
  ]);

  const properties = flattenAdvantShopProperties(propertiesResponse);
  const product = mapProductDetails(
    details,
    summary.category,
    properties,
    summary.price,
  );

  return {
    ...product,
    slug: summary.slug,
    urlPath: summary.urlPath,
    // Каталог AdvantShop отдаёт price=0, если у модификации не стоит «Главная».
    // Не затираем цену из offers нулём из summary.
    price: product.price > 0 ? product.price : summary.price,
    stoneWeight:
      parseStoneWeightFromProperties(properties) || product.stoneWeight,
    stockAmount: product.stockAmount ?? summary.stockAmount,
    inStock: product.inStock !== false && summary.inStock !== false,
  };
}

export async function fetchAdvantShopProductDetails(
  slug: string
): Promise<ProductDetails | undefined> {
  const categoryMap = getCategoryUrlMap();
  const slugs = Object.keys(categoryMap) as CategorySlug[];

  const lists = await Promise.all(
    slugs.map(async (category) => ({
      category,
      products: await fetchAdvantShopProducts({ category }),
    }))
  );

  let summary: Product | undefined;

  for (const list of lists) {
    const match = findProductBySlug(list.products, slug);
    if (match) {
      summary = match;
      break;
    }
  }

  if (!summary) return undefined;

  return loadAdvantShopProductDetails(summary);
}

function parseStoneWeightFromProperties(
  properties: { name?: string; value?: string; propertyName?: string; propertyValue?: string }[]
): number {
  for (const property of properties) {
    const name = (property.propertyName ?? property.name ?? "").toLowerCase();
    const value = property.propertyValue ?? property.value ?? "";

    if (
      name.includes("карат") ||
      name.includes("вес камн") ||
      name.includes("вес брилл") ||
      name.includes("бриллиант")
    ) {
      const match = value.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
      if (match) return Number(match[1]);
    }
  }

  return 0;
}

export async function fetchAdvantShopProductsBySlugs(
  slugs: string[]
): Promise<Product[]> {
  if (!slugs.length) return [];

  const categoryMap = getCategoryUrlMap();
  const categories = Object.keys(categoryMap) as CategorySlug[];
  const slugSet = new Set(slugs);

  const lists = await Promise.all(
    categories.map((category) => fetchAdvantShopProducts({ category }))
  );

  const merged = lists.flat();
  return merged.filter(
    (product) => slugSet.has(product.slug) || slugSet.has(product.urlPath ?? "")
  );
}

export function resolveCategorySlugFromAdvantShopUrl(
  url: string
): CategorySlug | undefined {
  return getCategorySlugByUrl(url);
}
