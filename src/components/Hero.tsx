"use client";

import Image from "next/image";
import Link from "next/link";
import { trackHeroBannerClick } from "@/lib/analytics/metrika";

const BANNER_ALT =
  "Новая коллекция FW 2026 — Синоним. Узнать о бренде.";

export function Hero() {
  return (
    <section className="relative bg-white">
      <h1 className="sr-only">
        Синоним — ограненные синтетические алмазы в серебре
      </h1>

      {/* Mobile: full-bleed — new filename busts immutable /images cache */}
      <Link
        href="/collections/fw-2026"
        aria-label="Смотреть новую коллекцию FW 2026"
        className="group relative block w-full cursor-pointer touch-manipulation [-webkit-tap-highlight-color:transparent] md:hidden"
        onClick={() => trackHeroBannerClick()}
      >
        <div className="relative aspect-[1080/1440] w-full overflow-hidden bg-brand-sand">
          <Image
            src="/images/hero-fw2026-banner-mobile.jpg"
            alt={BANNER_ALT}
            width={1080}
            height={1440}
            priority
            sizes="100vw"
            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-95 group-active:opacity-90"
          />
        </div>
      </Link>

      {/* Desktop: 2400×1000 */}
      <div className="mx-auto hidden max-w-[1664px] px-4 md:block md:px-6 lg:px-10 md:py-6 lg:py-8">
        <Link
          href="/collections/fw-2026"
          aria-label="Смотреть новую коллекцию FW 2026"
          className="group relative block w-full cursor-pointer touch-manipulation overflow-hidden [-webkit-tap-highlight-color:transparent]"
          onClick={() => trackHeroBannerClick()}
        >
          <div className="relative aspect-[2400/1000] w-full overflow-hidden bg-brand-sand">
            <Image
              src="/images/hero-fw2026-banner.jpg"
              alt={BANNER_ALT}
              width={2400}
              height={1000}
              priority
              sizes="(min-width: 1664px) 1664px, 100vw"
              className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-95 group-active:opacity-90"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
