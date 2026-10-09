import Image from "next/image";
import Link from "next/link";
import { isAdvantShopConfigured } from "@/lib/advantshop/config";
import { fetchAdvantShopProducts } from "@/lib/advantshop/catalog";
import type { Product } from "@/lib/products";
import { PreviewCard } from "@/components/redesign/PreviewCard";

export const dynamic = "force-dynamic";

const categories = [
  { label: "Кольца", href: "/redesign-preview/catalog?category=rings", image: "/images/categories/rings.jpg" },
  { label: "Серьги", href: "/redesign-preview/catalog?category=earrings", image: "/images/categories/earrings.jpg" },
  { label: "Колье", href: "/redesign-preview/catalog?category=pendants", image: "/images/categories/pendants.jpg" },
  { label: "Браслеты", href: "/redesign-preview/catalog?category=bracelets", image: "/images/categories/bracelets.jpg" },
];

async function getLiveProducts(): Promise<Product[]> {
  if (!isAdvantShopConfigured()) return [];
  try {
    const items = await fetchAdvantShopProducts({});
    return items.filter(item => item.inStock !== false).slice(0, 4);
  } catch (error) {
    console.error("SYNONYM redesign: live product catalog unavailable", error);
    return [];
  }
}

export default async function RedesignPreviewHome() {
  const products = await getLiveProducts();
  return <main>
    <section className="sn-hero" aria-label="Коллекции Синоним">
      <div className="sn-hero-pane">
        <video className="sn-hero-video" autoPlay muted loop playsInline preload="metadata" poster="/images/hero-fw2026-banner.jpg" aria-label="Видео коллекции Синоним">
          <source src="/images/video-hero_2.mp4" type="video/mp4" />
        </video>
        <div className="sn-hero-shade" />
        <div className="sn-hero-content"><small>НОВАЯ КОЛЛЕКЦИЯ</small><h1>Украшения, которые становятся частью истории</h1><Link href="/collections/fw-2026">Смотреть коллекцию ↗</Link></div>
      </div>
      <div className="sn-hero-pane">
        <Image src="/images/categories/bracelets.jpg" alt="Браслет из коллекции Синоним" fill priority sizes="(max-width: 760px) 100vw, 50vw" className="sn-cover" />
        <div className="sn-hero-shade" />
        <div className="sn-hero-content"><small>СИНОНИМ</small><h2>Каждая деталь имеет значение</h2><Link href="/redesign-preview/catalog">Открыть каталог ↗</Link></div>
      </div>
    </section>
    <div className="sn-statement">Простые ценности. Инновационные технологии. Высокое качество.</div>
    <section className="sn-category-grid" aria-label="Категории">{categories.map(item => <Link href={item.href} key={item.label} className="sn-category">
      <Image src={item.image} fill sizes="(max-width: 760px) 50vw, 25vw" alt={item.label} className="sn-cover" /><span>{item.label} ↗</span>
    </Link>)}</section>
    <section className="sn-promo-grid" aria-label="Подборки">
      <Link href="/collections/fw-2026" className="sn-promo"><Image src="/images/categories/rings.jpg" alt="Кольцо из коллекции Синоним" fill sizes="(max-width: 760px) 100vw, 33vw" className="sn-cover"/><span>Новая коллекция <small>Открыть ↗</small></span></Link>
      <Link href="/shop/gifts" className="sn-promo"><Image src="/images/categories/pendants.jpg" alt="Подвеска в качестве подарка" fill sizes="(max-width: 760px) 100vw, 33vw" className="sn-cover"/><span>Подарки <small>Смотреть ↗</small></span></Link>
      <Link href="/redesign-preview/catalog" className="sn-promo"><Image src="/images/categories/earrings.jpg" alt="Выбор украшений" fill sizes="(max-width: 760px) 100vw, 33vw" className="sn-cover"/><span>Найти своё украшение <small>Каталог ↗</small></span></Link>
    </section>
    <div className="sn-trust"><p>◇ &nbsp; Серебро 925</p><p>✧ &nbsp; Современный дизайн</p><p>♡ &nbsp; Помощь с выбором</p></div>
    <section className="sn-container sn-journal">
      <div className="sn-heading"><h2>Вдохновение</h2><Link href="/blog">Перейти в журнал ↗</Link></div>
      <div className="sn-journal-grid">
        <Link href="/about"><div><Image src="/images/categories/earrings.jpg" alt="Серьги Синоним" fill sizes="25vw" className="sn-cover"/></div><span>История Синоним</span></Link>
        <Link href="/how-size-ring"><div><Image src="/images/categories/rings.jpg" alt="Кольца" fill sizes="25vw" className="sn-cover"/></div><span>Как определить размер кольца</span></Link>
        <Link href="/guide"><div><Image src="/images/categories/pendants.jpg" alt="Колье" fill sizes="25vw" className="sn-cover"/></div><span>Гид покупателя</span></Link>
        <Link href="/warranty"><div><Image src="/images/categories/bracelets.jpg" alt="Браслеты" fill sizes="25vw" className="sn-cover"/></div><span>Уход и гарантия</span></Link>
      </div>
    </section>
    <section className="sn-container sn-featured">
      <div className="sn-heading"><h2>Из каталога</h2><Link href="/redesign-preview/catalog">Все украшения ↗</Link></div>
      {products.length ? <div className="sn-product-grid">{products.map(p => <PreviewCard key={p.id} product={p}/>)}</div> : <p className="sn-notice">Каталог будет показан при подключении безопасного тестового окружения к AdvantShop. Выдуманные товары и цены не подставляются.</p>}
    </section>
  </main>;
}
