import Link from "next/link";

type ProductUnavailableProps = {
  productName?: string;
};

export function ProductUnavailable({ productName }: ProductUnavailableProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-4 md:px-6 lg:px-10 text-center">
        <p className="text-sm tracking-widest uppercase text-brand-muted mb-4">
          Скоро будет
        </p>
        <h1 className="font-heading text-3xl md:text-4xl text-brand-olive-dark mb-4">
          К сожалению, это изделие закончилось
        </h1>
        {productName ? (
          <p className="text-brand-olive-dark mb-3">{productName}</p>
        ) : null}
        <p className="text-brand-muted mb-10">
          Пожалуйста, подберите вместо него другое. У нас ещё много чего есть.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="inline-flex justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
          >
            В каталог
          </Link>
          <Link
            href="/"
            className="inline-flex justify-center px-8 py-3.5 border border-brand-olive/30 text-brand-olive-dark hover:border-brand-olive text-sm tracking-widest uppercase transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    </section>
  );
}
