import Link from "next/link";
import { MetrikaPhoneLink } from "@/components/analytics/MetrikaPhoneLink";
import {
  SITE_EMAIL,
  SITE_EMAIL_MAILTO,
  SITE_PHONE,
  SITE_PHONE_TEL,
} from "@/lib/contacts";

const NAV_ITEMS = [
  { label: "Кольца", href: "/shop/rings" },
  { label: "Серьги", href: "/shop/earrings" },
  { label: "Колье", href: "/shop/pendants" },
  { label: "Браслеты", href: "/shop/bracelets" },
  { label: "Подарки", href: "/shop/gifts" },
  { label: "О бренде", href: "/about" },
  { label: "Блог", href: "/blog" },
];

const EXTRA_LINKS = [
  { label: "Весь каталог", href: "/shop" },
  { label: "Сравнение", href: "/compare" },
  { label: "Избранное", href: "/favorites" },
  { label: "Корзина", href: "/cart" },
  { label: "Доставка и оплата", href: "/shipping" },
  { label: "Шоурум", href: "/showroom" },
  { label: "Сотрудничество", href: "/cooperation" },
];

export function MobileMenuPage() {
  return (
    <section className="py-6 md:py-10">
      <div className="mx-auto max-w-lg px-4 md:px-6">
        <h1 className="font-heading text-3xl text-brand-olive-dark mb-6">Меню</h1>

        <ul className="flex flex-col gap-1 mb-8">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-lg px-3 py-3.5 text-base tracking-wide text-brand-text hover:bg-brand-surface hover:text-brand-terracotta transition-colors touch-manipulation"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 border-t border-brand-sand pt-6 text-sm text-brand-muted">
          {EXTRA_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-brand-terracotta transition-colors touch-manipulation py-1"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={SITE_EMAIL_MAILTO}
            className="font-medium text-brand-olive-dark hover:text-brand-terracotta transition-colors break-all touch-manipulation py-1"
          >
            {SITE_EMAIL}
          </a>
          <MetrikaPhoneLink
            href={SITE_PHONE_TEL}
            className="font-medium text-brand-olive-dark hover:text-brand-terracotta transition-colors touch-manipulation py-1"
          >
            {SITE_PHONE}
          </MetrikaPhoneLink>
        </div>
      </div>
    </section>
  );
}
