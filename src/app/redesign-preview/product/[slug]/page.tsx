import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchAdvantShopProducts, loadAdvantShopProductDetails } from "@/lib/advantshop/catalog";
import { isAdvantShopConfigured } from "@/lib/advantshop/config";
import { findProductBySlug } from "@/lib/product-slug";
import { CATEGORIES,type CategorySlug } from "@/lib/products";
import { ProductSelectionProvider } from "@/components/product/ProductSelectionContext";
import { PreviewPdpGallery } from "@/components/redesign/PreviewPdpGallery";
import { PreviewPdpPurchase } from "@/components/redesign/PreviewPdpPurchase";
import { PreviewPdpInformation } from "@/components/redesign/PreviewPdpInformation";
import { PreviewPdpRecommendations } from "@/components/redesign/PreviewPdpRecommendations";
import { resolveProductVideoUrl } from "@/lib/product-video";

export const dynamic="force-dynamic";

const categories:{slug:CategorySlug;title:string;image:string;href:string}[]=[
 {slug:"rings",title:"Кольца",image:"/images/categories/rings.jpg",href:"/redesign-preview/collections/rings"},
 {slug:"earrings",title:"Серьги",image:"/images/categories/earrings.jpg",href:"/redesign-preview/collections/earrings"},
 {slug:"pendants",title:"Колье",image:"/images/categories/pendants.jpg",href:"/redesign-preview/collections/necklaces"},
 {slug:"bracelets",title:"Браслеты",image:"/images/categories/bracelets.jpg",href:"/redesign-preview/collections/bracelets"},
];

function ServiceUnavailable(){
 return <main className="sn-container sn-pdp04 sn-preview-error" role="status">
  <nav className="sn-pdp04-crumbs"><Link href="/redesign-preview">Главная</Link> / <Link href="/redesign-preview/catalog">Каталог</Link></nav>
  <h1>Каталог временно недоступен</h1>
  <p>Не удалось получить актуальные данные товара из AdvantShop. Цена и остаток не отображаются, чтобы не вводить покупателя в заблуждение.</p>
  <Link href="/redesign-preview/catalog">Перейти в каталог ↗</Link>
 </main>;
}

export default async function PreviewProductPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(!isAdvantShopConfigured())return <ServiceUnavailable/>;
 let catalog;
 try{catalog=await fetchAdvantShopProducts({includeOutOfStock:true});}
 catch(error){console.error("SYNONYM preview: catalog unavailable",error);return <ServiceUnavailable/>;}
 const summary=findProductBySlug(catalog,slug);
 if(!summary)notFound();
 let product;
 try{product=await loadAdvantShopProductDetails(summary);}
 catch(error){console.error("SYNONYM preview: product details unavailable",error);return <ServiceUnavailable/>;}
 if(!product)notFound();
 const related=catalog.filter(p=>p.category===product.category&&p.id!==product.id).slice(0,8);
 const realSetArtNos=new Set(product.setArtNos??[]);
 const complements=realSetArtNos.size?catalog.filter(p=>
  p.id!==product.id&&(Boolean(p.artNo&&realSetArtNos.has(p.artNo))||p.offerArtNos?.some(n=>realSetArtNos.has(n)))
 ).slice(0,4):[];
 const categoryHref=categories.find(x=>x.slug===product.category)?.href??"/redesign-preview/catalog";
 const productVideoUrl=resolveProductVideoUrl([product.artNo,...Object.values(product.sizeArtNos??{}),...(product.offerArtNos??[])]);
 return <main className="sn-container sn-pdp04">
  <nav className="sn-pdp04-crumbs" aria-label="Хлебные крошки">
   <Link href="/redesign-preview">Главная</Link><span>/</span><Link href="/redesign-preview/catalog">Каталог</Link>
   <span>/</span><Link href={categoryHref}>{CATEGORIES[product.category].title}</Link><span>/</span><span aria-current="page">{product.name}</span>
  </nav>
  <Suspense fallback={null}>
   <ProductSelectionProvider product={product}>
    <div className="sn-pdp04-overview">
     <PreviewPdpGallery images={product.images?.length?product.images:[product.image]} name={product.name} videoUrl={productVideoUrl}/>
     <PreviewPdpPurchase product={product}/>
    </div>
    <div className="sn-pdp04-info-row">
     <div className="sn-pdp04-benefits" aria-label="Полезная информация о покупке">
      <Link href="/shipping"><span aria-hidden="true">↗</span>Доставка и оплата</Link>
      <Link href="/warranty"><span aria-hidden="true">◇</span>Гарантия</Link>
      <Link href="/showroom"><span aria-hidden="true">⌖</span>Примерка в шоуруме</Link>
     </div>
     <PreviewPdpInformation product={product}/>
    </div>
   </ProductSelectionProvider>
  </Suspense>
  <PreviewPdpRecommendations complements={complements} related={related} categoryHref={categoryHref}/>
  <section className="sn-pdp04-collections" aria-labelledby="sn-pdp04-collections-title">
   <h2 id="sn-pdp04-collections-title">Продолжить знакомство</h2>
   <div className="sn-pdp04-collection-links">{categories.map(item=><Link key={item.slug} href={item.href}>{item.title} ↗</Link>)}</div>
   <div className="sn-pdp04-category-grid">{categories.map(item=><Link key={item.slug} href={item.href} className="sn-pdp04-category">
    <Image src={item.image} fill sizes="(max-width:700px) 50vw,25vw" alt={item.title}/>
    <span>{item.title} ↗</span>
   </Link>)}</div>
  </section>
  <section className="sn-pdp04-reviews" aria-labelledby="sn-pdp04-reviews-title">
   <h2 id="sn-pdp04-reviews-title">Отзывы</h2>
   <p>Подтверждённые отзывы по этому изделию пока не подключены. Оценки и количество отзывов не подменяем демонстрационными данными.</p>
  </section>
 </main>;
}
