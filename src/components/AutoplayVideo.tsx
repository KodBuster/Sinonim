"use client";

import { useEffect, useRef } from "react";

type AutoplayVideoProps = {
  src: string;
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
};

export function AutoplayVideo({
  src,
  className,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: AutoplayVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const restoreScrollIfJumped = (x: number, y: number) => {
      // Mobile browsers sometimes scroll the video into view on play(),
      // which pushes the hero top above the viewport.
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
    };
  }, [src]);

  return (
    <video
      ref={ref}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      disablePictureInPicture
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
