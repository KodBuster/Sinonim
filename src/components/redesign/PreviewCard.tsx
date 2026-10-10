import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import { ProductImage } from "@/components/catalog/ProductImage";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";

export function PreviewCard({ product }: { product: Product }) {
  const href = "/redesign-preview/product/" + product.slug;
  return <article className="sn-product-card group">
    <div className="sn-product-photo">
      <Link href={href} aria-label={product.name}><ProductImage src={product.image} alt={product.name} fill sizes="(max-width: 700px) 50vw, 25vw" className="sn-cover" /></Link>
      {product.badge && <span className="sn-card-badge">{product.badge}</span>}
      <div className="sn-heart"><FavoriteButton slug={product.slug} className="!opacity-100" /></div>
    </div>
    <Link href={href} className="sn-product-name">{product.name}</Link>
    {product.metal && <span className="sn-product-metal">{product.metal}</span>}
    <p>{formatPrice(product.price)}</p>
    {product.inStock === false && <small>Нет в наличии</small>}
  </article>;
}
