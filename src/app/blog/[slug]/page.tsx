import { notFound } from "next/navigation";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getBlogArticle } from "@/lib/blog";
import { buildPageMetadata } from "@/lib/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) return {};

  return buildPageMetadata({
    title: `${article.title} — Блог Синоним`,
    description: article.description,
    path: `/blog/${slug}`,
    ogType: "article",
  });
}

export default async function BlogArticleRoute({ params }: PageProps) {
  const { slug } = await params;
  const article = getBlogArticle(slug);
  if (!article) notFound();

  if (slug === "osobennosti-brilliantov-novogo-pokoleniya") {
    return (
      <>
        <Header />
        <main>
          <BlogArticleLayout
            title={article.title}
            intro="В украшениях Синоним вставки обозначаются как «ограненный синтетический алмаз». Масса указывается в граммах."
          >
            <p>
              Ограненный синтетический алмаз — это алмаз, полученный в
              контролируемых условиях и прошедший огранку. В названиях и
              описаниях изделий всегда указывается, что вставка синтетическая.
            </p>
            <p>
              Масса вставки указывается в граммах. Это относится к карточке
              товара, SEO-описанию и сопроводительным документам.
            </p>
            <p>
              Для изделий с вставками от 0,1 г Синоним участвует в добровольной
              аттестации качества — дополнительной проверке изделия независимой
              организацией.
            </p>
            <p>
              В описаниях мы указываем тип вставки, массу в граммах и огранку.
              Качественно-цветовые характеристики для синтетических вставок не
              используются.
            </p>
          </BlogArticleLayout>
        </main>
        <Footer />
      </>
    );
  }

  notFound();
}
