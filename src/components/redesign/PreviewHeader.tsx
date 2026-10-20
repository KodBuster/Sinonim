"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CartLink } from "@/components/cart/CartLink";
import { FavoritesLink } from "@/components/favorites/FavoritesLink";

// Single source for desktop navigation and mobile drawer.
// Approved exact menu order: NEW COLLECTION, RINGS, EARRINGS, NECKLACES,
// BRACELETS, GIFTS, ABOUT, BLOG.
export const previewNavigation = [
  { label: "НОВАЯ КОЛЛЕКЦИЯ", href: "/collections/fw-2026" },
  { label: "КОЛЬЦА", href: "/redesign-preview/collections/rings" },
  { label: "СЕРЬГИ", href: "/redesign-preview/collections/earrings" },
  { label: "КОЛЬЕ", href: "/redesign-preview/collections/necklaces" },
  { label: "БРАСЛЕТЫ", href: "/redesign-preview/collections/bracelets" },
  { label: "ПОДАРКИ", href: "/redesign-preview/gifts" },
  { label: "О БРЕНДЕ", href: "/about" },
  { label: "БЛОГ", href: "/blog" },
] as const;

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
        <div className="sn-header-start">
          <button className="sn-menu-button" type="button" aria-label={open ? "Закрыть меню" : "Открыть меню"} aria-expanded={open} aria-controls="sn-mobile-menu" onClick={() => setOpen(v => !v)}>☰</button>
        </div>
        <Link href="/redesign-preview" className="sn-logo" aria-label="Синоним — главная">
          <Image src="/images/logo_20260527190756.png" width={1000} height={150} alt="Синоним" priority />
        </Link>
        <div className="sn-nav-icons">
          <Link href="/search" aria-label="Поиск">⌕</Link>
          <FavoritesLink />
          <CartLink />
        </div>
      </div>
      <nav className="sn-primary-nav" aria-label="Главное меню">
        {previewNavigation.map(item => <Link href={item.href} key={item.label}>{item.label}</Link>)}
      </nav>
    </header>
    {open && <div className="sn-drawer-shade" onClick={() => setOpen(false)}>
      <nav className="sn-drawer" id="sn-mobile-menu" aria-label="Мобильное меню" onClick={e => e.stopPropagation()}>
        <button type="button" className="sn-drawer-close" onClick={() => setOpen(false)} aria-label="Закрыть меню">×</button>
        <p>СИНОНИМ</p>
        {previewNavigation.map(item => <Link href={item.href} key={item.label} onClick={() => setOpen(false)}>{item.label}</Link>)}
        <hr />
        <Link href="/redesign-preview/catalog" onClick={() => setOpen(false)}>Все украшения</Link>
        <Link href="/shipping" onClick={() => setOpen(false)}>Доставка и оплата</Link>
      </nav>
    </div>}
  </>;
}
