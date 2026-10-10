"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { useProductSelection } from "@/components/product/ProductSelectionContext";
import { trackAddToCart } from "@/lib/analytics/metrika";
import { formatPrice,type ProductDetails } from "@/lib/products";
import { formatInsertMassLabel,getInsertMassDisplayLabel } from "@/lib/synthetic-diamond-labels";

export function PreviewPdpPurchase({product}:{product:ProductDetails}){
 const {selectedSize,setSelectedSize,selectedSizeLabel,price,artNo,diamondWeight}=useProductSelection();
 const [added,setAdded]=useState(false);
 const [sizeGuideOpen,setSizeGuideOpen]=useState(false);
 const guideCloseRef=useRef<HTMLButtonElement>(null);
 const {addItem,isReady}=useCart();
 const sizeStock=selectedSize?product.sizeStockAmounts?.[selectedSize]:undefined;
 const sizeAvailable=sizeStock===undefined||sizeStock>0;
 const canBuy=isReady&&product.inStock!==false&&sizeAvailable&&(product.sizeOptions.length===0||selectedSize!==null);
 const insertWeight=getInsertMassDisplayLabel(product,selectedSize);
 const mass=selectedSize?product.sizeWeightGrams?.[selectedSize]:undefined;
 useEffect(()=>{
  if(!sizeGuideOpen)return;
  guideCloseRef.current?.focus();
  const handler=(event:KeyboardEvent)=>{if(event.key==="Escape")setSizeGuideOpen(false);};
  window.addEventListener("keydown",handler);
  return ()=>window.removeEventListener("keydown",handler);
 },[sizeGuideOpen]);

 const add=()=>{
  if(!canBuy)return;
  addItem({productSlug:product.slug,name:product.name,image:product.image,price,
   stoneWeight:diamondWeight,stoneLabel:formatInsertMassLabel(diamondWeight),size:selectedSize,artNo});
  trackAddToCart({id:artNo??product.slug,name:product.name,price,category:product.category,
   variant:selectedSizeLabel?"размер "+selectedSizeLabel:undefined});
  setAdded(true);
 };
 return <div className="sn-pdp04-purchase">
  <div className="sn-pdp04-purchase-top">
   <div>{product.badge&&<span className="sn-pdp04-badge">{product.badge}</span>}
    <p className="sn-pdp04-brand">СИНОНИМ / SYNONYM</p>
    <h1>{product.name}</h1>
   </div>
   <FavoriteButton slug={product.slug} className="!opacity-100 !h-11 !w-11 !bg-[#f7f5f2]"/>
  </div>
  {product.manufacturer&&<p className="sn-pdp04-maker">{product.manufacturer}</p>}
  <p className="sn-pdp04-price">{formatPrice(price)}</p>
  {product.inStock===false&&<p className="sn-pdp04-stock is-out" role="status">Нет в наличии</p>}
  {product.inStock!==false&&sizeStock!==undefined&&<p className={"sn-pdp04-stock"+(!sizeAvailable?" is-out":"")} role="status">{sizeAvailable?"Размер в наличии":"Выбранного размера нет в наличии"}</p>}
  {product.metal&&<div className="sn-pdp04-property"><span className="sn-pdp04-property-label">Металл</span><span className="sn-pdp04-property-value">{product.metal}</span></div>}
  {insertWeight&&<div className="sn-pdp04-property"><span className="sn-pdp04-property-label">Масса вставки</span><span className="sn-pdp04-property-value">{insertWeight}</span></div>}
  {product.sizeOptions.length>0&&<div className="sn-pdp04-sizing">
   <div className="sn-pdp04-sizeheading"><span><strong>Размер:</strong> {selectedSizeLabel??"Выберите"}</span><button type="button" onClick={()=>setSizeGuideOpen(true)}>Как определить размер ↗</button></div>
   <div className="sn-pdp04-sizes" role="radiogroup" aria-label="Размер изделия">
    {product.sizeOptions.map(size=>{
     const available=product.sizeStockAmounts?.[size.value]===undefined||product.sizeStockAmounts[size.value]>0;
     return <button type="button" role="radio" key={size.value} aria-checked={selectedSize===size.value}
      aria-label={size.label+(available?"":" — нет в наличии")} title={available?undefined:"Нет в наличии"}
      disabled={!available} onClick={()=>{setSelectedSize(size.value);setAdded(false)}}
      className={"sn-pdp04-size"+(selectedSize===size.value?" is-selected":"")}>{size.label}</button>;
    })}
   </div>
  </div>}
  {artNo&&<p className="sn-pdp04-art">Артикул: {artNo}</p>}
  {(mass||product.weightGrams)&&<p className="sn-pdp04-art">Вес изделия: {mass??product.weightGrams} г</p>}
  <div className="sn-pdp04-cta">
   <button type="button" data-add-to-cart onClick={add} disabled={!canBuy}>{product.inStock===false||!sizeAvailable?"Нет в наличии":added?"Добавлено ✓":"Добавить в корзину"}</button>
   {added&&<p role="status">Украшение добавлено. <Link href="/cart">Перейти в корзину ↗</Link></p>}
   <Link href="/showroom" className="sn-pdp04-secondary-cta">Примерить в шоуруме ↗</Link>
  </div>
  <div className="sn-pdp04-deliverynote"><span aria-hidden="true">↗</span><p>Доставка и оплата: актуальные условия — в <Link href="/shipping">разделе доставки</Link>.</p></div>
  {sizeGuideOpen&&<div className="sn-pdp04-sizeoverlay" onClick={()=>setSizeGuideOpen(false)}>
   <div className="sn-pdp04-sizepanel" role="dialog" aria-modal="true" aria-label="Как определить размер" onClick={e=>e.stopPropagation()}>
    <button type="button" ref={guideCloseRef} aria-label="Закрыть подсказку по размеру" onClick={()=>setSizeGuideOpen(false)}>×</button>
    <p className="sn-pdp04-brand">СПРАВОЧНИК СИНОНИМ</p><h2>Как определить размер</h2>
    <p>Измерьте внутренний диаметр подходящего кольца либо воспользуйтесь руководством. Доступные размеры конкретного изделия указаны выше.</p>
    <Link href="/how-size-ring">Открыть руководство ↗</Link>
   </div>
  </div>}
 </div>;
}
