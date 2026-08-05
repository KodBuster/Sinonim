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
            intro="Лабораторные бриллианты — натуральные камни без миллионов лет ожидания и вреда природе!"
          >
            <p>
              Лабораторно выращенные бриллианты обладают оптическими,
              физическими и химическими свойствами, идентичными природными
              бриллиантам: и те, и другие состоят из чистого углерода и имеют
              одинаково высокую твёрдость (10 баллов по шкале Мооса).
            </p>
            <p>
              Камни, выращенные в лаборатории, получают без вреда для людей и
              природы — это подтверждают современные технологии и международные
              стандарты производства.
            </p>
            <p>
              Выращенные бриллианты проходят сертификацию в ведущих
              геммологических лабораториях и институтах в России и за рубежом.
            </p>
            <p>
              Такие камни оцениваются аналогично природным бриллиантам по
              системе 4C: огранке, цвету, чистоте и каратности.
            </p>
          </BlogArticleLayout>
        </main>
        <Footer />
      </>
    );
  }

  notFound();
}
