import type { CategorySlug, Product, ProductDetails, ProductSizeOption, StoneVariant } from "@/lib/products";
import { defaultRingBraceletSizeOptions, sortProductSizeOptions } from "@/lib/products";
import { parseCaratWeightFromDescription } from "@/lib/product-weight";
import { resolveSetArtNos } from "@/lib/product-complect";
import { buildSeoProductSlug } from "@/lib/product-slug";
import { resolveProductImageUrl, resolveProductImages } from "./images";
import {
  getAdvantShopDetailsStockInfo,
  getAdvantShopStockAmount,
  getAvailableSizePickerSizes,
  parseAdvantShopAmount,
  type AdvantShopStockInfo,
} from "./stock";
import type {
  AdvantShopCatalogProduct,
  AdvantShopOffer,
  AdvantShopPhoto,
  AdvantShopProductDetails,
  AdvantShopProperty,
} from "./types";

function collectOfferArtNos(
  item: Pick<AdvantShopCatalogProduct, "artNo" | "offers">,
): string[] {
  const artNos = new Set<string>();
  const add = (value?: string | null) => {
    const trimmed = value?.trim();
    if (trimmed) artNos.add(trimmed);
  };

  add(item.artNo);
  for (const offer of item.offers ?? []) {
    add(offer.artNo);
  }

  return [...artNos];
}

export function extractProductSizeOptions(
  item: Pick<AdvantShopProductDetails, "sizeColorPicker">,
): ProductSizeOption[] {
  return (
    item.sizeColorPicker?.sizes?.map((size) => {
      const label = size.name.trim();
      return { value: label, label };
    }) ?? []
  );
}

/** @deprecated Используйте extractProductSizeOptions */
export function extractProductSizes(
  item: Pick<AdvantShopProductDetails, "sizeColorPicker">,
  _category: CategorySlug
): number[] {
  return extractProductSizeOptions(item)
    .map((option) => Number.parseFloat(option.value.replace(",", ".")))
    .filter((size) => !Number.isNaN(size));
}

const DEFAULT_IMAGE = "/images/product-ring.webp";

const STONE_VARIANT_WEIGHTS = [0.1, 0.2, 0.3, 0.5, 1] as const;

function pickImage(
  product: Pick<
    AdvantShopCatalogProduct,
    "photoMiddle" | "photoSmall" | "photos"
  >
): string {
  if (product.photoMiddle) return product.photoMiddle;
  if (product.photoSmall) return product.photoSmall;

  const photos = product.photos ?? [];
  const main =
    photos.find((photo) => photo.main) ?? photos[0];

  return (
    main?.middleSrc ??
    main?.bigSrc ??
    main?.smallSrc ??
    DEFAULT_IMAGE
  );
}

function collectImages(photos?: AdvantShopPhoto[] | null): string[] {
  if (!photos?.length) return [];

  return photos
    .map((photo) => photo.bigSrc ?? photo.middleSrc ?? photo.smallSrc)
    .filter((src): src is string => Boolean(src));
}

function parseStoneWeight(
  properties: AdvantShopProperty[],
  description?: string,
): number {
  for (const property of properties) {
    const name = (property.propertyName ?? property.name ?? "").toLowerCase();
    const value = property.propertyValue ?? property.value ?? "";

    if (
      name.includes("карат") ||
      name.includes("вес камн") ||
      name.includes("вес брилл") ||
      name.includes("бриллиант") ||
      name.includes("carat")
    ) {
      const match = value.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
      if (match) return Number(match[1]);
    }
  }

  if (description) {
    const fromDescription = parseCaratWeightFromDescription(description);
    if (fromDescription !== undefined) return fromDescription;
  }

  return 0.2;
}

function parseWeightGrams(properties: AdvantShopProperty[]): string | undefined {
  const fromProperty = parseProperty(properties, [
    "вес, гр.",
    "вес, гр",
    "вес гр",
  ]);
  if (fromProperty?.trim()) return fromProperty.trim();

  for (const property of properties) {
    const name = (property.propertyName ?? property.name ?? "").toLowerCase();
    const value = (property.propertyValue ?? property.value ?? "").trim();
    if (!value) continue;

    if (name === "вес, гр." || (name.includes("вес") && name.includes("гр"))) {
      return value;
    }
  }

  return undefined;
}

