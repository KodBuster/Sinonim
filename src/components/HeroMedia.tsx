"use client";

import Image from "next/image";
import {
  type TouchEvent,
  useEffect,
  useRef,
  useState,
} from "react";

const HERO_ALT = "Кольцо с ограненным синтетическим алмазом в серебре";

const HERO_VIDEOS = [
  "/images/video-hero_2.mp4",
  "/images/braslet_video_3.mp4",
  "/images/braslet_video_6.mp4",
  "/images/braslet_video_7.mp4",
] as const;

/** Fixed interval — video ended/timeupdate are unreliable on iOS Safari 16. */
const SLIDE_MS = 8_000;

function prepareVideo(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("muted", "");
}

async function playSafely(video: HTMLVideoElement) {
  prepareVideo(video);
  try {
    await video.play();
  } catch {
    // Autoplay can fail until user gesture.
  }
}

export function HeroMedia() {
  const [hydrated, setHydrated] = useState(false);
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Auto-advance on a timer — no dependency on video events.
  useEffect(() => {
    if (!hydrated) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % HERO_VIDEOS.length);
    }, SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [hydrated]);

  // Load + play current slide.
  useEffect(() => {
    if (!hydrated) return;
    const video = videoRef.current;
    if (!video) return;

    const src = HERO_VIDEOS[index];
    prepareVideo(video);

    if (video.getAttribute("src") !== src) {
      video.setAttribute("src", src);
      video.load();
    }

    void playSafely(video);
  }, [hydrated, index]);

  const goTo = (next: number) => {
    const length = HERO_VIDEOS.length;
    setIndex(((next % length) + length) % length);
  };

  const goNext = () => goTo(index + 1);
  const goPrev = () => goTo(index - 1);

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

  const controlClassName =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/50 [-webkit-tap-highlight-color:transparent] lg:flex";

  return (
    <div
      className="absolute inset-0 bg-black"
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
        className="object-cover object-center lg:object-cover lg:object-top"
      />

      {hydrated ? (
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute inset-0 z-[2] h-full w-full object-cover object-center bg-transparent lg:object-cover lg:object-top"
          aria-label={HERO_ALT}
        />
      ) : null}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-2 lg:bottom-4"
        role="tablist"
        aria-label="Видео в карусели"
      >
        {HERO_VIDEOS.map((src, i) => {
          const isActive = i === index;
          return (
            <a
              key={src}
              href={`#hero-slide-${i}`}
              role="tab"
              aria-selected={isActive}
              aria-label={`Видео ${i + 1}`}
              onClick={(event) => {
                event.preventDefault();
                goTo(i);
              }}
              className={`pointer-events-auto h-2.5 min-w-[10px] touch-manipulation rounded-full transition-all [-webkit-tap-highlight-color:transparent] ${
                isActive
                  ? "w-6 bg-white shadow-sm"
                  : "w-2.5 bg-white/55 hover:bg-white/80"
              }`}
            />
          );
        })}
      </div>

      <a
        href="#hero-prev"
        aria-label="Предыдущее видео"
        onClick={(event) => {
          event.preventDefault();
          goPrev();
        }}
        className={`${controlClassName} left-2`}
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
      </a>
      <a
        href="#hero-next"
        aria-label="Следующее видео"
        onClick={(event) => {
          event.preventDefault();
          goNext();
        }}
        className={`${controlClassName} right-2`}
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
      </a>
    </div>
  );
}
