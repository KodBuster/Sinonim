"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AutoplayVideo } from "./AutoplayVideo";

const HERO_ALT = "Кольцо с лабораторным бриллиантом в серебре";
const DESKTOP_MQ = "(min-width: 1024px)";

export function HeroMedia() {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const sync = () => setShowVideo(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <>
      <Image
        src="/images/hero-poster.webp"
        alt={HERO_ALT}
        fill
        priority
        fetchPriority="high"
        sizes="(max-width: 1023px) 100vw, 512px"
        className={`object-contain object-center lg:object-cover lg:object-top ${
          showVideo ? "hidden" : ""
        }`}
      />
      {showVideo ? (
        <AutoplayVideo
          src="/images/video-hero_2.mp4"
          className="absolute inset-0 h-full w-full object-contain object-center lg:object-cover lg:object-top"
          aria-label={HERO_ALT}
        />
      ) : null}
    </>
  );
}