function parseProperty(
  properties: AdvantShopProperty[],
  keywords: string[]
): string | undefined {
  for (const property of properties) {
    const name = (property.propertyName ?? property.name ?? "").toLowerCase();
    if (keywords.some((keyword) => name.includes(keyword))) {
      const value = (property.propertyValue ?? property.value)?.trim();
      if (value) return value;
    }
  }

  return undefined;
}

function pickPositivePrice(
  ...candidates: Array<number | null | undefined>
): number | undefined {
  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return Math.round(value);
    }
  }
  return undefined;
}

function pickOfferPrice(
  offers: AdvantShopOffer[] | null | undefined,
): number {
  if (!offers?.length) return 0;

  const main = offers.find((offer) => offer.isMain);
  const fromMain = pickPositivePrice(main?.price);
  if (fromMain !== undefined) return fromMain;

  const withPrice = offers.find((offer) => (offer.price ?? 0) > 0);
  return pickPositivePrice(withPrice?.price, offers[0]?.price) ?? 0;
}

function pickDefaultArtNo(
  item: Pick<AdvantShopProductDetails, "artNo" | "offers">
): string {
  return (
    item.artNo ??
    item.offers?.find((offer) => offer.isMain)?.artNo ??
    item.offers?.find((offer) => (offer.price ?? 0) > 0)?.artNo ??
    item.offers?.[0]?.artNo ??
    ""
  );
}

function buildSizeArtNos(
  item: AdvantShopProductDetails,
  sizes: { id: number; name: string }[],
): Record<string, string> | undefined {
  if (!sizes.length || !item.offers?.length) {
    return undefined;
  }

  const map: Record<string, string> = {};
  const fallbackArtNo = pickDefaultArtNo(item);

  for (const size of sizes) {
    const sizeKey = size.name.trim();
    if (!sizeKey) continue;

    const offer = item.offers.find((entry) => entry.sizeId === size.id);
    // Пропускаем только явно нулевой остаток; без amount — оставляем
    if (offer) {
      const amount = parseAdvantShopAmount(offer.amount);
      if (amount !== undefined && amount <= 0) continue;
    }

    const artNo = offer?.artNo ?? fallbackArtNo;
    if (artNo) map[sizeKey] = artNo;
  }

  return Object.keys(map).length ? map : undefined;
}

function buildSizeStockAmounts(
  item: AdvantShopProductDetails,
  sizes: { id: number; name: string }[],
): Record<string, number> | undefined {
  if (!sizes.length || !item.offers?.length) return undefined;

  const map: Record<string, number> = {};
  for (const size of sizes) {
    const sizeKey = size.name.trim();
    if (!sizeKey) continue;
    const offer = item.offers.find((entry) => entry.sizeId === size.id);
    const amount = offer ? parseAdvantShopAmount(offer.amount) : undefined;
    if (amount === undefined) continue;
    map[sizeKey] = amount;
  }

  return Object.keys(map).length ? map : undefined;
}

function mapBadge(
  product: Pick<AdvantShopCatalogProduct, "newProduct" | "bestseller" | "sales">
): Product["badge"] {
  if (product.newProduct) return "Новинка";
  if (product.bestseller) return "Хит";
  if (product.sales) return "Хит";
  return undefined;
}

function resolveCatalogSizeOptions(
  sizeOptions: ProductSizeOption[],
  category: CategorySlug
): ProductSizeOption[] | undefined {
  const needsSizes =
    category === "rings" || category === "bracelets" || sizeOptions.length > 0;
  if (!needsSizes) return undefined;
  if (sizeOptions.length) return sortProductSizeOptions(sizeOptions);
  if (category === "rings" || category === "bracelets") {
    return defaultRingBraceletSizeOptions();
  }
  return undefined;
}

