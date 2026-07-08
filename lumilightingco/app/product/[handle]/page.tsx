"use client"

import React, { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Product, Review, ProductCollection, medusa } from "@/lib/medusa"
import ProductCard from "@/components/shop/ProductCard"
import {
  ShoppingCart,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  FileText,
  CheckCircle,
  Star,
  X,
  Maximize2,
  ChevronLeft,
  Heart,
} from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"

const PRODUCT_METADATA_LOOKUP: Record<
  string,
  { brand: string; discount_rate?: number; specs?: Record<string, string> }
> = {
  "vintage-edison-bulb-4w": {
    brand: "Philips",
    discount_rate: 10,
    specs: {
      Wattage: "4 Watts (Equivalent to 40W Incandescent)",
      "Luminous Flux": "400 Lumens",
      "Color Temperature": "2200K (Warm Amber)",
      "Input Voltage": "220-240V AC",
      Lifespan: "15,000 Hours",
      CRI: "> 80",
      Warranty: "1 Year Showroom Warranty",
    },
  },
  "lumi-led-panel-18w": {
    brand: "LUMI",
    specs: {
      Wattage: "18 Watts (Equivalent to 150W Halogen)",
      "Luminous Flux": "1,620 Lumens",
      "Color Temperature": "6500K (Cool Day Light)",
      "IP Rating": "IP44 (Damp Location Rated)",
      Lifespan: "30,000 Hours",
      CRI: "> 82",
      Warranty: "2 Year Showroom Warranty",
    },
  },
  "modern-crystal-chandelier-6-light": {
    brand: "LUMI",
    discount_rate: 15,
    specs: {
      "Socket Type": "E14 (LED Compatible)",
      Material: "K9 Crystal, Iron Frame",
      Dimensions: "60cm Diameter x 50cm Height",
      "Chain Length": "100cm (Adjustable)",
      Weight: "8.2 Kg",
      Warranty: "2 Year Showroom Warranty",
    },
  },
  "outdoor-led-floodlight-100w": {
    brand: "Philips",
    specs: {
      Wattage: "100 Watts",
      "Luminous Flux": "10,000 Lumens",
      "IP Rating": "IP66 Weatherproof",
      Material: "Die-cast Aluminum",
      "Impact Rating": "IK08 Vandal Resistant",
      Warranty: "2 Year Showroom Warranty",
    },
  },
  "lumi-smart-switch-2-gang": {
    brand: "LUMI",
    discount_rate: 5,
    specs: {
      "Switch Type": "Smart Wi-Fi Touch",
      Gangs: "2-Gang",
      Voltage: "110-240V AC",
      "Max Load": "600W/Gang",
      "App Support": "Smart Life / Tuya",
      "Voice Assistant": "Alexa, Google Assistant",
      Warranty: "1 Year Warranty",
    },
  },
  "warm-white-led-strip-5m": {
    brand: "LUMI",
    specs: {
      Length: "5 Meters",
      Color: "Warm White (3000K)",
      "LED Type": "SMD 5050",
      "IP Rating": "IP65 Waterproof",
      Adapter: "12V DC included",
      Adhesive: "3M Backing Tape",
      Warranty: "1 Year Warranty",
    },
  },
}

