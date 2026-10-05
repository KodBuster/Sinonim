/** Коллекция FW 2026: в AdvantShop «Производитель» = «FW 2026», URL /manufacturers/fw-2026. */
export const FW2026_COLLECTION = {
  slug: "fw-2026",
  manufacturer: "FW 2026",
  /** urlPath производителя в AdvantShop. */
  brandUrl: "fw-2026",
  title: "Новая коллекция FW 2026",
  shortTitle: "Новая коллекция",
  eyebrow: "Коллекция",
  description:
    "Новая коллекция FW 2026 — украшения из серебра 925 с ограненными синтетическими алмазами.",
  href: "/collections/fw-2026",
  badge: "Новинка" as const,
};

/**
 * Канонические ID товаров производителя FW 2026
 * (AdvantShop /manufacturers/fw-2026, страницы 1–2).
 * Нужны как источник истины: Client API не отдаёт Brand, а HTML-скрейп
 * может быть недоступен с деплоя.
 */
export const FW2026_PRODUCT_IDS = [
  "12872",
  "12873",
  "12874",
  "12875",
  "12876",
  "12877",
  "12878",
  "12879",
  "12880",
  "12881",
  "12882",
  "12883",
  "12884",
  "12885",
  "12886",
  "12887",
  "12888",
  "12889",
  "12890",
  "12891",
  "12892",
  "12893",
  "12894",
  "12895",
] as const;

export const FW2026_PRODUCT_ID_SET = new Set<string>(FW2026_PRODUCT_IDS);

export function isFw2026ProductId(id: string | number | null | undefined): boolean {
  if (id === null || id === undefined) return false;
  return FW2026_PRODUCT_ID_SET.has(String(id));
}

export function normalizeManufacturer(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

export function isFw2026Manufacturer(
  value: string | null | undefined,
): boolean {
  const normalized = normalizeManufacturer(value).toLowerCase();
  if (!normalized) return false;
  return (
    normalized === FW2026_COLLECTION.manufacturer.toLowerCase() ||
    normalized === "fw2026" ||
    normalized.includes("fw 2026") ||
    normalized.includes("fw-2026") ||
    normalized.includes("fw2026")
  );
}
