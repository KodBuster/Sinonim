import Link from "next/link";
import type { Metadata } from "next";
import { fetchAdvantShopProducts } from "@/lib/advantshop/catalog";
import { isAdvantShopConfigured } from "@/lib/advantshop/config";
import { pickGiftProducts } from "@/lib/gift-products";
import type { Product } from "@/lib/products";
import { PreviewCard } from "@/components/redesign/PreviewCard";

export const dynamic = "force-dynamic";
export const metadata:Metadata = { title:"Подарки — SYNONYM (предпросмотр)",robots:{index:false,follow:false} };

export default async function PreviewGiftsPage() {
  let items:Product[]=[];
  let hasCatalog=isAdvantShopConfigured();
  if(hasCatalog){
    try{
      const products=await fetchAdvantShopProducts({includeOutOfStock:true});
      items=pickGiftProducts(products.filter(p=>p.price>0&&p.inStock!==false));
    }catch(e){
      console.error("SYNONYM preview: gifts catalog unavailable",e);
      hasCatalog=false;
    }
  }
  return <main className="sn-container sn-catalog sn-preview-gifts">
    <nav className="sn-breadcrumbs"><Link href="/redesign-preview">Главная</Link> / Подарки</nav>
    <h1>Подарки</h1>
    <p className="sn-catalog-intro">Идеи для подарка из актуального каталога СИНОНИМ. Фотографии, цены и наличие получаем из AdvantShop.</p>
    {items.length ? <section className="sn-product-grid" aria-label="Подборка подарков">
      {items.map(product=><PreviewCard key={product.id} product={product}/>)}
    </section>:
    <p className="sn-notice" role="status">{hasCatalog?"Сейчас подходящих изделий нет.":"В тестовом окружении нет доступа к AdvantShop. Выдуманные товары и цены не отображаются."}</p>}
    <p className="sn-preview-gifts-return"><Link href="/redesign-preview/catalog">Смотреть все украшения ↗</Link></p>
  </main>;
}