export default function ProductDetailPage() {
  const params = useParams()
  const handle = params.handle as string
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()

  const [product, setProduct] = useState<Product | null>(null)
  const [collections, setCollections] = useState<ProductCollection[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [prevHandle, setPrevHandle] = useState(handle)

  // Zoom Full Page States
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [zoomIndex, setZoomIndex] = useState(0)
  const [zoomScale, setZoomScale] = useState(1)

  // Related Products State
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  // Reviews States
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState<number>(0)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const [reviewForm, setReviewForm] = useState({
    title: "",
    content: "",
    rating: 5,
    first_name: "",
    last_name: "",
  })
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [reviewError, setReviewError] = useState("")
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)

  if (handle !== prevHandle) {
    setPrevHandle(handle)
    setProduct(null)
    setCollections([])
    setIsLoading(true)
    setSelectedVariantIndex(0)
    setActiveImage(null)
    setReviews([])
    setAverageRating(0)
    setReviewSuccess(false)
    setShowReviewForm(false)
    setIsAddingToCart(false)
    setCartError(null)
    setIsZoomOpen(false)
    setZoomIndex(0)
    setZoomScale(1)
    setRelatedProducts([])
  }

  React.useEffect(() => {
    async function fetchLiveProduct() {
      try {
        const [{ product: liveProduct }, { collections: liveCollections }] = await Promise.all([
          medusa.getProductByHandle(handle),
          medusa.getCollections(),
        ])
        setCollections(liveCollections)
        const mockMeta = PRODUCT_METADATA_LOOKUP[handle]
        const mergedProduct = {
          ...liveProduct,
          metadata: {
            ...mockMeta,
            ...liveProduct.metadata,
          },
        }
        setProduct(mergedProduct)
        setActiveImage(
          mergedProduct.thumbnail ||
            mergedProduct.images?.[0]?.url ||
            "/images/placeholder-light.jpg"
        )

        // Fetch product reviews
        try {
          const { reviews: fetchedReviews, average_rating: fetchedAvgRating } =
            await medusa.getReviews(liveProduct.id)
          setReviews(fetchedReviews || [])
          setAverageRating(fetchedAvgRating || 0)
        } catch (revErr) {
          console.error("Failed to fetch reviews for product:", revErr)
        }

        // Fetch related products
        try {
          if (mergedProduct.categories && mergedProduct.categories.length > 0) {
            const catId = mergedProduct.categories[0].id
            const { products: fetchedProducts } = await medusa.getProducts({
              category_id: catId,
              limit: 5,
            })
            setRelatedProducts(
              fetchedProducts.filter((p) => p.id !== mergedProduct.id).slice(0, 4)
            )
          } else {
            const { products: fetchedProducts } = await medusa.getProducts({
              limit: 5,
            })
            setRelatedProducts(
              fetchedProducts.filter((p) => p.id !== mergedProduct.id).slice(0, 4)
            )
          }
        } catch (relErr) {
          console.error("Failed to fetch related products:", relErr)
        }
      } catch (err) {
        console.error("Failed to fetch live product from Medusa backend:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (handle) {
      fetchLiveProduct()
    }
  }, [handle])

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    setReviewLoading(true)
    setReviewError("")
    try {
      await medusa.createReview({
        ...reviewForm,
        product_id: product.id,
      })

      setReviewSuccess(true)
      setReviewForm({
        title: "",
        content: "",
        rating: 5,
        first_name: "",
        last_name: "",
      })
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit review."
      setReviewError(msg)
    } finally {
      setReviewLoading(false)
    }
  }

  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteSuccess, setQuoteSuccess] = useState(false)
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    phone: "",
    qty: "50",
    message: "",
  })
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState("")

  const activeVariant = product
    ? (product.variants?.[selectedVariantIndex] || product.variants?.[0])
    : null

  const isOutOfStock = useMemo(() => {
    if (activeVariant && typeof activeVariant.inventory_quantity === "number" && activeVariant.inventory_quantity <= 0) {
      return true
    }
    if (
      cartError === "Sorry, this variant does not have enough stock available." ||
      cartError === "Sorry, this product is out of stock."
    ) {
      return true
    }
    return false
  }, [activeVariant, cartError])

  const parsedSpecs = useMemo(() => {
    if (!product?.metadata?.specs) return null
    if (typeof product.metadata.specs === "object") {
      return product.metadata.specs as Record<string, string>
    }
    if (typeof product.metadata.specs === "string") {
      try {
        return JSON.parse(product.metadata.specs) as Record<string, string>
      } catch (e) {
        console.error("Failed to parse product specs JSON:", e)
      }
    }
    return null
  }, [product])


  // Keyboard listeners for image zoom
  React.useEffect(() => {
    if (!isZoomOpen) return
    const handleZoomKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsZoomOpen(false)
      } else if (e.key === "ArrowLeft" && product?.images && product.images.length > 1) {
        setZoomIndex((prev) => (prev === 0 ? product.images!.length - 1 : prev - 1))
        setZoomScale(1)
      } else if (e.key === "ArrowRight" && product?.images && product.images.length > 1) {
        setZoomIndex((prev) => (prev === product.images!.length - 1 ? 0 : prev + 1))
        setZoomScale(1)
      }
    }
    window.addEventListener("keydown", handleZoomKeyDown)
    return () => window.removeEventListener("keydown", handleZoomKeyDown)
  }, [isZoomOpen, product])

  // Dynamic breadcrumb items
  const breadcrumbItems = useMemo(() => {
    if (!product) return []
    
    const items = [
      { name: "Home", href: "/" },
      { name: "Shop", href: "/shop" },
    ]

    // Find collection
    const collectionObj = collections.find(c => c.id === product.collection_id) || (product as Product & { collection?: ProductCollection }).collection
    if (collectionObj) {
      items.push({
        name: collectionObj.title,
        href: `/shop?collection=${collectionObj.handle}`,
      })
    }

    // Find category
    if (product.categories && product.categories.length > 0) {
      const categoryObj = product.categories[0]
      const categoryHref = collectionObj
        ? `/shop?collection=${collectionObj.handle}&category=${categoryObj.handle}`
        : `/shop?category=${categoryObj.handle}`
      items.push({
        name: categoryObj.name,
        href: categoryHref,
      })
    }

    // Product Title
    items.push({
      name: product.title,
      href: `/product/${product.handle}`,
    })

    // Selected Variant
    if (activeVariant && activeVariant.title && activeVariant.title !== "Default Variant" && activeVariant.title !== "Default") {
      items.push({
        name: activeVariant.title,
        href: "",
      })
    }

    return items
  }, [product, collections, activeVariant])

  if (isLoading || !product) {
    return (
      <div className="relative flex min-h-screen flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex flex-grow items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500"></div>
        </main>
        <Footer />
      </div>
    )
  }

  const priceObject = activeVariant?.prices?.[0]
  const originalPrice = priceObject ? priceObject.amount / 100 : 0
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

  // WhatsApp chat links
  const getWhatsAppLink = () => {
    const text = `Hello LUMI Lighting,\n\nI am interested in:\nProduct: ${product.title} (${activeVariant?.title || "Default"})\nPrice: ${formattedCurrentPrice}\n\nPlease assist me.`
    return `https://wa.me/254729686414?text=${encodeURIComponent(text)}`
  }


  const handleAddToCart = async () => {
    if (!activeVariant || isAddingToCart || isOutOfStock) return
    setIsAddingToCart(true)
    setCartError(null)
    try {
      await addToCart(activeVariant.id, 1)
    } catch (err) {
      console.error("Failed to add to cart:", err)
      const rawMsg = err instanceof Error ? err.message : String(err)
      
      let userMsg = "Failed to add product to cart. Please try again."
      if (rawMsg.includes("insufficient_inventory")) {
        userMsg =
          product.variants && product.variants.length > 1
            ? "Sorry, this variant does not have enough stock available."
            : "Sorry, this product is out of stock."
      } else if (rawMsg.includes("inventory")) {
        userMsg = "This item has insufficient showroom inventory."
      } else {
        userMsg = rawMsg.replace(/^Error:\s*/i, "")
      }
      setCartError(userMsg)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setQuoteLoading(true)
    setQuoteError("")
    try {
      const description = `Product: ${product.title} (Variant: ${activeVariant?.title || "Default"})\nQuantity Requested: ${quoteForm.qty}\nMessage: ${quoteForm.message}`
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: quoteForm.name,
          email: quoteForm.email,
          phone: quoteForm.phone,
          projectDescription: description,
          products: [
            {
              id: product.id,
              title: product.title,
              sku: activeVariant?.sku || undefined,
            },
          ],
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit quotation request.")
      }

      setQuoteSuccess(true)
      setQuoteForm({
        name: "",
        email: "",
        phone: "",
        qty: "50",
        message: "",
      })
      setTimeout(() => {
        setQuoteSuccess(false)
        setShowQuoteModal(false)
      }, 3000)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      setQuoteError(msg)
    } finally {
      setQuoteLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {breadcrumbItems.map((item, idx) => {
            const isLast = idx === breadcrumbItems.length - 1
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                {isLast || !item.href ? (
                  <span className="truncate text-foreground font-semibold max-w-[200px]" title={item.name}>
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-amber-500 hover:underline transition-colors shrink-0">
                    {item.name}
                  </Link>
                )}
              </React.Fragment>
            )
          })}
        </div>

        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2">
          {/* Images Gallery */}
          <div className="space-y-4">
            <div 
              onClick={() => {
                const idx = product.images?.findIndex(img => img.url === activeImage) ?? 0
                setZoomIndex(idx >= 0 ? idx : 0)
                setZoomScale(1)
                setIsZoomOpen(true)
              }}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-border/80 bg-muted/20 cursor-zoom-in"
            >
              <Image
                src={activeImage || "/images/placeholder-light.jpg"}
                alt={product.title}
                fill
                className="animate-in object-cover duration-300 fade-in transition-transform duration-500 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <div className="rounded-full bg-black/50 p-3 text-white opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 backdrop-blur-xs flex items-center justify-center gap-1.5 shadow-lg">
                  <Maximize2 className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Zoom Image</span>
                </div>
              </div>
            </div>
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <div
                    key={img.url || idx}
                    onClick={() => setActiveImage(img.url)}
                    className={`relative aspect-square cursor-pointer overflow-hidden rounded-xl border transition-all ${
                      activeImage === img.url
                        ? "border-amber-500 ring-2 ring-amber-500/20"
                        : "border-border hover:border-amber-500/50"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Content */}
          <div className="space-y-6">
            <div>
              <span className="mb-1 block text-xs font-bold tracking-wider text-amber-500 uppercase">
                {product.categories?.[0]?.name || "LUMI Lighting"}
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {product.title}
              </h1>
              {/* Product Rating Summary under Title */}
              <div className="mt-2 flex animate-in items-center gap-2 duration-300 fade-in">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const isFilled = i < Math.round(averageRating)
                    return (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          isFilled
                            ? "fill-amber-500 text-amber-500"
                            : "fill-none text-muted-foreground/30"
                        }`}
                      />
                    )
                  })}
                </div>
                {reviews.length > 0 ? (
                  <span className="text-xs font-medium text-muted-foreground">
                    <span className="font-bold text-foreground">
                      {averageRating.toFixed(1)}
                    </span>{" "}
                    / 5.0 ({reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No reviews yet
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Brand:{" "}
                <span className="font-semibold">
                  {String(product.metadata?.brand || "LUMI")}
                </span>{" "}
                | SKU: <span className="font-mono">LUMI-{product.id}</span>
              </p>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3.5 rounded-xl border border-border/50 bg-muted/20 p-4">
              <span className="text-3xl font-extrabold text-foreground">
                {formattedCurrentPrice}
              </span>
              {discountRate && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {formattedOriginalPrice}
                  </span>
                  <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-500">
                    {discountRate}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock status indicator */}
            <div className="flex items-center gap-2 text-xs">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 font-bold text-red-500 bg-red-500/10 px-2.5 py-1.5 rounded-xl border border-red-500/20">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  {cartError === "Sorry, this variant does not have enough stock available." &&
                  product.variants &&
                  product.variants.length > 1
                    ? "Choose a different variant"
                    : "Out of Stock"}
                </span>
              ) : activeVariant && typeof activeVariant.inventory_quantity === "number" ? (
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20 animate-in fade-in duration-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  In Stock ({activeVariant.inventory_quantity} units available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  In Stock
                </span>
              )}
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 1 && (
              <div className="space-y-3">
                <label className="block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Select Option
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v, i) => {
                    const outOfStock = typeof v.inventory_quantity === "number" && v.inventory_quantity <= 0
                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariantIndex(i)
                          setCartError(null)
                        }}
                        className={`cursor-pointer rounded-xl border px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                          selectedVariantIndex === i
                            ? "border-amber-500 bg-amber-500/10 text-amber-600"
                            : outOfStock
                            ? "border-border bg-muted/20 text-muted-foreground/40 line-through opacity-60"
                            : "border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        {v.title}
                        {outOfStock && <span className="text-[10px] text-red-500/80 font-normal ml-0.5">(Out of stock)</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold">Product Description</h3>
              {product.description ? (
                /<[a-z][\s\S]*>/i.test(product.description) ? (
                  <div
                    className="text-sm leading-relaxed text-muted-foreground space-y-4"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                    {product.description}
                  </p>
                )
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  No description available.
                </p>
              )}
            </div>

            {/* Cart action error display */}
            {cartError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-bold text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                {cartError}
              </div>
            )}

            {/* Actions Panel */}
            <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row">
              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                disabled={!activeVariant || isOutOfStock || isAddingToCart}
                size="lg"
                className="h-12 flex-1 cursor-pointer gap-2 rounded-xl bg-slate-900 font-bold text-white hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center"
              >
                {isAddingToCart ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
                {isOutOfStock ? "Out of Stock" : isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
              </Button>

              {/* Chat on WhatsApp */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full cursor-pointer gap-2 rounded-xl border-emerald-500 font-bold text-emerald-600 hover:bg-emerald-50"
                >
                  <MessageSquare className="h-5 w-5" /> Chat on WhatsApp
                </Button>
              </a>

              {/* Quote Trigger */}
              <Button
                onClick={() => setShowQuoteModal(true)}
                variant="outline"
                size="lg"
                className="h-12 cursor-pointer gap-2 rounded-xl border-border font-bold hover:bg-muted/30"
              >
                <FileText className="h-5 w-5" /> Quote
              </Button>

              {/* Wishlist Toggle */}
              <Button
                onClick={() =>
                  toggleWishlist({
                    id: product.id,
                    title: product.title,
                    handle: product.handle,
                    price: currentPrice,
                    thumbnail: activeImage || product.thumbnail || "",
                  })
                }
                variant="outline"
                size="lg"
                className={`h-12 w-12 cursor-pointer p-0 rounded-xl border-border hover:bg-muted/30 transition-all ${
                  isInWishlist(product.id)
                    ? "text-red-500 hover:text-red-600 border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                    : "text-muted-foreground hover:text-red-500"
                }`}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isInWishlist(product.id) ? "fill-current" : ""
                  }`}
                />
              </Button>
            </div>

            {/* Warranty Badge */}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-amber-500" />
              <span>
                Full CE approval and{" "}
                {String(
                  parsedSpecs?.["Warranty"] || "2 Year Warranty"
                )}
                .
              </span>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        {parsedSpecs && (
          <section className="mt-16 border-t border-border pt-12">
            <h2 className="mb-6 text-xl font-bold">Technical Specifications</h2>
            <div className="max-w-2xl overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
              <table className="w-full border-collapse text-left text-sm">
                <tbody>
                  {Object.entries(parsedSpecs).map(
                    ([key, val], i) => (
                      <tr
                        key={key}
                        className={
                          i % 2 === 0 ? "bg-muted/20" : "bg-background"
                        }
                      >
                        <td className="w-1/3 border-b border-border/40 p-4 font-semibold text-muted-foreground">
                          {key}
                        </td>
                        <td className="w-2/3 border-b border-border/40 p-4 font-medium text-foreground">
                          {String(val)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Related Products</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Discover other popular lighting fixtures and accessories in this category.
                </p>
              </div>
              <Link
                href="/shop"
                className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors uppercase tracking-wider"
              >
                View Shop
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

        {/* Customer Reviews Section */}
        <section className="mt-16 animate-in space-y-8 border-t border-border pt-12 duration-500 fade-in">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Customer Reviews
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Read what others say or share your own thoughts on this product.
              </p>
            </div>
            <Button
              onClick={() => setShowReviewForm((prev) => !prev)}
              variant="outline"
              className="cursor-pointer self-start rounded-xl border-amber-500 px-5 py-2 font-bold text-amber-500 transition-all hover:bg-amber-500/10 sm:self-auto"
            >
              {showReviewForm ? "Cancel Review" : "Write a Review"}
            </Button>
          </div>

          {/* Write a Review Form (Expandable) */}
          {showReviewForm && (
            <div className="max-w-xl animate-in rounded-2xl border border-border bg-card p-6 text-card-foreground duration-300 slide-in-from-top-4">
              {reviewSuccess ? (
                <div className="space-y-3 py-6 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
                  <h3 className="text-lg font-bold">Review Submitted!</h3>
                  <p className="text-sm text-muted-foreground">
                    Thank you! Your review has been submitted and is currently
                    awaiting moderation by our administrators.
                  </p>
                  <Button
                    onClick={() => {
                      setReviewSuccess(false)
                      setShowReviewForm(false)
                    }}
                    className="rounded-xl bg-amber-500 font-bold text-white hover:bg-amber-600"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <h3 className="border-b border-border pb-2 text-lg font-bold">
                    Write a Review
                  </h3>

                  {/* Star Rating Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-muted-foreground">
                      Overall Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starValue = i + 1
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() =>
                              setReviewForm((prev) => ({
                                ...prev,
                                rating: starValue,
                              }))
                            }
                            className="cursor-pointer p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-7 w-7 ${
                                starValue <= reviewForm.rating
                                  ? "fill-amber-500 text-amber-500"
                                  : "fill-none text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Name Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="first_name"
                        className="text-xs font-bold text-muted-foreground"
                      >
                        First Name
                      </label>
                      <input
                        id="first_name"
                        type="text"
                        required
                        value={reviewForm.first_name}
                        onChange={(e) =>
                          setReviewForm((prev) => ({
                            ...prev,
                            first_name: e.target.value,
                          }))
                        }
                        placeholder="John"
                        className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="last_name"
                        className="text-xs font-bold text-muted-foreground"
                      >
                        Last Name
                      </label>
                      <input
                        id="last_name"
                        type="text"
                        required
                        value={reviewForm.last_name}
                        onChange={(e) =>
                          setReviewForm((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
                        }
                        placeholder="Doe"
                        className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Title Input */}
                  <div className="space-y-1">
                    <label
                      htmlFor="review_title"
                      className="text-xs font-bold text-muted-foreground"
                    >
                      Review Title (Optional)
                    </label>
                    <input
                      id="review_title"
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="e.g. Excellent quality, highly recommend!"
                      className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
                    />
                  </div>

                  {/* Content Input */}
                  <div className="space-y-1">
                    <label
                      htmlFor="review_content"
                      className="text-xs font-bold text-muted-foreground"
                    >
                      Review Description
                    </label>
                    <textarea
                      id="review_content"
                      required
                      rows={4}
                      value={reviewForm.content}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="What did you like or dislike? How is the product quality?"
                      className="w-full rounded-xl border border-border bg-background p-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 focus:outline-none"
                    />
                  </div>

                  {reviewError && (
                    <p className="text-xs font-semibold text-red-500">
                      {reviewError}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={reviewLoading}
                    className="h-12 w-full cursor-pointer rounded-xl bg-amber-500 font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                  >
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Reviews List & Summary Grid */}
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
            {/* Reviews Summary Stats */}
            <div className="space-y-4 rounded-2xl border border-border/50 bg-muted/20 p-6 md:col-span-4">
              <h3 className="text-base font-bold">Rating Summary</h3>
              <div className="flex items-center gap-3">
                <span className="text-5xl font-black">
                  {averageRating.toFixed(1)}
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const isFilled = i < Math.round(averageRating)
                      return (
                        <Star
                          key={i}
                          className={`h-4.5 w-4.5 ${
                            isFilled
                              ? "fill-amber-500 text-amber-500"
                              : "fill-none text-muted-foreground/30"
                          }`}
                        />
                      )
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on {reviews.length} approved{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>

              {/* Star breakdown progress bars */}
              <div className="space-y-2 border-t border-border/40 pt-2">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const ratingVal = 5 - idx
                  const countForRating = reviews.filter(
                    (r) => Math.round(r.rating) === ratingVal
                  ).length
                  const percent =
                    reviews.length > 0
                      ? (countForRating / reviews.length) * 100
                      : 0
                  return (
                    <div
                      key={ratingVal}
                      className="flex items-center gap-3 text-xs"
                    >
                      <span className="w-3 text-right font-medium">
                        {ratingVal}
                      </span>
                      <Star className="h-3 w-3 shrink-0 fill-amber-500 text-amber-500" />
                      <div className="h-2 flex-grow overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-semibold text-muted-foreground">
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* List of Reviews */}
            <div className="space-y-6 md:col-span-8">
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => {
                    const date = rev.created_at
                      ? new Date(rev.created_at).toLocaleDateString("en-KE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : ""
                    return (
                      <div
                        key={rev.id}
                        className="space-y-3 rounded-2xl border border-border/60 bg-card p-6 text-card-foreground shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => {
                                const isFilled = i < Math.round(rev.rating)
                                return (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                      isFilled
                                        ? "fill-amber-500 text-amber-500"
                                        : "fill-none text-muted-foreground/30"
                                    }`}
                                  />
                                )
                              })}
                            </div>
                            {rev.title && (
                              <h4 className="text-sm font-extrabold text-foreground">
                                {rev.title}
                              </h4>
                            )}
                          </div>
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {date}
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
                          {rev.content}
                        </p>

                        <div className="flex items-center gap-2 border-t border-border/30 pt-2 text-[11px] text-muted-foreground">
                          <span className="font-bold text-foreground">
                            {rev.first_name} {rev.last_name}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 font-semibold text-amber-600">
                            <CheckCircle className="inline h-3 w-3 fill-amber-500/10 text-amber-500" />{" "}
                            Verified Purchase
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border border-dashed border-border bg-muted/5 py-12 text-center">
                  <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <h3 className="text-sm font-bold">No reviews yet</h3>
                  <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                    Be the first to share your thoughts on this product! Submit
                    a review above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Request Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowQuoteModal(false)}
          />
          <div className="relative z-10 w-full max-w-md animate-in rounded-2xl border border-border bg-background p-6 text-foreground duration-200 zoom-in-95">
            <button
              onClick={() => setShowQuoteModal(false)}
              className="absolute top-4 right-4 cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted"
            >
              <XIcon className="h-5 w-5" />
            </button>

            {quoteSuccess ? (
              <div className="space-y-3 py-6 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="text-lg font-bold">Quotation Form Submitted</h3>
                <p className="text-xs text-muted-foreground">
                  Our showroom specialists will email your custom pricing.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">Request Project Pricing</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Submit details to request discounts on large volumes.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="modal-name"
                    className="text-xs font-bold text-muted-foreground"
                  >
                    Name
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    required
                    value={quoteForm.name}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g. John Doe"
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="modal-phone"
                    className="text-xs font-bold text-muted-foreground"
                  >
                    Phone Number
                  </label>
                  <input
                    id="modal-phone"
                    type="tel"
                    required
                    value={quoteForm.phone}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="e.g. 0712345678"
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="modal-email"
                    className="text-xs font-bold text-muted-foreground"
                  >
                    Email
                  </label>
                  <input
                    id="modal-email"
                    type="email"
                    required
                    value={quoteForm.email}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="e.g. builder@example.com"
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="modal-qty"
                    className="text-xs font-bold text-muted-foreground"
                  >
                    Quantity Needed
                  </label>
                  <input
                    id="modal-qty"
                    type="number"
                    value={quoteForm.qty}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({ ...prev, qty: e.target.value }))
                    }
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="modal-message"
                    className="text-xs font-bold text-muted-foreground"
                  >
                    Message / Specs
                  </label>
                  <textarea
                    id="modal-message"
                    rows={3}
                    value={quoteForm.message}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Describe custom specs, delivery date, etc..."
                    className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {quoteError && (
                  <p className="text-[11px] font-semibold text-red-500">
                    {quoteError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={quoteLoading}
                  className="mt-2 w-full cursor-pointer bg-amber-500 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {quoteLoading ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Full Page Image Zoom Modal / Lightbox */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          {/* Close button top right */}
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer hover:scale-105 active:scale-95 flex items-center justify-center"
            aria-label="Close Zoom"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous image button */}
          {product.images && product.images.length > 1 && (
            <button
              onClick={() => {
                setZoomIndex((prev) => (prev === 0 ? product.images!.length - 1 : prev - 1))
                setZoomScale(1)
              }}
              className="absolute left-4 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer hover:scale-105 active:scale-95 z-40 flex items-center justify-center"
              aria-label="Previous Image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Main zoomed image */}
          <div className="relative w-full h-full max-w-[90vw] max-h-[85vh] flex items-center justify-center select-none overflow-hidden">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={product.images?.[zoomIndex]?.url || activeImage || "/images/placeholder-light.jpg"}
                alt={product.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300 cursor-zoom-out"
                onClick={() => setIsZoomOpen(false)}
                style={{
                  transform: `scale(${zoomScale})`,
                }}
              />
            </div>
          </div>

          {/* Next image button */}
          {product.images && product.images.length > 1 && (
            <button
              onClick={() => {
                setZoomIndex((prev) => (prev === product.images!.length - 1 ? 0 : prev + 1))
                setZoomScale(1)
              }}
              className="absolute right-4 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer hover:scale-105 active:scale-95 z-40 flex items-center justify-center"
              aria-label="Next Image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Zoom controls & details bottom bar */}
          <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3 text-white z-40">
            {/* Zoom scale controls */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 shadow-lg">
              <button
                onClick={() => setZoomScale((prev) => Math.max(1, prev - 0.25))}
                className="p-1 hover:text-amber-400 transition-colors text-lg font-bold w-6 h-6 flex items-center justify-center cursor-pointer"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-xs font-mono min-w-[50px] text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale((prev) => Math.min(3, prev + 0.25))}
                className="p-1 hover:text-amber-400 transition-colors text-lg font-bold w-6 h-6 flex items-center justify-center cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
              {zoomScale !== 1 && (
                <button
                  onClick={() => setZoomScale(1)}
                  className="ml-2 text-[10px] font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Thumbnail pagination or indicator */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 max-w-full overflow-x-auto px-4 py-1 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={img.url || idx}
                    onClick={() => {
                      setZoomIndex(idx)
                      setZoomScale(1)
                    }}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      zoomIndex === idx
                        ? "border-amber-500 scale-105"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Zoom Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
