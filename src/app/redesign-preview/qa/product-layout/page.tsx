import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { ProductDetails } from "@/lib/products";
import { ProductSelectionProvider } from "@/components/product/ProductSelectionContext";
import { PreviewPdpGallery } from "@/components/redesign/PreviewPdpGallery";
import { PreviewPdpPurchase } from "@/components/redesign/PreviewPdpPurchase";
import { PreviewPdpInformation } from "@/components/redesign/PreviewPdpInformation";

// Browser QA only. This route returns 404 unless explicitly enabled on the test server.
// Illustrative media and values are NOT real products, prices, stock, or AdvantShop data.
export const dynamic="force-dynamic";
const fixture:ProductDetails={
 id:"qa-only-fixture",slug:"qa-only-not-a-product",name:"Технический макет карточки",category:"rings",
 price:0,stoneWeight:0,images:["/images/product-ring.webp","/images/categories/rings.jpg"],
 image:"/images/product-ring.webp",inStock:false,description:"Тестовая проверка структуры страницы товара. Здесь нет реального артикула, цены и характеристик. В рабочей карточке эти сведения поступают только из AdvantShop.",
 color:"",clarity:"",cut:"",metal:"",sizeOptions:[{value:"16",label:"16"},{value:"16.5",label:"16,5"},{value:"17",label:"17"},{value:"18",label:"18"}],
 stoneVariants:[],sizeStockAmounts:{"16":0,"16.5":1,"17":1,"18":1},
};
export default function QaProductPage(){
 if(process.env.SYNONYM_PDP_QA_FIXTURE!=="1")notFound();
 return <main className="sn-container sn-pdp04">
  <div className="sn-pdp04-qa-warning" role="status">ТЕХНИЧЕСКАЯ ПРОВЕРКА ВЁРСТКИ · НЕ ТОВАР · НЕТ ЦЕНЫ И ЗАКАЗА</div>
  <Suspense fallback={null}><ProductSelectionProvider product={fixture}>
   <div className="sn-pdp04-overview">
    <PreviewPdpGallery images={fixture.images} name={fixture.name}/>
    <PreviewPdpPurchase product={fixture} qaDemo/>
   </div>
   <div className="sn-pdp04-info-row"><div className="sn-pdp04-benefits"><div>Для проверки дизайна</div></div><PreviewPdpInformation product={fixture}/></div>
  </ProductSelectionProvider></Suspense>
 </main>;
}
