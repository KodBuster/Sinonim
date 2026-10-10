import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PreviewHeader } from "@/components/redesign/PreviewHeader";
import "./preview.css";
import "./subpages.css";
import "./collections/collections.css";
import "./blocks-v03.css";

export const metadata: Metadata = {
  title: "Предпросмотр нового Синонима",
  robots: { index: false, follow: false },
};

export default function RedesignPreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="sn-root">
      <div className="sn-draft-note">КОНЦЕПЦИЯ ДИЗАЙНА · НЕ ПУБЛИЧНАЯ ВЕРСИЯ</div>
      <PreviewHeader />
      {children}
      <footer className="sn-footer">
        <div className="sn-container sn-footer-cols">
          <div><h2>СИНОНИМ</h2><p>Простые ценности. Инновационные технологии. Высокое качество.</p></div>
          <div><b>Украшения</b><a href="/redesign-preview/catalog">Каталог</a><Link href="/redesign-preview/collections/rings">Кольца</Link><Link href="/redesign-preview/collections/earrings">Серьги</Link><Link href="/redesign-preview/collections/necklaces">Колье</Link><Link href="/redesign-preview/collections/bracelets">Браслеты</Link></div>
          <div><b>Информация</b><a href="/shipping">Доставка и оплата</a><a href="/warranty">Гарантия</a><a href="/showroom">Шоурум</a><a href="/privacy">Конфиденциальность</a></div>
        </div>
        <div className="sn-container sn-footer-bottom">© СИНОНИМ · Только предпросмотр</div>
      </footer>
    </div>
  );
}
