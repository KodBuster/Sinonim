/** Терминология вставок по ПП РФ №657 от 30.05.2026 */
export const SYNTHETIC_DIAMOND = "ограненный синтетический алмаз";
export const SYNTHETIC_DIAMONDS = "ограненные синтетические алмазы";
export const SYNTHETIC_DIAMOND_CAP = "Ограненный синтетический алмаз";
export const SYNTHETIC_DIAMONDS_CAP = "Ограненные синтетические алмазы";
export const WITH_SYNTHETIC_DIAMOND = "с ограненным синтетическим алмазом";
export const WITH_SYNTHETIC_DIAMONDS = "с ограненными синтетическими алмазами";
export const INSERT_WEIGHT_LABEL = "Масса вставки";

/** 1 карат = 0,2 г */
export function formatInsertMassGrams(caratWeight: number): string {
  const grams = caratWeight * 0.2;
  return grams.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}

export function formatInsertMassLabel(caratWeight: number): string {
  return `${formatInsertMassGrams(caratWeight)} г`;
}

/**
 * Масса ограненного синтетического алмаза из названия/описания, например «0,512 г» / «0,027гр.».
 */
export function extractInsertMassFromName(name: string): string | null {
  const match = name.match(/(\d+[.,]\d+)\s*г(?:р(?:амм)?\.?)?/i);
  if (!match?.[1]) return null;
  return `${match[1].replace(".", ",")} г`;
}

type InsertMassSource = {
  name: string;
  description?: string;
  diamondWeightLabel?: string;
  sizeDiamondWeights?: Record<string, string>;
  stoneWeight: number;
};

/**
 * Подпись «Масса вставки» для карточки.
 * diamondWeightLabel / sizeDiamondWeights уже в граммах (свойство AdvantShop).
 * fallback stoneWeight считается каратами (как в старых SEO-слагах).
 */
export function getInsertMassDisplayLabel(
  product: InsertMassSource,
  sizeValue?: string | null,
): string | null {
  const fromName = extractInsertMassFromName(product.name);
  if (fromName) return fromName;

  const fromDescription = product.description
    ? extractInsertMassFromName(product.description)
    : null;
  if (fromDescription) return fromDescription;

  const sizeLabel =
    sizeValue && product.sizeDiamondWeights?.[sizeValue]
      ? product.sizeDiamondWeights[sizeValue]
      : undefined;
  const propertyLabel = sizeLabel ?? product.diamondWeightLabel?.trim();
  if (propertyLabel) {
    return `${propertyLabel.replace(/\s*г$/i, "")} г`;
  }

  // Не показываем «0,04 г» из дефолтного stoneWeight=0.2 карат.
  if (product.stoneWeight === 0.2) return null;

  return formatInsertMassLabel(product.stoneWeight);
}
