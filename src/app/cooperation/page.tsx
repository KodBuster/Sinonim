import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PartnershipPage } from "@/components/partnership/PartnershipPage";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Сотрудничество — Синоним",
  description:
    "Сотрудничество с брендом Синоним: конкурентные цены, гарантия качества, обновляемый ассортимент и маркетинговая поддержка продаж.",
  path: "/cooperation",
});

export default function CooperationRoute() {
  return (
    <>
      <Header />
      <main>
        <PartnershipPage />
      </main>
      <Footer />
    </>
  );
}
