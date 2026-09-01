import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SearchView } from "@/components/search/SearchView";
import { buildPageMetadata } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site-url";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const hasQuery = query.length > 0;
  const baseMetadata = buildPageMetadata({
    title: hasQuery ? `Поиск: ${query} — Синоним` : "Поиск — Синоним",
    description:
      "Поиск украшений из серебра 925 с ограненными синтетическими алмазами в каталоге Синоним.",
    path: "/search",
    noIndex: hasQuery,
    robotsFollow: hasQuery,
  });

  if (!hasQuery) {
    return baseMetadata;
  }

  return {
    ...baseMetadata,
    alternates: {
      canonical: `${getSiteUrl()}/search`,
    },
  };
}

function SearchFallback() {
  return (
    <div className="py-20 text-center text-brand-muted">Загрузка…</div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<SearchFallback />}>
          <SearchView />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
