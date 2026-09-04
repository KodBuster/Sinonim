import Link from "next/link";
import type { ReactNode } from "react";

type BlogArticleLayoutProps = {
  title: string;
  intro: string;
  children: ReactNode;
};

export function BlogArticleLayout({
  title,
  intro,
  children,
}: BlogArticleLayoutProps) {
  return (
    <>
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            <Link href="/blog" className="hover:text-brand-terracotta-logo transition-colors">
              Блог
            </Link>
          </p>
          <h1 className="font-heading text-3xl md:text-5xl text-brand-olive-dark mb-6 md:mb-8">
            {title}
          </h1>
          <p className="text-brand-olive-dark leading-relaxed text-base md:text-lg">
            {intro}
          </p>
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10 space-y-5 text-brand-text leading-relaxed text-sm md:text-base [&_h2]:font-heading [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-semibold [&_h2]:text-brand-olive-dark [&_h2]:pt-2 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-brand-olive-dark [&_strong]:font-semibold [&_strong]:text-brand-olive-dark [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_blockquote]:border-l-2 [&_blockquote]:border-brand-olive/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-brand-olive-dark">
          {children}
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10 flex flex-wrap gap-4 border-t border-brand-olive/15 pt-8">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
          >
            Смотреть каталог
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-brand-olive/30 text-brand-olive-dark hover:border-brand-olive text-sm tracking-widest uppercase transition-colors"
          >
            Все статьи
          </Link>
        </div>
      </section>
    </>
  );
}
