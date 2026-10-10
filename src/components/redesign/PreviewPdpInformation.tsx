"use client";

import Link from "next/link";
import { useProductSelection } from "@/components/product/ProductSelectionContext";
import { getInsertMassDisplayLabel } from "@/lib/synthetic-diamond-labels";
import { splitDescriptionForSeoDisplay } from "@/lib/product-description";
import type { ProductDetails } from "@/lib/products";

export function PreviewPdpInformation({product}:{product:ProductDetails}){
 const {selectedSize,artNo}=useProductSelection();
 const mass=getInsertMassDisplayLabel(product,selectedSize);
 const description=splitDescriptionForSeoDisplay(product.description)
  .filter(segment=>segment.type!=="seoHidden").map(segment=>segment.text).join("");
 const grams=selectedSize?product.sizeWeightGrams?.[selectedSize]:undefined;
 const facts=[
  ["Металл",product.metal],["Огранка",product.cut],["Масса вставки",mass],
  ["Вес изделия",(grams??product.weightGrams)?(grams??product.weightGrams)+" г":undefined],
  ["Артикул",artNo],
 ].filter((entry):entry is [string,string]=>Boolean(entry[1]));
 return <div className="sn-pdp04-accordions" aria-label="Информация о товаре">
  <details open><summary>Почему вам понравится <span aria-hidden="true"/></summary>
   <div className="sn-pdp04-accordion-body"><p>{description||"Подробное описание уточняется в каталоге."}</p></div>
  </details>
  <details><summary>Характеристики и размеры <span aria-hidden="true"/></summary>
   <div className="sn-pdp04-accordion-body">
    <dl className="sn-pdp04-facts">{facts.map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
    {product.sizeOptions.length>0&&<p><Link href="/how-size-ring">Подобрать размер ↗</Link></p>}
   </div>
  </details>
  <details><summary>Как сочетать <span aria-hidden="true"/></summary>
   <div className="sn-pdp04-accordion-body"><p>Посмотрите украшения той же категории в подборке ниже и создайте своё сочетание.</p></div>
  </details>
  <details><summary>Доставка и возврат <span aria-hidden="true"/></summary>
   <div className="sn-pdp04-accordion-body"><p>Актуальные сроки, стоимость доставки, условия оплаты и возврата указаны в официальных разделах магазина.</p>
    <p><Link href="/shipping">Доставка и оплата ↗</Link> · <Link href="/warranty">Гарантийные условия ↗</Link></p>
   </div>
  </details>
  <details><summary>Уход за украшением <span aria-hidden="true"/></summary>
   <div className="sn-pdp04-accordion-body"><p>Храните украшение отдельно, избегайте агрессивных чистящих средств. Для чистки используйте мягкую ткань; рекомендации зависят от материала и покрытия.</p>
    <p><Link href="/guide">Рекомендации по выбору и уходу ↗</Link></p>
   </div>
  </details>
 </div>;
}
