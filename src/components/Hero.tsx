"use client";

import Image from "next/image";
import Link from "next/link";
import { trackHeroBannerClick } from "@/lib/analytics/metrika";

const BANNER_ALT =
  "Синоним — ограненные синтетические алмазы в серебре. Узнать о бренде.";

export function Hero() {
  return (
    <section className="relative border-b border-brand-sand bg-white">
      <h1 className="sr-only">
        Синоним — ограненные синтетические алмазы в серебре
      </h1>

      <Link
        href="/about"
        aria-label="Перейти на страницу О бренде"
        className="group relative block w-full cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent]"
        onClick={() => trackHeroBannerClick()}
      >
        {/* Mobile / tablet portrait */}
        <div className="relative aspect-[1080/1440] w-full overflow-hidden bg-brand-sand md:hidden">
          <Image
            src="/images/hero-about-banner-mobile.jpg"
            alt={BANNER_ALT}
            width={1080}
            height={1440}
            priority
            sizes="100vw"
            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-95 group-active:opacity-90"
          />
        </div>

        {/* Desktop / tablet landscape */}
        <div className="relative hidden aspect-[1584/672] w-full overflow-hidden bg-brand-sand md:block">
          <Image
            src="/images/hero-about-banner.jpg"
            alt={BANNER_ALT}
            width={1584}
            height={672}
            priority
            sizes="100vw"
            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-95 group-active:opacity-90"
          />
        </div>
      </Link>
    </section>
  );
}
