"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProductSizeLabel, getProductSizePrice, type ProductDetails } from "@/lib/products";
import { getProductCaratWeight, getProductCaratWeightLabel } from "@/lib/product-weight";

type ProductSelectionContextValue = {
  selectedSize: string | null;
  setSelectedSize: (size: string | null) => void;
  selectedSizeLabel: string | null;
  artNo?: string;
  price: number;
  diamondWeight: number;
  diamondWeightLabel: string;
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

function pickDefaultSelectedSize(product: ProductDetails): string | null {
  if (!product.sizeOptions.length) return null;
  const inStock = product.sizeOptions.find((option) => {
    const amount = product.sizeStockAmounts?.[option.value];
    return amount === undefined || amount > 0;
  });
  return (inStock ?? product.sizeOptions[0]).value;
}

export function ProductSelectionProvider({
  product,
  children,
}: {
  product: ProductDetails;
  children: ReactNode;
}) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    pickDefaultSelectedSize(product),
  );

  const value = useMemo(
    () => ({
      selectedSize,
      setSelectedSize,
      selectedSizeLabel: getProductSizeLabel(product, selectedSize) ?? null,
      artNo: resolveArtNo(product, selectedSize),
      price: getProductSizePrice(product, selectedSize),
      diamondWeight: getProductCaratWeight(product, selectedSize),
      diamondWeightLabel: getProductCaratWeightLabel(product, selectedSize),
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
