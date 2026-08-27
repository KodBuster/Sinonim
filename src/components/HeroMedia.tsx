"use client";

import Image from "next/image";
import {
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const HERO_ALT = "Кольцо с лабораторным бриллиантом в серебре";

const HERO_VIDEOS = [
  "/images/video-hero_2.mp4",
  "/images/braslet_video_3.mp4",
  "/images/braslet_video_6.mp4",
  "/images/braslet_video_7.mp4",
] as const;

function prepareVideo(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
}

export function HeroMedia() {
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const goTo = useCallback((next: number) => {
    const length = HERO_VIDEOS.length;
    setIndex((((next % length) + length) % length));
  }, []);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % HERO_VIDEOS.length);
  }, []);

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + HERO_VIDEOS.length) % HERO_VIDEOS.length);
  }, []);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ready) return;

    prepareVideo(video);

    const restoreScrollIfJumped = (x: number, y: number) => {
      requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - y) > 2 || Math.abs(window.scrollX - x) > 2) {
          window.scrollTo(x, y);
        }
      });
    };

    const tryPlay = () => {
      const x = window.scrollX;
      const y = window.scrollY;
      void video.play().then(
        () => restoreScrollIfJumped(x, y),
        () => restoreScrollIfJumped(x, y),
      );
    };

    video.load();
    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);

    const onVisible = () => {
      if (!document.hidden) tryPlay();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", onVisible);
      video.pause();
    };
  }, [index, ready]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX < 0) goNext();
    else goPrev();
  };

  const src = HERO_VIDEOS[index];

  return (
    <div
      className="absolute inset-0"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Image
        src="/images/hero-poster.webp"
        alt={HERO_ALT}
        fill
        priority
        fetchPriority="high"
        sizes="(max-width: 1023px) 100vw, 512px"
        className={`object-cover object-center lg:object-cover lg:object-top ${
          ready ? "hidden" : ""
        }`}
      />

      {ready ? (
        <video
          key={src}
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover object-center lg:object-cover lg:object-top"
          aria-label={HERO_ALT}
          onEnded={goNext}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-2 lg:bottom-4"
        role="tablist"
        aria-label="Видео в карусели"
      >
        {HERO_VIDEOS.map((_, i) => {
          const isActive = i === index;
          return (
            <button
              key={HERO_VIDEOS[i]}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Видео ${i + 1}`}
              onClick={() => goTo(i)}
              className={`pointer-events-auto h-2 touch-manipulation rounded-full transition-all [-webkit-tap-highlight-color:transparent] ${
                isActive
                  ? "w-6 bg-white shadow-sm"
                  : "w-2 bg-white/55 hover:bg-white/80"
              }`}
            />
          );
        })}
      </div>

      <button
        type="button"
        aria-label="Предыдущее видео"
        onClick={goPrev}
        className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40 lg:flex"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 18 9 12l6-6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Следующее видео"
        onClick={goNext}
        className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40 lg:flex"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="m9 18 6-6-6-6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
