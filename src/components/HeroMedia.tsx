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

type Slot = "a" | "b";

function prepareVideo(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
}

function sameSrc(video: HTMLVideoElement, src: string) {
  if (!video.currentSrc && !video.getAttribute("src")) return false;
  return (
    video.getAttribute("src") === src ||
    video.currentSrc.endsWith(src) ||
    video.currentSrc.includes(src)
  );
}

function waitForPlaybackReady(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 2 && video.videoWidth > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      if (video.readyState < 2 || video.videoWidth <= 0) return;
      settled = true;
      video.removeEventListener("loadeddata", done);
      video.removeEventListener("canplay", done);
      resolve();
    };
    video.addEventListener("loadeddata", done);
    video.addEventListener("canplay", done);
    // Safety: never block the carousel forever on a flaky network.
    window.setTimeout(() => {
      if (settled) return;
      settled = true;
      video.removeEventListener("loadeddata", done);
      video.removeEventListener("canplay", done);
      resolve();
    }, 8000);
  });
}

async function playSafely(video: HTMLVideoElement) {
  const x = window.scrollX;
  const y = window.scrollY;
  prepareVideo(video);
  try {
    await video.play();
  } catch {
    // Autoplay can fail until user gesture; keep last frame visible.
  }
  requestAnimationFrame(() => {
    if (Math.abs(window.scrollY - y) > 2 || Math.abs(window.scrollX - x) > 2) {
      window.scrollTo(x, y);
    }
  });
}

export function HeroMedia() {
  const [hydrated, setHydrated] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [activeSlot, setActiveSlot] = useState<Slot>("a");
  const [index, setIndex] = useState(0);

  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const indexRef = useRef(0);
  const activeSlotRef = useRef<Slot>("a");
  const switchingRef = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const getVideo = useCallback((slot: Slot) => {
    return slot === "a" ? videoARef.current : videoBRef.current;
  }, []);

  const loadSrc = useCallback(async (video: HTMLVideoElement, src: string) => {
    prepareVideo(video);
    video.preload = "auto";

    if (!sameSrc(video, src) || video.readyState < 2) {
      video.src = src;
      video.load();
      await waitForPlaybackReady(video);
    }

    try {
      video.pause();
      if (video.currentTime !== 0) video.currentTime = 0;
    } catch {
      // Ignore seek failures on some mobile browsers.
    }
  }, []);

  const preloadNext = useCallback(
    (afterIndex: number) => {
      const nextSrc = HERO_VIDEOS[(afterIndex + 1) % HERO_VIDEOS.length];
      const inactive: Slot = activeSlotRef.current === "a" ? "b" : "a";
      const video = getVideo(inactive);
      if (!video) return;
      void loadSrc(video, nextSrc);
    },
    [getVideo, loadSrc],
  );

  const switchToIndex = useCallback(
    async (nextIndex: number) => {
      if (switchingRef.current) return;

      const length = HERO_VIDEOS.length;
      const normalized = ((nextIndex % length) + length) % length;
      if (normalized === indexRef.current) return;

      const active = activeSlotRef.current;
      const inactive: Slot = active === "a" ? "b" : "a";
      const nextSrc = HERO_VIDEOS[normalized];
      const inactiveVideo = getVideo(inactive);
      const activeVideo = getVideo(active);
      if (!inactiveVideo || !activeVideo) return;

      switchingRef.current = true;

      try {
        await loadSrc(inactiveVideo, nextSrc);
        await playSafely(inactiveVideo);

        // Reveal only after the next clip has a frame and is playing.
        activeSlotRef.current = inactive;
        indexRef.current = normalized;
        setActiveSlot(inactive);
        setIndex(normalized);

        activeVideo.pause();
        preloadNext(normalized);
      } finally {
        switchingRef.current = false;
      }
    },
    [getVideo, loadSrc, preloadNext],
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;

    const boot = async () => {
      const first = getVideo("a");
      if (!first) return;

      await loadSrc(first, HERO_VIDEOS[0]);
      if (cancelled) return;
      await playSafely(first);
      if (cancelled) return;
      setHasFrame(true);
      preloadNext(0);
    };

    void boot();

    const onVisible = () => {
      if (document.hidden) return;
      const current = getVideo(activeSlotRef.current);
      if (current) void playSafely(current);
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [getVideo, hydrated, loadSrc, preloadNext]);

  const goTo = useCallback(
    (next: number) => {
      void switchToIndex(next);
    },
    [switchToIndex],
  );

  const goNext = useCallback(() => {
    void switchToIndex(indexRef.current + 1);
  }, [switchToIndex]);

  const goPrev = useCallback(() => {
    void switchToIndex(indexRef.current - 1);
  }, [switchToIndex]);

  const handleEnded = useCallback(() => {
    void switchToIndex(indexRef.current + 1);
  }, [switchToIndex]);

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

  const videoClassName =
    "absolute inset-0 h-full w-full object-cover object-center lg:object-cover lg:object-top";

  return (
    <div
      className="absolute inset-0 bg-[#f5f2ec]"
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
        className={`object-cover object-center lg:object-cover lg:object-top transition-opacity duration-200 ${
          hasFrame ? "opacity-0" : "opacity-100"
        }`}
      />

      {hydrated ? (
        <>
          <video
            ref={videoARef}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className={`${videoClassName} transition-opacity duration-200 ${
              activeSlot === "a" ? "opacity-100 z-[1]" : "opacity-0 z-0"
            }`}
            aria-label={activeSlot === "a" ? HERO_ALT : undefined}
            aria-hidden={activeSlot !== "a"}
            onEnded={activeSlot === "a" ? handleEnded : undefined}
          />
          <video
            ref={videoBRef}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className={`${videoClassName} transition-opacity duration-200 ${
              activeSlot === "b" ? "opacity-100 z-[1]" : "opacity-0 z-0"
            }`}
            aria-label={activeSlot === "b" ? HERO_ALT : undefined}
            aria-hidden={activeSlot !== "b"}
            onEnded={activeSlot === "b" ? handleEnded : undefined}
          />
        </>
      ) : null}

      <div
        className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-2 lg:bottom-4"
        role="tablist"
        aria-label="Видео в карусели"
      >
        {HERO_VIDEOS.map((src, i) => {
          const isActive = i === index;
          return (
            <button
              key={src}
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
