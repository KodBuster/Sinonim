export type BlogArticle = {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
};

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "osobennosti-brilliantov-novogo-pokoleniya",
    title: "Особенности бриллиантов нового поколения",
    description:
      "Лабораторные бриллианты — натуральные камни без миллионов лет ожидания и вреда природе. Свойства, сертификация и система 4C.",
    datePublished: "2026-08-05",
    dateModified: "2026-08-05",
  },
];

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}
