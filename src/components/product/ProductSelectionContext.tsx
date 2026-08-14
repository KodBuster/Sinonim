"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProductSizeLabel, getProductSizePrice, type ProductDetails } from "@/lib/products";

type ProductSelectionContextValue = {
  selectedSize: string | null;
  setSelectedSize: (size: string | null) => void;
  selectedSizeLabel: string | null;
  artNo?: string;
  price: number;
};

const ProductSelectionContext = createContext<ProductSelectionContextValue | null>(
  null
);

function resolveArtNo(
  product: ProductDetails,
  selectedSize: string | null
): string | undefined {
  if (selectedSize && product.sizeArtNos?.[selectedSize]) {
    return product.sizeArtNos[selectedSize];
  }
  return product.artNo;
}

export function ProductSelectionProvider({
  product,
  children,
}: {
  product: ProductDetails;
  children: ReactNode;
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizeOptions.length > 0
      ? (product.sizeOptions[3] ?? product.sizeOptions[0]).value
      : null
  );

  const value = useMemo(
    () => ({
      selectedSize,
      setSelectedSize,
      selectedSizeLabel: getProductSizeLabel(product, selectedSize) ?? null,
      artNo: resolveArtNo(product, selectedSize),
      price: getProductSizePrice(product, selectedSize),
    }),
    [product, selectedSize]
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
      "useProductSelection must be used within ProductSelectionProvider"
    );
  }
  return context;
}
