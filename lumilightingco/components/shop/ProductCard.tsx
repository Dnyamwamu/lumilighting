"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, MessageSquare, ExternalLink, Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Product } from "@/lib/medusa"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  
  // Get pricing from variants
  const defaultVariant = product.variants?.[0]
  const [selectedVariantId, setSelectedVariantId] = React.useState(
    product.variants?.[0]?.id || ""
  )

  const selectedVariant = React.useMemo(() => {
    return product.variants?.find((v) => v.id === selectedVariantId) || defaultVariant
  }, [selectedVariantId, product.variants, defaultVariant])

  const isOutOfStock = React.useMemo(() => {
    return typeof selectedVariant?.inventory_quantity === "number" && selectedVariant.inventory_quantity <= 0
  }, [selectedVariant])

  const priceObject = selectedVariant?.prices?.[0]

  const originalPrice = priceObject ? priceObject.amount / 100 : 0
  // If there's metadata showing discount or comparative pricing
  const discountRate = product.metadata?.discount_rate as number | undefined
  const currentPrice = discountRate
    ? originalPrice * (1 - discountRate / 100)
    : originalPrice

  const formattedOriginalPrice = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: priceObject?.currency_code || "KES",
    minimumFractionDigits: 0,
  }).format(originalPrice)

  const formattedCurrentPrice = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: priceObject?.currency_code || "KES",
    minimumFractionDigits: 0,
  }).format(currentPrice)

  // WhatsApp checkout text generator
  const getWhatsAppLink = () => {
    const variantName = selectedVariant && selectedVariant.title !== "Default Variant" && selectedVariant.title !== "Default"
      ? ` (${selectedVariant.title})`
      : ""
    const text = `Hello LUMI Lighting,\n\nI am interested in:\nProduct: ${product.title}${variantName}\nPrice: ${formattedCurrentPrice}\n\nPlease assist me.`
    return `https://wa.me/254729686414?text=${encodeURIComponent(text)}`
  }

  const hasDiscount = !!discountRate
  const thumbnail =
    product.thumbnail ||
    product.images?.[0]?.url ||
    "/images/placeholder-light.jpg"

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:border-amber-500/50 hover:shadow-lg">
      {/* Discount Badge */}
      {hasDiscount && (
        <span className="absolute top-3 left-3 z-10 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
          {discountRate}% OFF
        </span>
      )}

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleWishlist({
            id: product.id,
            title: product.title,
            handle: product.handle,
            price: currentPrice,
            thumbnail: thumbnail,
          })
        }}
        className="absolute top-3 right-3 z-10 cursor-pointer rounded-full bg-background/80 p-2 shadow-xs backdrop-blur-xs transition-all duration-300 hover:bg-background hover:scale-110"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            isInWishlist(product.id)
              ? "fill-red-500 text-red-500"
              : "text-muted-foreground hover:text-red-500"
          }`}
        />
      </button>

      {/* Image container */}
      <Link
        href={`/product/${product.handle}`}
        className="relative block aspect-square shrink-0 overflow-hidden bg-muted/40"
      >
        <Image
          src={thumbnail}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Product info */}
      <div className="flex flex-grow flex-col p-4">
        <span className="mb-1 block text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
          {product.categories?.[0]?.name || "LUMI Lighting"}
        </span>

        <Link
          href={`/product/${product.handle}`}
          className="transition-colors group-hover:text-primary"
        >
          <h3 className="line-clamp-2 min-h-[40px] text-sm leading-tight font-semibold">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-1 mb-2 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
            />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">(5.0)</span>
        </div>

        {/* Variant Selector (only if multiple variants exist) */}
        {product.variants && product.variants.length > 1 && (
          <div className="mb-3">
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground focus:border-amber-500 focus:outline-none cursor-pointer hover:border-border/80 transition-colors"
            >
              {product.variants.map((v) => {
                const isVarOutOfStock = typeof v.inventory_quantity === "number" && v.inventory_quantity <= 0
                return (
                  <option key={v.id} value={v.id}>
                    {v.title} {isVarOutOfStock ? "(Out of Stock)" : ""}
                  </option>
                )
              })}
            </select>
          </div>
        )}

        {/* Pricing */}
        <div className="mt-auto flex items-baseline gap-2 border-t border-border/40 pt-2">
          <span className="text-base font-extrabold text-foreground">
            {formattedCurrentPrice}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formattedOriginalPrice}
            </span>
          )}
        </div>

        {/* Actions panel */}
        <div className="mt-4 grid grid-cols-2 gap-2 pt-2">
          {/* Add to Cart */}
          <Button
            onClick={() => selectedVariant && addToCart(selectedVariant.id, 1)}
            disabled={!selectedVariant || isOutOfStock}
            size="sm"
            className="w-full cursor-pointer gap-1 bg-slate-900 text-xs text-white hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {isOutOfStock ? "Out of Stock" : "Cart"}
          </Button>

          {/* Buy via WhatsApp */}
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              size="sm"
              variant="outline"
              className="w-full cursor-pointer gap-1 border-emerald-500 text-xs text-emerald-600 hover:bg-emerald-50"
            >
              <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
