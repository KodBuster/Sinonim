import Image from "next/image";
import Link from "next/link";
import { isAdvantShopConfigured } from "@/lib/advantshop/config";
import { fetchAdvantShopProducts } from "@/lib/advantshop/catalog";
import type { Product } from "@/lib/products";
import { HeroCarousel } from "@/components/redesign/HeroCarousel";
import { BestSellerCarousel } from "@/components/redesign/BestSellerCarousel";
import { InfluencerCarousel } from "@/components/redesign/InfluencerCarousel";
import mediaManifest from "@/config/synonym-media.json";

export const dynamic = "force-dynamic";

// The category section is deliberately unchanged from the previous preview.
const categories = [
  { label: "Кольца", href: "/redesign-preview/collections/rings", image: "/images/categories/rings.jpg" },
  { label: "Серьги", href: "/redesign-preview/collections/earrings", image: "/images/categories/earrings.jpg" },
  { label: "Колье", href: "/redesign-preview/collections/necklaces", image: "/images/categories/pendants.jpg" },
  { label: "Браслеты", href: "/redesign-preview/collections/bracelets", image: "/images/categories/bracelets.jpg" },
];

async function getLiveProducts(): Promise<{products: Product[], hasVerifiedHits: boolean}> {
  if (!isAdvantShopConfigured()) return {products: [], hasVerifiedHits: false};
  try {
    const catalog = await fetchAdvantShopProducts({});
    const eligible = catalog.filter(product => product.inStock !== false && product.price > 0);
    const hits = eligible.filter(product => product.badge === "Хит");
    const picked = (hits.length >= 5 ? hits : eligible).slice(0, 12);
    return {products: picked, hasVerifiedHits: hits.length >= 5};
  } catch (error) {
    console.error("SYNONYM redesign: live product catalog unavailable", error);
    return {products: [], hasVerifiedHits: false};
  }
}

export default async function RedesignPreviewHome() {
  const {products, hasVerifiedHits} = await getLiveProducts();
  return <main>
    {/* 01 — a single full-width hero, three banners. */}
    <HeroCarousel />

    {/* 02 — preserved category block: markup and all 4 items unchanged. */}
    <section className="sn-category-grid" aria-label="Категории">{categories.map(item => <Link href={item.href} key={item.label} className="sn-category">
      <Image src={item.image} fill sizes="(max-width: 760px) 50vw, 25vw" alt={item.label} className="sn-cover" /><span>{item.label} ↗</span>
    </Link>)}</section>

    {/* 03 — reference 1: horizontal product carousel. */}
    <BestSellerCarousel products={products} hasVerifiedHits={hasVerifiedHits} />

    {/* 04 — reference 2: three editorial promotions + trust strip. */}
    <section className="sn-promo-grid" aria-label="Подборки">
      {mediaManifest.promotions.map(promo => (
        <Link key={promo.id} href={promo.href} className="sn-promo">
          <picture className="sn-promo-media">
            {promo.mobileSrc && <source media="(max-width: 760px)" srcSet={promo.mobileSrc} />}
            <Image src={promo.src} alt={promo.alt} fill sizes="(max-width: 760px) 100vw, 33vw" className="sn-cover"/>
          </picture>
          <span>{promo.title} <small>{promo.cta}</small></span>
        </Link>
      ))}
    </section>
    <div className="sn-trust"><p>◇ &nbsp; Серебро 925</p><p>✧ &nbsp; Современный дизайн</p><p>♡ &nbsp; Помощь с выбором</p></div>

    {/* 05 — reference 3: vertical-video carousel, awaiting real influencer material. */}
    <InfluencerCarousel />

    {/* 06 — blog/story section preserved from the previous preview. */}
    <section className="sn-container sn-journal">
      <div className="sn-heading"><h2>Вдохновение</h2><Link href="/blog">Перейти в журнал ↗</Link></div>
      <div className="sn-journal-grid">
        {mediaManifest.blogCovers.map(story => (
          <Link key={story.id} href={story.href}>
            <div><Image src={story.src} alt={story.alt} fill sizes="25vw" className="sn-cover"/></div>
            <span>{story.title}</span>
          </Link>
        ))}
      </div>
    </section>
  </main>;
}
