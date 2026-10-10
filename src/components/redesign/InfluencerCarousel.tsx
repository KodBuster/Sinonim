"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Clip = {
  id: string;
  video: string;
  poster: string;
  label: string;
};

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
  const [playing, setPlaying] = useState<string | null>(null);

  const scroll = (direction: -1 | 1) => {
    const el = viewport.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>(".sn-social-item");
    const distance = (item?.getBoundingClientRect().width ?? 230) + 12;
    el.scrollBy({left: distance * direction, behavior: "smooth"});
  };

  const toggle = async (id: string) => {
    const player = players.current[id];
    if (!player) return;
    if (playing === id) {
      player.pause();
      setPlaying(null);
      return;
    }
    Object.entries(players.current).forEach(([key, video]) => {
      if (key !== id) video?.pause();
    });
    try {
      player.muted = true;
      await player.play();
      setPlaying(id);
    } catch {
      setPlaying(null);
    }
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
          <article key={clip.id} className="sn-social-item">
            <div className="sn-social-media">
              <Image src={clip.poster} alt="" fill sizes="(max-width: 600px) 58vw, 220px" className="sn-cover sn-social-poster" />
              <video
                ref={element => { players.current[clip.id] = element; }}
                src={clip.video}
                playsInline
                muted
                loop
                preload="none"
                onEnded={() => setPlaying(current => current === clip.id ? null : current)}
                aria-label={clip.label}
              />
              <button type="button" className="sn-social-play" onClick={() => void toggle(clip.id)} aria-label={(playing === clip.id ? "Остановить" : "Воспроизвести") + ": " + clip.label}>
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
