import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchAdvantShopProducts } from "@/lib/advantshop/catalog";
import { isAdvantShopConfigured } from "@/lib/advantshop/config";
import type { Product } from "@/lib/products";
import { COLLECTIONS, isShopCollectionSlug, SHOP_COLLECTION_ORDER } from "@/lib/redesign/collection-content";
import { CollectionPageView } from "@/components/redesign/CollectionPageView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{category: string}>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export function generateStaticParams() {
  return SHOP_COLLECTION_ORDER.map(category => ({ category }));
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {category} = await params;
  if (!isShopCollectionSlug(category)) return {title:"Каталог СИНОНИМ",robots:{index:false}};
  return {title:COLLECTIONS[category].title+" — новый каталог СИНОНИМ",description:COLLECTIONS[category].intro,robots:{index:false,follow:false}};
}

export default async function ShopCollectionPreview({params,searchParams}: Props) {
  const { category } = await params;
  if (!isShopCollectionSlug(category)) notFound();
  const query = await searchParams;
  const content = COLLECTIONS[category];
  let products: Product[] = [];
  let available = isAdvantShopConfigured();
  if (available) {
    try {
      products = await fetchAdvantShopProducts({category: content.category, includeOutOfStock: true});
    } catch (err) {
      console.error("SYNONYM collection preview: AdvantShop unavailable",err);
      available=false;
    }
  }
  const value=(key:string)=>typeof query[key]==="string"?query[key] as string:"";
  return <CollectionPageView
    slug={content.slug}
    products={products}
    apiAvailable={available}
    initialFilters={{sort:value("sort"),metal:value("metal"),stock:value("stock"),tag:value("tag"),size:value("size"),min:value("min"),max:value("max")}}
  />;
}
