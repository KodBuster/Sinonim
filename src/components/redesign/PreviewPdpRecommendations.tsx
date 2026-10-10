"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { PreviewCard } from "./PreviewCard";

export function PreviewPdpRecommendations({complements,related,categoryHref}:{
 complements:Product[];related:Product[];categoryHref:string;
}){
 const [tab,setTab]=useState<"set"|"related">(complements.length?"set":"related");
 if(!complements.length&&!related.length)return null;
 const products=tab==="set"?complements:related;
 return <section className="sn-pdp04-related" aria-labelledby="sn-pdp04-recommended-title">
  <div className="sn-pdp04-related-top"><h2 id="sn-pdp04-recommended-title">Дополните образ</h2><Link href={categoryHref}>Все украшения ↗</Link></div>
  {complements.length>0&&<div className="sn-pdp04-related-toggle" role="tablist" aria-label="Подборки украшений">
   <button type="button" role="tab" aria-selected={tab==="set"} onClick={()=>setTab("set")}>Из одного комплекта</button>
   {related.length>0&&<button type="button" role="tab" aria-selected={tab==="related"} onClick={()=>setTab("related")}>Похожие модели</button>}
  </div>}
  <div role="tabpanel" className="sn-pdp04-related-grid">
   {products.map(item=><PreviewCard product={item} key={item.id}/>)}
  </div>
 </section>;
}
