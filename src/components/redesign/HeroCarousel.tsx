"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type HeroSlide = {
  eyebrow: string;
  heading: string;
  image: string;
  alt: string;
  href: string;
  cta: string;
  position?: string;
};

const slides: HeroSlide[] = [
  {
    eyebrow: "СИНОНИМ · УКРАШЕНИЯ",
    heading: "Украшения для настоящих моментов",
    image: "/images/categories/earrings.jpg",
    alt: "Серьги СИНОНИМ — кадр коллекции",
    href: "/redesign-preview/catalog?category=earrings",
    cta: "Смотреть серьги",
    position: "center center",
  },
  {
    eyebrow: "КОЛЬЦА",
    heading: "Маленькая деталь. Большое чувство.",
    image: "/images/categories/rings.jpg",
    alt: "Кольца СИНОНИМ — кадр коллекции",
    href: "/redesign-preview/catalog?category=rings",
    cta: "Выбрать кольцо",
    position: "center center",
  },
  {
    eyebrow: "КОЛЬЕ И ПОДВЕСКИ",
    heading: "Сияние, которое остаётся с вами",
    image: "/images/categories/pendants.jpg",
    alt: "Подвески СИНОНИМ — кадр коллекции",
    href: "/redesign-preview/catalog?category=pendants",
    cta: "Открыть коллекцию",
    position: "center center",
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(media.matches);
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setActive(index => (index + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion]);

  const changeSlide = useCallback((index: number) => {
    setActive((index + slides.length) % slides.length);
  }, []);

  return (
    <section
      className="sn-single-hero"
      aria-label="Рекламные баннеры СИНОНИМ"
      aria-roledescription="карусель"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <h1 className="sr-only">СИНОНИМ — ювелирные украшения из серебра</h1>
      {slides.map((slide, index) => (
        <div
          className={"sn-hero-slide " + (index === active ? "is-active" : "")}
          key={slide.href}
          aria-hidden={index !== active}
          inert={index !== active}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="sn-hero-slide-image"
            style={{ objectPosition: slide.position ?? "center center" }}
          />
          <div className="sn-hero-slide-shade" />
          <div className="sn-hero-slide-copy">
            <span className="sn-hero-kicker">{slide.eyebrow}</span>
            <h2>{slide.heading}</h2>
            <Link href={slide.href} className="sn-hero-shop">{slide.cta}<span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      ))}
      <button className="sn-hero-arrow sn-hero-prev" type="button" onClick={() => changeSlide(active - 1)} aria-label="Предыдущий баннер">‹</button>
      <button className="sn-hero-arrow sn-hero-next" type="button" onClick={() => changeSlide(active + 1)} aria-label="Следующий баннер">›</button>
      <div className="sn-hero-pagination" aria-label="Выберите баннер">
        {slides.map((slide, index) => (
          <button
            key={slide.href}
            type="button"
            aria-label={"Баннер " + (index + 1) + ": " + slide.eyebrow}
            aria-current={index === active ? "true" : undefined}
            className={"sn-hero-dot " + (index === active ? "is-active" : "")}
            onClick={() => changeSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
