import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAdvantShopProducts, loadAdvantShopProductDetails } from "@/lib/advantshop/catalog";
import { isAdvantShopConfigured } from "@/lib/advantshop/config";
import { findProductBySlug } from "@/lib/product-slug";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import { ProductSelectionProvider } from "@/components/product/ProductSelectionContext";
import { ProductDescription } from "@/components/product/ProductDescription";
import { ProductCharacteristics } from "@/components/product/ProductCharacteristics";
import { PreviewCard } from "@/components/redesign/PreviewCard";
import { resolveProductVideoUrl } from "@/lib/product-video";
import { getInsertMassDisplayLabel } from "@/lib/synthetic-diamond-labels";

export const dynamic = "force-dynamic";

export default async function PreviewProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isAdvantShopConfigured()) notFound();

  const catalog = await fetchAdvantShopProducts({ includeOutOfStock: true });
  const summary = findProductBySlug(catalog, slug);
  if (!summary) notFound();
  const product = await loadAdvantShopProductDetails(summary);
  if (!product) notFound();

  const related = catalog.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const videoUrl = resolveProductVideoUrl([
    product.artNo, ...Object.values(product.sizeArtNos ?? {}), ...(product.offerArtNos ?? []),
  ]);

  return <main className="sn-container sn-pdp">
    <nav className="sn-breadcrumbs"><Link href="/redesign-preview">Главная</Link> / <Link href="/redesign-preview/catalog">Каталог</Link> / {product.name}</nav>
    <ProductSelectionProvider product={product}>
      <div className="sn-pdp-grid">
        <div className="sn-pdp-visual">
          <ProductGallery
            images={product.images} name={product.name} videoUrl={videoUrl} slug={product.slug}
            price={product.price} productImage={product.image} category={product.category}
            stoneWeight={product.stoneWeight} stoneLabel={getInsertMassDisplayLabel(product) ?? ""}
            inStock={product.inStock !== false}
          />
        </div>
        <div className="sn-pdp-buy">
          <p className="sn-overline">СИНОНИМ · УКРАШЕНИЕ ИЗ КАТАЛОГА</p>
          <h1>{product.name}</h1>
          <ProductConfigurator product={product}/>
          <div className="sn-pdp-assistance">
            <p>Цены, выбранные размеры и доступность поступают из AdvantShop.</p>
            <Link href="/shipping">Доставка и оплата ↗</Link>
            <Link href="/warranty">Гарантия ↗</Link>
          </div>
        </div>
      </div>
      <div className="sn-pdp-details">
        <ProductDescription product={product}/>
        <ProductCharacteristics product={product}/>
      </div>
    </ProductSelectionProvider>
    {related.length > 0 && <section className="sn-related">
      <div className="sn-heading"><h2>Вам также может понравиться</h2><Link href="/redesign-preview/catalog">Каталог ↗</Link></div>
      <div className="sn-product-grid">{related.map(p => <PreviewCard product={p} key={p.id}/>)}</div>
    </section>}
  </main>;
}
