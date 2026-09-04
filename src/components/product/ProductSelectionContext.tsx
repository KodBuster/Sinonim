"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  getProductSizeLabel,
  getProductSizePrice,
  type ProductDetails,
} from "@/lib/products";
import {
  getProductCaratWeight,
  getProductCaratWeightLabel,
} from "@/lib/product-weight";

type ProductSelectionContextValue = {
  selectedSize: string | null;
  setSelectedSize: (size: string | null) => void;
  selectedSizeLabel: string | null;
  sizeHref: (size: string) => string;
  artNo?: string;
  price: number;
  diamondWeight: number;
  diamondWeightLabel: string;
};

const ProductSelectionContext = createContext<ProductSelectionContextValue | null>(
  null,
);

function resolveArtNo(
  product: ProductDetails,
  selectedSize: string | null,
): string | undefined {
  if (selectedSize && product.sizeArtNos?.[selectedSize]) {
    return product.sizeArtNos[selectedSize];
  }
  return product.artNo;
}

function pickDefaultSelectedSize(product: ProductDetails): string | null {
  if (!product.sizeOptions.length) return null;
  const inStock = product.sizeOptions.find((option) => {
    const amount = product.sizeStockAmounts?.[option.value];
    return amount === undefined || amount > 0;
  });
  return (inStock ?? product.sizeOptions[0]).value;
}

function isValidSize(product: ProductDetails, size: string | null): boolean {
  if (!size) return false;
  return product.sizeOptions.some((option) => option.value === size);
}

export function ProductSelectionProvider({
  product,
  children,
}: {
  product: ProductDetails;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sizeParam = searchParams.get("size");
  const defaultSize = pickDefaultSelectedSize(product);
  const selectedSize = isValidSize(product, sizeParam)
    ? sizeParam
    : defaultSize;

  const sizeHref = useCallback(
    (size: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("size", size);
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams],
  );

  // Kept for non-Link callers; selection itself is URL-driven (iOS-safe).
  const setSelectedSize = useCallback(
    (_size: string | null) => {
      // no-op: size chips navigate via Link href
    },
    [],
  );

  const value = useMemo(
    () => ({
      selectedSize,
      setSelectedSize,
      selectedSizeLabel: getProductSizeLabel(product, selectedSize) ?? null,
      sizeHref,
      artNo: resolveArtNo(product, selectedSize),
      price: getProductSizePrice(product, selectedSize),
      diamondWeight: getProductCaratWeight(product, selectedSize),
      diamondWeightLabel: getProductCaratWeightLabel(product, selectedSize),
    }),
    [product, selectedSize, setSelectedSize, sizeHref],
  );

  return (
    <ProductSelectionContext.Provider value={value}>
      {children}
    </ProductSelectionContext.Provider>
  );
}

export function useProductSelection() {
  const context = useContext(ProductSelectionContext);
  if (!context) {
    throw new Error(
      "useProductSelection must be used within ProductSelectionProvider",
    );
  }
  return context;
}
