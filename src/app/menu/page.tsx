import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileMenuPage } from "@/components/MobileMenuPage";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata({
  title: "Меню — Синоним",
  description: "Навигация по сайту ювелирного магазина Синоним",
  path: "/menu",
  noIndex: true,
});

export default function MenuRoute() {
  return (
    <>
      <Header />
      <main>
        <MobileMenuPage />
      </main>
      <Footer />
    </>
  );
}
