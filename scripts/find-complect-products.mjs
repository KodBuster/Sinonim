import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const base = process.env.ADVANTSHOP_BASE_URL.replace(/\/$/, "");
const clientKey = process.env.ADVANTSHOP_CLIENT_API_KEY;
const categoryMap = Object.fromEntries(
  (process.env.ADVANTSHOP_CATEGORY_MAP ?? "")
    .split(",")
    .map((pair) => pair.split(":"))
    .filter(([slug, url]) => slug && url),
);

async function api(path, { method = "GET", body, searchParams = {} } = {}) {
  const url = new URL(`${base}/${path.replace(/^\//, "")}`);
  url.searchParams.set("apikey", clientKey);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, {
    method,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${path}: ${response.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function fetchAllCatalogProducts(categoryUrl) {
  const products = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await api("/api/catalog", {
      method: "POST",
      body: { url: categoryUrl, sorting: "NoSorting", page, itemsPerPage: 500 },
    });
    products.push(...(response.products ?? []));
    totalPages = response.pager?.totalPageCount ?? 1;
    page += 1;
  } while (page <= totalPages);

  return products;
}

function flattenProperties(response) {
  if (Array.isArray(response)) {
    return response.flatMap((group) => group.properties ?? []);
  }
  return response.properties ?? [];
}

function getSetProperty(properties) {
  for (const property of properties) {
    const name = (property.propertyName ?? property.name ?? "").trim();
    if (!/^set$/i.test(name)) continue;
    const value = (property.propertyValue ?? property.value ?? "").trim();
    return { name, value };
  }
  return null;
}

function hasSetArtNos(value) {
  if (!value) return false;
  return value.split(",").some((part) => part.trim());
}

async function fetchProperties(productId) {
  const response = await api(`/api/products/${productId}/properties`, {
    searchParams: { type: "inDetails" },
  });
  return flattenProperties(response);
}

async function mapPool(items, concurrency, worker) {
  const results = [];
  let index = 0;

  async function run() {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

const allProducts = new Map();

for (const [slug, url] of Object.entries(categoryMap)) {
  const items = await fetchAllCatalogProducts(url);
  for (const item of items) {
    if (!allProducts.has(item.productId)) {
      allProducts.set(item.productId, { ...item, category: slug });
    }
  }
}

console.error(`Catalog: ${allProducts.size} unique products`);

const products = [...allProducts.values()];
const matches = [];

await mapPool(products, 8, async (product) => {
  try {
    const properties = await fetchProperties(product.productId);
    const setProp = getSetProperty(properties);
    if (setProp && hasSetArtNos(setProp.value)) {
      matches.push({
        id: product.productId,
        artNo: product.artNo,
        name: product.name,
        category: product.category,
        urlPath: product.urlPath,
        set: setProp.value,
      });
    }
  } catch (error) {
    console.error(`Error ${product.productId}:`, error.message);
  }
});

matches.sort((a, b) => String(a.artNo ?? "").localeCompare(String(b.artNo ?? "")));

console.log(JSON.stringify(matches, null, 2));
console.error(`Found: ${matches.length} products with non-empty "Set"`);
