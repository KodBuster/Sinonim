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
    title: "Ограненные синтетические алмазы в украшениях Синоним",
    description:
      "Как обозначаются вставки, в каких единицах указывается масса и что означает добровольная аттестация качества.",
    datePublished: "2026-08-05",
    dateModified: "2026-09-01",
  },
];

export function getBlogArticle(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}
