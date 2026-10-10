"use client";

import Image from "next/image";
import Link from "next/link";
import mediaManifest from "@/config/synonym-media.json";
import { useCallback, useEffect, useState } from "react";

const slides = mediaManifest.heroSlides;

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
          key={slide.id}
          aria-hidden={index !== active}
          inert={index !== active}
        >
          <picture className="sn-hero-media">
            {slide.mobileSrc && <source media="(max-width: 760px)" srcSet={slide.mobileSrc} />}
            <Image
              src={slide.desktopSrc}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="sn-hero-slide-image"
              style={{ objectPosition: slide.objectPosition ?? "center center" }}
            />
          </picture>
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
