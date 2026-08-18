export function isLengthMmPropertyName(name: string): boolean {
  const normalized = name
    .toLowerCase()
    .replace(/^свойство:\s*/u, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.includes("длина") && normalized.includes("мм");
}

export function formatLengthMmLabel(
  raw?: string | number | null,
): string | undefined {
  if (raw == null || raw === "") return undefined;
  const text = String(raw).trim();
  if (!text) return undefined;
  const match = text.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return undefined;
  const value = Number.parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(value) || value <= 0) return undefined;
  if (Number.isInteger(value)) return String(value);
  return String(value).replace(".", ",");
}

export type ProductLengthMmSource = {
  lengthMmLabel?: string;
  sizeLengthMm?: Record<string, string>;
};

export function getProductLengthMmLabel(
  product: ProductLengthMmSource,
  sizeValue?: string | null,
): string | undefined {
  if (sizeValue && product.sizeLengthMm?.[sizeValue]) {
    return product.sizeLengthMm[sizeValue];
  }
  return product.lengthMmLabel?.trim() || undefined;
}
