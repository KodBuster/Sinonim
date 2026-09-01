import {
  formatInsertMassLabel,
  WITH_SYNTHETIC_DIAMOND,
} from "@/lib/synthetic-diamond-labels";
import { getProductCaratWeightLabel } from "@/lib/product-weight";
import {
  CATEGORIES,
  formatPrice,
  type ProductDetails,
} from "@/lib/products";

const MAX_META_DESCRIPTION_LENGTH = 160;

function truncateMetaDescription(text: string): string {
  if (text.length <= MAX_META_DESCRIPTION_LENGTH) return text;

  const cut = text.slice(0, MAX_META_DESCRIPTION_LENGTH - 1);
  const lastSpace = cut.lastIndexOf(" ");

  if (lastSpace > MAX_META_DESCRIPTION_LENGTH * 0.6) {
    return `${cut.slice(0, lastSpace)}…`;
  }

  return `${cut}…`;
}

export function buildProductMetaDescription(product: ProductDetails): string {
  const category = CATEGORIES[product.category].title.toLowerCase();
  const carat = getProductCaratWeightLabel(product);
  const mass = formatInsertMassLabel(
    Number.parseFloat(carat.replace(",", ".")) || product.stoneWeight,
  );
  const price = formatPrice(product.price);

  const description = [
    `${product.name} — ${category} из серебра 925 ${WITH_SYNTHETIC_DIAMOND}, ${mass}.`,
    `${product.metal}.`,
    "Добровольная аттестация качества, доставка по России, шоурум в Москве.",
    price,
  ].join(" ");

  return truncateMetaDescription(description);
}
