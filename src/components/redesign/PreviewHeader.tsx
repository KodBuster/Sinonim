"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CartLink } from "@/components/cart/CartLink";
import { FavoritesLink } from "@/components/favorites/FavoritesLink";

const links = [
  { label: "Все украшения", href: "/redesign-preview/catalog" },
  { label: "Кольца", href: "/redesign-preview/catalog?category=rings" },
  { label: "Серьги", href: "/redesign-preview/catalog?category=earrings" },
  { label: "Колье", href: "/redesign-preview/catalog?category=pendants" },
  { label: "Браслеты", href: "/redesign-preview/catalog?category=bracelets" },
];

export function PreviewHeader() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return <>
    <div className="sn-announcement">СИНОНИМ · Украшения из серебра 925</div>
    <header className="sn-header">
      <div className="sn-container sn-navigation">
        <button className="sn-menu-button" type="button" aria-label={open ? "Закрыть меню" : "Открыть меню"} aria-expanded={open} onClick={() => setOpen(v => !v)}>☰</button>
        <nav className="sn-nav-left" aria-label="Главное меню">
          <Link href="/redesign-preview/catalog">Украшения</Link>
          <Link href="/collections/fw-2026">Новая коллекция</Link>
          <Link href="/shop/gifts">Подарки</Link>
          <Link href="/blog">Журнал</Link>
          <Link href="/about">О бренде</Link>
        </nav>
        <Link href="/redesign-preview" className="sn-logo" aria-label="Синоним — главная">
          <Image src="/images/logo_20260527190756.png" width={1000} height={150} alt="Синоним" priority />
        </Link>
        <div className="sn-nav-icons">
          <Link href="/search" aria-label="Поиск">⌕</Link>
          <FavoritesLink />
          <CartLink />
        </div>
      </div>
    </header>
    {open && <div className="sn-drawer-shade" onClick={() => setOpen(false)}>
      <nav className="sn-drawer" aria-label="Мобильное меню" onClick={e => e.stopPropagation()}>
        <button type="button" className="sn-drawer-close" onClick={() => setOpen(false)} aria-label="Закрыть меню">×</button>
        <p>СИНОНИМ</p>
        {links.map(link => <Link href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <hr />
        <Link href="/about" onClick={() => setOpen(false)}>О бренде</Link>
        <Link href="/blog" onClick={() => setOpen(false)}>Журнал</Link>
        <Link href="/shipping" onClick={() => setOpen(false)}>Доставка и оплата</Link>
      </nav>
    </div>}
  </>;
}
