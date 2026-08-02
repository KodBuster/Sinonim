"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { resolveProductImageUrl } from "@/lib/advantshop/images";

const FALLBACK_IMAGE = "/images/product-ring.webp";

type ProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
};

export function ProductImage({
  src,
  alt,
  fallbackSrc = FALLBACK_IMAGE,
  ...props
}: ProductImageProps) {
  const resolvedSrc = resolveProductImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);
  const isProxied = currentSrc.startsWith("/api/advantshop-image");

  useEffect(() => {
    setCurrentSrc(resolveProductImageUrl(src));
  }, [src]);

  return (
    <Image
      {...props}
      key={currentSrc}
      src={currentSrc}
      alt={alt}
      unoptimized={isProxied}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
