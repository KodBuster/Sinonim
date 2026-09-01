const CARAT_IN_DESCRIPTION_RE = /(\d+(?:[,.]\d+)?)\s*ct\b/i;

export function parseCaratWeightFromDescription(
  description: string,
): number | undefined {
  const match = description.match(CARAT_IN_DESCRIPTION_RE);
  if (!match) return undefined;

  const value = Number.parseFloat(match[1].replace(",", "."));
  return Number.isNaN(value) ? undefined : value;
}

export function formatCaratWeightFromDescription(
  description: string,
): string | undefined {
  const match = description.match(CARAT_IN_DESCRIPTION_RE);
  if (!match) return undefined;

  return match[1].replace(".", ",");
}

export function formatCaratWeight(value: number): string {
  return String(value).replace(".", ",");
}

export function isDiamondWeightPropertyName(name: string): boolean {
  const normalized = name
    .toLowerCase()
    .replace(/^свойство:\s*/u, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.includes("масса вставки");
}

export function formatDiamondWeightLabel(
  raw?: string | null,
): string | undefined {
  if (!raw?.trim()) return undefined;
  const match = raw.trim().match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return undefined;
  return match[1].replace(".", ",");
}

export function parseDiamondWeightNumber(
  raw?: string | null,
): number | undefined {
  const label = formatDiamondWeightLabel(raw);
  if (!label) return undefined;
  const value = Number.parseFloat(label.replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export type ProductCaratWeightSource = {
  stoneWeight: number;
  diamondWeightLabel?: string;
  sizeDiamondWeights?: Record<string, string>;
};

export function getProductCaratWeightLabel(
  product: ProductCaratWeightSource,
  sizeValue?: string | null,
): string {
  if (sizeValue && product.sizeDiamondWeights?.[sizeValue]) {
    return product.sizeDiamondWeights[sizeValue];
  }
  if (product.diamondWeightLabel?.trim()) {
    return product.diamondWeightLabel.trim();
  }
  return formatCaratWeight(product.stoneWeight);
}

export function getProductCaratWeight(
  product: ProductCaratWeightSource,
  sizeValue?: string | null,
): number {
  const label = getProductCaratWeightLabel(product, sizeValue);
  const value = Number.parseFloat(label.replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : product.stoneWeight;
}
