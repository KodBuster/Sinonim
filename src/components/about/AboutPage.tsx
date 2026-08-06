import Image from "next/image";
import Link from "next/link";

const PILLARS = [
  {
    title: "Вау-цена",
    text: "Позвольте себе больше – собирайте свои стильные комплекты и сияйте каждый день!",
  },
  {
    title: "Гарантия качества",
    text: "Принимаем участие в добровольной аттестации качества ювелирных украшений и даем гарантию на изделия 2 года",
  },
];

export function AboutPage() {
  return (
    <>
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-2">
            Синоним
          </p>
          <h1 className="font-heading text-3xl md:text-5xl text-brand-olive-dark mb-8 md:mb-10">
            О бренде
          </h1>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="space-y-5 text-brand-text leading-relaxed">
              <p className="font-heading text-xl md:text-2xl text-brand-olive-dark">
                Не жди повода! Каждый день твой!
              </p>
              <p>
                СИНОНИМ — это российский ювелирный бренд, создающий украшения
                из серебра и лабораторно выращенных бриллиантов. Основанный на
                стыки инновационных технологий и экспертизы, бренд СИНОНИМ
                доказывает, что настоящие бриллианты созданы не для сейфа, а
                для того, чтобы сиять каждый день. Мы делаем премиальную
                красоту легкой, понятной и доступной, стирая границы между
                торжественным выходом и повседневным стилем. Серебряные
                украшения с выращенными бриллиантами — это идеальный и
                универсальный выбор. Блеск серебра и яркое сияние камней
                подходят под любой стиль одежды, от вечернего платья до
                повседневных джинсов с футболкой.
              </p>
              <p>
                СИНОНИМ создан для тех, кто не готов инвестировать в историю
                камня, добытого где-то глубоко в карьере, а готовы
                инвестировать в историю, которую создают сами. Наши покупатели
                определяют ценность будущего, а не следует правилам прошлого
              </p>
              <p>
                Забудьте о трендах — выбирайте то, что созвучно вам. СИНОНИМ —
                это украшения вне времени, транслирующие чистый вкус. Это не
                способ удивить толпу, это ваш личный диалог с собой.
              </p>
              <p className="font-heading text-xl md:text-2xl text-brand-olive-dark">
                Синоним-Синоним твоей индивидуальности.
              </p>
            </div>

            <div className="relative aspect-square max-w-md mx-auto lg:max-w-none lg:ml-auto w-full">
              <div className="absolute -inset-3 rounded-2xl bg-brand-surface blur-xl" />
              <Image
                src="/images/product-ring.webp"
                alt="Браслет Синоним с лабораторными бриллиантами"
                fill
                className="object-contain rounded-2xl shadow-lg bg-white p-4 md:p-6"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white text-brand-text border-y border-brand-sand py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-10">
          <p className="text-brand-terracotta text-sm tracking-[0.2em] uppercase mb-8 text-center">
            Уникальная концепция
          </p>

          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
            <p className="font-heading text-4xl md:text-5xl tracking-[0.15em] text-brand-olive-dark mb-4">
              СИНОНИМ
            </p>
            <p className="text-lg md:text-xl text-brand-text mb-3">
              Украшения из серебра с лабораторными бриллиантами
            </p>
            <p className="text-brand-muted leading-relaxed">
              Сочетаем ювелирные тренды и современные технологии, делая
              изысканные украшения ближе и доступнее
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto">
            {PILLARS.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-brand-sand bg-brand-surface p-6 md:p-8"
              >
                <h3 className="font-heading text-xl md:text-2xl text-brand-olive-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-brand-muted text-sm md:text-base leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6 lg:px-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-brand-terracotta hover:bg-brand-terracotta-logo text-white text-sm tracking-widest uppercase transition-colors"
          >
            Смотреть каталог
          </Link>
          <Link
            href="/showroom"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-brand-olive/30 text-brand-olive-dark hover:border-brand-olive text-sm tracking-widest uppercase transition-colors"
          >
            Примерить в шоуруме
          </Link>
        </div>
      </section>
    </>
  );
}
