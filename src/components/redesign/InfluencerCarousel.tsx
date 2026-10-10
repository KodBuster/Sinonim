"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Clip = {
  id: string;
  video: string;
  poster: string;
  label: string;
};

// Temporary brand assets. Replace with verified influencer videos when available.
const demoClips: Clip[] = [
  { id: "demo-1", video: "/images/braslet_video_3.mp4", poster: "/images/categories/bracelets.jpg", label: "Браслеты в движении" },
  { id: "demo-2", video: "/images/video-hero_1.mp4", poster: "/images/categories/earrings.jpg", label: "Детали коллекции" },
  { id: "demo-3", video: "/images/braslet_video_6.mp4", poster: "/images/categories/bracelets.jpg", label: "Украшение крупным планом" },
  { id: "demo-4", video: "/images/double_video.mp4", poster: "/images/categories/rings.jpg", label: "Ювелирные сочетания" },
  { id: "demo-5", video: "/images/braslet_video_7.mp4", poster: "/images/categories/bracelets.jpg", label: "Внимание к деталям" },
];

export function InfluencerCarousel() {
  const viewport = useRef<HTMLDivElement>(null);
  const players = useRef<Record<string, HTMLVideoElement | null>>({});
  const inView = useRef(false);
  const central = useRef<string | null>(null);
  const manuallyPaused = useRef<string | null>(null);
  const [centralId, setCentralId] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const pauseAll = useCallback(() => {
    for (const video of Object.values(players.current)) video?.pause();
    setPlaying(null);
  }, []);

  const playCentral = useCallback(async (id: string) => {
    const player = players.current[id];
    if (!player || !player.paused) return;
    player.muted = true; // Browser-safe autoplay: no sound.
    try {
      await player.play();
      // Scrolling or page visibility may have changed while play() was pending.
      if (central.current !== id || !inView.current || document.hidden) player.pause();
    } catch {
      // Autoplay can be denied (for example by mobile power-saving settings).
      // Leave the still poster and manual play control available.
      setPlaying(value => value === id ? null : value);
    }
  }, []);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    const evaluate = () => {
      raf = 0;
      if (!inView.current || document.hidden || motion.matches) {
        pauseAll();
        return;
      }

      const frame = el.getBoundingClientRect();
      const viewportCenter = frame.left + frame.width / 2;
      let selected: string | null = null;
      let closestDistance = Infinity;

      for (const element of el.querySelectorAll<HTMLElement>(".sn-social-item")) {
        const bounds = element.getBoundingClientRect();
        if (bounds.right <= frame.left || bounds.left >= frame.right) continue;
        const distance = Math.abs(bounds.left + bounds.width / 2 - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          selected = element.dataset.clipId ?? null;
        }
      }

      if (!selected) {
        pauseAll();
        return;
      }

      if (central.current !== selected) {
        central.current = selected;
        manuallyPaused.current = null;
        setCentralId(selected);
      }

      for (const [id, player] of Object.entries(players.current)) {
        if (id !== selected) player?.pause();
      }

      if (manuallyPaused.current !== selected) void playCentral(selected);
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(evaluate);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        schedule();
      },
      { threshold: [0, 0.2, 0.45] },
    );
    observer.observe(el);
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    motion.addEventListener("change", schedule);
    schedule();

    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      motion.removeEventListener("change", schedule);
      if (raf) window.cancelAnimationFrame(raf);
      for (const video of Object.values(players.current)) video?.pause();
    };
  }, [pauseAll, playCentral]);

  const scroll = (direction: -1 | 1) => {
    const el = viewport.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(".sn-social-item");
    const distance = (item?.getBoundingClientRect().width ?? 230) + 12;
    el.scrollBy({ left: distance * direction, behavior: "smooth" });
  };

  const toggle = (id: string) => {
    const player = players.current[id];
    if (!player) return;
    if (!player.paused) {
      manuallyPaused.current = id;
      player.pause();
      return;
    }

    manuallyPaused.current = null;
    if (id !== central.current) {
      const card = viewport.current?.querySelector<HTMLElement>('[data-clip-id="' + id + '"]');
      card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      return; // The scroll listener starts the new central video.
    }
    void playCentral(id);
  };

  return (
    <section className="sn-social" aria-labelledby="sn-social-title">
      <div className="sn-full-heading sn-social-header">
        <div>
          <p className="sn-social-eyebrow">ВИДЕО И ОБРАЗЫ</p>
          <h2 id="sn-social-title">СИНОНИМ в кадре</h2>
        </div>
        <div className="sn-scroll-controls">
          <button onClick={() => scroll(-1)} type="button" aria-label="Предыдущие видео">‹</button>
          <button onClick={() => scroll(1)} type="button" aria-label="Следующие видео">›</button>
        </div>
      </div>
      <p className="sn-social-disclaimer">Демонстрация формата блока на видеоматериалах бренда. Подтверждённые видео инфлюенсеров и привязанные к ним товары добавим после согласования; сейчас отзывы не имитируются.</p>
      <div className="sn-social-viewport" ref={viewport} role="region" aria-label="Горизонтальная видеогалерея" tabIndex={0}>
        {demoClips.map(clip => (
          <article
            key={clip.id}
            data-clip-id={clip.id}
            className={"sn-social-item" + (centralId === clip.id ? " is-central" : "")}
          >
            <div className="sn-social-media">
              <Image src={clip.poster} alt="" fill sizes="(max-width: 600px) 58vw, 220px" className="sn-cover sn-social-poster" />
              <video
                ref={element => { players.current[clip.id] = element; }}
                src={clip.video}
                playsInline
                muted
                loop
                preload="none"
                className={playing === clip.id ? "is-playing" : ""}
                onPlaying={() => setPlaying(clip.id)}
                onPause={() => setPlaying(value => value === clip.id ? null : value)}
                onError={() => setPlaying(value => value === clip.id ? null : value)}
                aria-label={clip.label}
              />
              <button
                type="button"
                className={"sn-social-play" + (playing === clip.id ? " is-playing" : "")}
                onClick={() => toggle(clip.id)}
                aria-label={(playing === clip.id ? "Остановить" : "Воспроизвести") + ": " + clip.label}
              >
                {playing === clip.id ? "Ⅱ" : "▶"}
              </button>
              <span className="sn-social-demo">ВИДЕО БРЕНДА</span>
            </div>
            <div className="sn-social-caption">
              <span>{clip.label}</span>
              <small>Демо · без отзыва инфлюенсера</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
