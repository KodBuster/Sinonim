import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CatalogView } from "@/components/catalog/CatalogView";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/breadcrumb-schema";
import { FW2026_COLLECTION } from "@/lib/collections";
import { buildCatalogItemListJsonLd } from "@/lib/item-list-schema";
import { buildPageMetadata } from "@/lib/metadata";
import { getFw2026CollectionProducts } from "@/lib/products-service";
import { getSiteUrl } from "@/lib/site-url";
import type { Product } from "@/lib/products";

type PageProps = {
  searchParams: Promise<{
    sort?: string;
    price?: string | string[];
    size?: string | string[];
    complect?: string;
  }>;
};

export async function generateMetadata() {
  return buildPageMetadata({
    title: `${FW2026_COLLECTION.title} — Синоним`,
    description: FW2026_COLLECTION.description,
    path: FW2026_COLLECTION.href,
  });
}

function CatalogFallback() {
  return (
    <div className="py-20 text-center text-brand-muted">Загрузка коллекции…</div>
  );
}

export default async function Fw2026CollectionPage({ searchParams }: PageProps) {
  const { sort } = await searchParams;
  let initialProducts: Product[] = [];
  let initialError: string | undefined;

  try {
    initialProducts = await getFw2026CollectionProducts({
      sort: sort ?? "default",
    });
  } catch {
    initialError = "Не удалось загрузить коллекцию FW 2026";
  }

  const pageUrl = `${getSiteUrl()}${FW2026_COLLECTION.href}`;

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Каталог", path: "/shop" },
            { name: FW2026_COLLECTION.title, path: FW2026_COLLECTION.href },
          ]),
          ...(initialProducts.length > 0
            ? [
                buildCatalogItemListJsonLd({
                  name: FW2026_COLLECTION.title,
                  url: pageUrl,
                  products: initialProducts,
                }),
              ]
            : []),
        ]}
      />
      <Header />
      <main>
        <Suspense fallback={<CatalogFallback />}>
          <CatalogView
            initialProducts={initialProducts}
            initialError={initialError}
            localOnly
            basePath={FW2026_COLLECTION.href}
            heading={{
              eyebrow: FW2026_COLLECTION.eyebrow,
              title: FW2026_COLLECTION.title,
              description: FW2026_COLLECTION.description,
            }}
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
