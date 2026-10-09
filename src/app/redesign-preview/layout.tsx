import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PreviewHeader } from "@/components/redesign/PreviewHeader";
import "./preview.css";

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
          <div><b>Украшения</b><a href="/redesign-preview/catalog">Каталог</a><a href="/redesign-preview/catalog?category=rings">Кольца</a><a href="/redesign-preview/catalog?category=earrings">Серьги</a><a href="/redesign-preview/catalog?category=pendants">Колье</a><a href="/redesign-preview/catalog?category=bracelets">Браслеты</a></div>
          <div><b>Информация</b><a href="/shipping">Доставка и оплата</a><a href="/warranty">Гарантия</a><a href="/showroom">Шоурум</a><a href="/privacy">Конфиденциальность</a></div>
        </div>
        <div className="sn-container sn-footer-bottom">© СИНОНИМ · Только предпросмотр</div>
      </footer>
    </div>
  );
}
