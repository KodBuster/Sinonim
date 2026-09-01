export type GuideArticle = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  datePublished: string;
  dateModified: string;
  about?: string;
  ogImage?: string;
};

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: "lab-grown-diamonds",
    title: "Ограненный синтетический алмаз: что важно знать",
    description:
      "Как обозначаются вставки, в каких единицах указывается масса и что означает добровольная аттестация качества.",
    eyebrow: "Гид покупателя",
    datePublished: "2025-06-01",
    dateModified: "2026-09-01",
    about: "Ограненные синтетические алмазы",
  },
  {
    slug: "silver-care",
    title: "Как ухаживать за серебром 925 с ограненным синтетическим алмазом",
    description:
      "Простые правила хранения, чистки и носки серебряных украшений с ограненными синтетическими алмазами.",
    eyebrow: "Гид покупателя",
    datePublished: "2025-06-15",
    dateModified: "2026-09-01",
    about: "Уход за серебряными украшениями",
  },
  {
    slug: "diamond-gift",
    title: "Как выбрать подарок с ограненным синтетическим алмазом",
    description:
      "На что смотреть при выборе кольца, серёг или колье в подарок до 30 000 ₽.",
    eyebrow: "Гид покупателя",
    datePublished: "2025-07-01",
    dateModified: "2026-09-01",
    about: "Подарки с ограненными синтетическими алмазами",
  },
];

export function getGuideArticle(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((article) => article.slug === slug);
}