export function mapCatalogProduct(
  item: AdvantShopCatalogProduct,
  category: CategorySlug,
  setArtNos?: string[],
  stock?: AdvantShopStockInfo,
): Product {
  const price =
    pickPositivePrice(
      item.priceWithDiscount,
      item.price,
      pickOfferPrice(item.offers),
    ) ?? 0;
  const sizeOptions = extractProductSizeOptions(item);

  const description = item.briefDescription || undefined;
  const stoneWeight = description
    ? (parseCaratWeightFromDescription(description) ?? 0.2)
    : 0.2;
  const legacySlug = item.urlPath;
  const artNo =
    item.artNo ??
    item.offers?.find((offer) => offer.isMain)?.artNo ??
    item.offers?.[0]?.artNo;
  const stockAmount = stock?.stockAmount ?? getAdvantShopStockAmount(item);
  const inStock =
    stock?.inStock ??
    (stockAmount === undefined ? true : stockAmount > 0);
  const listOfferArtNos = collectOfferArtNos(item);
  const offerArtNos = stock?.offerArtNos?.length
    ? [...new Set([...stock.offerArtNos, ...listOfferArtNos])]
    : listOfferArtNos;

  return {
    id: String(item.productId),
    slug: buildSeoProductSlug({
      name: item.name,
      category,
      stoneWeight,
      legacySlug,
      productId: String(item.productId),
    }),
    urlPath: legacySlug,
    name: item.name,
    category,
    price,
    image: resolveProductImageUrl(pickImage(item)),
    stoneWeight,
    badge: mapBadge(item),
    isNew: Boolean(item.newProduct),
    description,
    images: resolveProductImages(collectImages(item.photos)),
    sizeOptions: resolveCatalogSizeOptions(sizeOptions, category),
    artNo,
    offerArtNos,
    setArtNos: setArtNos?.length ? setArtNos : undefined,
    stockAmount,
    inStock,
  };
}
export function mapProductDetails(
  item: AdvantShopProductDetails,
  category: CategorySlug,
  properties: AdvantShopProperty[] = [],
  catalogPrice?: number,
): ProductDetails {
  const offerPrice = pickOfferPrice(item.offers);
  const basePrice = pickPositivePrice(catalogPrice, offerPrice) ?? 0;

  const description =
    item.description ||
    item.briefDescription ||
    `${item.name} — украшение из серебра 925 пробы с лабораторным бриллиантом.`;

  const stoneWeight = parseStoneWeight(properties, description);
  const rawImages = collectImages(item.photos);
  const images = resolveProductImages(rawImages);
  const fallbackImage = images[0] ?? DEFAULT_IMAGE;

  const stoneVariants: StoneVariant[] = STONE_VARIANT_WEIGHTS.map((weight) => ({
    weight,
    label: weight >= 1 ? "1 карат" : `${weight} карат`,
    price:
      Math.abs(weight - stoneWeight) < 0.001
        ? basePrice
        : Math.round(basePrice * (weight / Math.max(stoneWeight, 0.1))),
  }));

  const allSizes = item.sizeColorPicker?.sizes ?? [];
  const availableSizes = getAvailableSizePickerSizes(item);

  const sizeOptions = availableSizes.map((size) => {
    const label = size.name.trim();
    return { value: label, label };
  });
  const hasSizes =
    category === "rings" || category === "bracelets" || allSizes.length > 0;
  const artNo = pickDefaultArtNo(item);
  const sizeArtNos = buildSizeArtNos(item, availableSizes);
  // Остатки по всем размерам (включая 0) — для проверки на чекауте
  const sizeStockAmounts = buildSizeStockAmounts(item, allSizes);
  const legacySlug = item.urlPath;
  const setArtNos = resolveSetArtNos(properties);
  const { stockAmount, inStock } = getAdvantShopDetailsStockInfo(
    item,
    category,
  );

  return {
    id: String(item.productId),
    slug: buildSeoProductSlug({
      name: item.name,
      category,
      stoneWeight,
      legacySlug,
      productId: String(item.productId),
    }),
    urlPath: legacySlug,
    name: item.name,
    category,
    price: basePrice,
    image: fallbackImage,
    stoneWeight,
    badge: mapBadge(item),
    isNew: Boolean(item.newProduct),
    description,
    images: images.length ? images : [fallbackImage],
    cut:
      parseProperty(properties, ["огранк", "cut", "brilliant", "гранен"]) ??
      "Круглая (57 граней)",
    color: parseProperty(properties, ["цвет", "color"]) ?? "2",
    clarity: parseProperty(properties, ["чистот", "clarity"]) ?? "5",
    metal:
      parseProperty(properties, ["металл", "проба", "silver"]) ??
      "Серебро 925, родиевое покрытие",
    sizeOptions: hasSizes ? sortProductSizeOptions(sizeOptions) : [],
    stoneVariants,
    artNo: artNo || undefined,
    sizeArtNos,
    sizeStockAmounts,
    offerArtNos: collectOfferArtNos(item),
    weightGrams: parseWeightGrams(properties),
    setArtNos: setArtNos.length ? setArtNos : undefined,
    stockAmount,
    inStock,
  };
}
