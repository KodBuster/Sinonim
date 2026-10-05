/** Коллекция FW 2026: в AdvantShop поле «Производитель» = «FW 2026». */
export const FW2026_COLLECTION = {
  slug: "fw-2026",
  manufacturer: "FW 2026",
  title: "Новая коллекция FW 2026",
  shortTitle: "Новая коллекция",
  eyebrow: "Коллекция",
  description:
    "Новая коллекция FW 2026 — украшения из серебра 925 с ограненными синтетическими алмазами.",
  href: "/collections/fw-2026",
  badge: "Новинка" as const,
};

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
