import Image from "next/image";
import Link from "next/link";
import { MetrikaPhoneLink } from "@/components/analytics/MetrikaPhoneLink";
import {
  SHOWROOM,
  SITE_EMAIL,
  SITE_EMAIL_MAILTO,
  SITE_PHONE,
  SITE_PHONE_TEL,
} from "@/lib/contacts";

const FOOTER_LINKS = {
  catalog: [
    { label: "Кольца", href: "/shop/rings" },
    { label: "Серьги", href: "/shop/earrings" },
    { label: "Колье", href: "/shop/pendants" },
    { label: "Браслеты", href: "/shop/bracelets" },
    { label: "Подарки", href: "/shop/gifts" },
  ],
  info: [
    { label: "О бренде", href: "/about" },
    { label: "Сотрудничество", href: "/cooperation" },
    { label: "Блог", href: "/blog" },
    { label: "Гид покупателя", href: "/guide" },
    { label: "Шоурум", href: "/showroom" },
    { label: "Доставка и оплата", href: "/shipping" },
    { label: "Гарантия", href: "/warranty" },
  ],
};

const SOCIAL_LINKS = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/synonym_jewelry",
  },
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/synonym_jewelryy",
  },
  {
    id: "vk",
    label: "ВКонтакте",
    href: "https://vk.ru/synonym_jewelry",
  },
] as const;

function IconInstagram() {
  return (
    <svg className="size-7" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.65" cy="6.35" r="1.15" fill="currentColor" />
    </svg>
  );
}

function IconTelegram() {
  return (
    <svg className="size-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38Z" />
    </svg>
  );
}

function IconVk() {
  return (
    <svg className="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.586-1.496c.596-.189 1.363 1.26 2.173 1.819.613.422 1.078.329 1.078.329l2.163-.03s1.13-.07.594-.958c-.044-.072-.312-.658-1.609-1.86-1.356-1.257-1.174-1.054.458-3.23.995-1.326 1.393-2.136 1.269-2.482-.118-.33-.847-.243-.847-.243l-2.436.015s-.181-.025-.315.055c-.131.079-.216.263-.216.263s-.386 1.028-.9 1.902c-1.084 1.844-1.518 1.941-1.696 1.826-.414-.267-.31-1.076-.31-1.65 0-1.793.271-2.54-.528-2.733-.265-.064-.46-.107-1.138-.114-.87-.009-1.605.003-2.021.208-.277.137-.491.441-.361.459.161.022.525.098.718.382.249.366.24 1.188.24 1.188s.143 2.269-.333 2.549c-.327.192-.776-.2-1.74-1.99-.493-.914-.866-1.926-.866-1.926s-.072-.176-.2-.27c-.155-.114-.372-.15-.372-.15l-2.314.015s-.347.01-.475.161c-.114.134-.009.411-.009.411s1.816 4.248 3.87 6.391c1.883 1.967 4.023 1.837 4.023 1.837h.97z" />
    </svg>
  );
}

function SocialIcon({ id }: { id: (typeof SOCIAL_LINKS)[number]["id"] }) {
  if (id === "instagram") return <IconInstagram />;
  if (id === "telegram") return <IconTelegram />;
  return <IconVk />;
}

function SocialLinksBlock({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <h4 className="text-brand-terracotta text-xs tracking-[0.2em] uppercase mb-4">
        Мы в соцсетях
      </h4>
      <div className="flex items-center gap-1">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            className="inline-flex size-12 items-center justify-center text-brand-text hover:text-brand-terracotta transition-colors"
          >
            <SocialIcon id={link.id} />
          </a>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-brand-muted">
        Instagram принадлежит Meta Platforms Inc., деятельность которой в РФ
        признана экстремистской и запрещена
      </p>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-white text-brand-text border-t border-brand-terracotta mt-auto">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4 shrink-0">
              <Image
                src="/images/logo_20260527190756.png"
                alt="Синоним"
                width={1000}
                height={150}
                className="h-7 w-auto max-w-none object-contain brightness-0"
                style={{ width: "auto" }}
              />
            </Link>
            <p className="text-brand-muted text-sm leading-relaxed max-w-xs">
              ограненные синтетические алмазы в серебре — современный подход к украшениям
              без компромиссов в качестве.
            </p>

            <SocialLinksBlock className="mt-8 max-w-xs hidden lg:block" />
          </div>

          <div>
            <h4 className="text-brand-terracotta text-xs tracking-[0.2em] uppercase mb-4">
              Каталог
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.catalog.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-text hover:text-brand-terracotta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-brand-terracotta text-xs tracking-[0.2em] uppercase mb-4">
              Покупателям
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-text hover:text-brand-terracotta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-brand-terracotta text-xs tracking-[0.2em] uppercase mb-4">
              Контакты
            </h4>
            <p className="text-sm text-brand-text mb-2">Шоурум в Москве</p>
            <p className="text-sm text-brand-muted mb-3 leading-relaxed">
              {SHOWROOM.address}
            </p>
            <MetrikaPhoneLink
              href={SITE_PHONE_TEL}
              className="block text-sm text-brand-terracotta hover:text-brand-terracotta-logo transition-colors mb-2"
            >
              {SITE_PHONE}
            </MetrikaPhoneLink>
            <a
              href={SITE_EMAIL_MAILTO}
              className="block text-sm text-brand-terracotta hover:text-brand-terracotta-logo transition-colors mb-4"
            >
              {SITE_EMAIL}
            </a>
            <p className="text-sm text-brand-muted mb-3">
              {SHOWROOM.hours}
            </p>
            <p className="text-sm text-brand-muted leading-relaxed">
              ООО «СИНОНИМ»
              <br />
              ИНН 7735173098
              <br />
              ОГРН 1187746428484
            </p>

            <SocialLinksBlock className="mt-8 max-w-xs lg:hidden" />
          </div>
        </div>

        <div className="border-t border-brand-sand mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-xs text-brand-muted">
          <div className="flex flex-col gap-2 sm:gap-1">
            <p>© 2026 Синоним. Все права защищены.</p>
            <p>
              Разработка Digital Агентство{" "}
              <a
                href="https://kodbuster.ru/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-text hover:text-brand-terracotta transition-colors"
              >
                KodBuster
              </a>
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-brand-text transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="hover:text-brand-text transition-colors">
              Оферта
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
