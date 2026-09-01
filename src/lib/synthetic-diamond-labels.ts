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
