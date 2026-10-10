import Image from "next/image";
import Link from "next/link";
import { isAdvantShopConfigured } from "@/lib/advantshop/config";
import { fetchAdvantShopProducts } from "@/lib/advantshop/catalog";
import type { Product } from "@/lib/products";
import { HeroCarousel } from "@/components/redesign/HeroCarousel";
import { BestSellerCarousel } from "@/components/redesign/BestSellerCarousel";
import { InfluencerCarousel } from "@/components/redesign/InfluencerCarousel";

export const dynamic = "force-dynamic";

// The category section is deliberately unchanged from the previous preview.
const categories = [
  { label: "Кольца", href: "/redesign-preview/catalog?category=rings", image: "/images/categories/rings.jpg" },
  { label: "Серьги", href: "/redesign-preview/catalog?category=earrings", image: "/images/categories/earrings.jpg" },
  { label: "Колье", href: "/redesign-preview/catalog?category=pendants", image: "/images/categories/pendants.jpg" },
  { label: "Браслеты", href: "/redesign-preview/catalog?category=bracelets", image: "/images/categories/bracelets.jpg" },
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
      <Link href="/redesign-preview/catalog?price=under15000" className="sn-promo"><Image src="/images/categories/rings.jpg" alt="Кольца СИНОНИМ" fill sizes="(max-width: 760px) 100vw, 33vw" className="sn-cover"/><span>До 15 000 ₽ <small>Перейти к украшениям ↗</small></span></Link>
      <Link href="/collections/fw-2026" className="sn-promo"><Image src="/images/categories/pendants.jpg" alt="Колье и украшения коллекции" fill sizes="(max-width: 760px) 100vw, 33vw" className="sn-cover"/><span>Создайте свой комплект <small>Смотреть коллекцию ↗</small></span></Link>
      <Link href="/shop/gifts" className="sn-promo"><Image src="/images/categories/earrings.jpg" alt="Украшения для подарков" fill sizes="(max-width: 760px) 100vw, 33vw" className="sn-cover"/><span>Идеи для подарков <small>Выбрать подарок ↗</small></span></Link>
    </section>
    <div className="sn-trust"><p>◇ &nbsp; Серебро 925</p><p>✧ &nbsp; Современный дизайн</p><p>♡ &nbsp; Помощь с выбором</p></div>

    {/* 05 — reference 3: vertical-video carousel, awaiting real influencer material. */}
    <InfluencerCarousel />

    {/* 06 — blog/story section preserved from the previous preview. */}
    <section className="sn-container sn-journal">
      <div className="sn-heading"><h2>Вдохновение</h2><Link href="/blog">Перейти в журнал ↗</Link></div>
      <div className="sn-journal-grid">
        <Link href="/about"><div><Image src="/images/categories/earrings.jpg" alt="Серьги Синоним" fill sizes="25vw" className="sn-cover"/></div><span>История Синоним</span></Link>
        <Link href="/how-size-ring"><div><Image src="/images/categories/rings.jpg" alt="Кольца" fill sizes="25vw" className="sn-cover"/></div><span>Как определить размер кольца</span></Link>
        <Link href="/guide"><div><Image src="/images/categories/pendants.jpg" alt="Колье" fill sizes="25vw" className="sn-cover"/></div><span>Гид покупателя</span></Link>
        <Link href="/warranty"><div><Image src="/images/categories/bracelets.jpg" alt="Браслеты" fill sizes="25vw" className="sn-cover"/></div><span>Уход и гарантия</span></Link>
      </div>
    </section>
  </main>;
}
