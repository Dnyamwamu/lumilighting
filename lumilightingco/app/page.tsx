import React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Lightbulb,
  Sparkles,
  ShieldCheck,
  Truck,
  Clock,
  CheckCircle,
  MessageSquare,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ProductCard from "@/components/shop/ProductCard"
import { Product, medusa, ProductCategory, ProductCollection } from "@/lib/medusa"
import { sanityService } from "@/lib/sanity"
import HeroCarousel from "@/components/layout/HeroCarousel"
import ExploreCategories from "@/components/layout/ExploreCategories"

// Mock products for visual presentation
const MOCK_FEATURED_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Vintage Edison Filament Filament Bulb (4W)",
    handle: "vintage-edison-bulb-4w",
    thumbnail:
      "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=600",
    categories: [{ id: "cat-1", name: "LED Bulbs", handle: "led-bulbs" }],
    variants: [
      {
        id: "var-1",
        title: "Default",
        inventory_quantity: 42,
        prices: [{ id: "pr-1", currency_code: "KES", amount: 45000 }],
      },
    ],
    metadata: { discount_rate: 10 },
  },
  {
    id: "prod-2",
    title: "LUMI Premium LED Panel Light (18W)",
    handle: "lumi-led-panel-18w",
    thumbnail:
      "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=600",
    categories: [{ id: "cat-2", name: "LED Panels", handle: "led-panels" }],
    variants: [
      {
        id: "var-2",
        title: "Default",
        inventory_quantity: 15,
        prices: [{ id: "pr-2", currency_code: "KES", amount: 125000 }],
      },
    ],
  },
  {
    id: "prod-3",
    title: "Modern Crystal Chandelier (6-Light)",
    handle: "modern-crystal-chandelier-6-light",
    thumbnail:
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=600",
    categories: [{ id: "cat-3", name: "Chandeliers", handle: "chandeliers" }],
    variants: [
      {
        id: "var-3",
        title: "Default",
        inventory_quantity: 4,
        prices: [{ id: "pr-3", currency_code: "KES", amount: 3200000 }],
      },
    ],
    metadata: { discount_rate: 15 },
  },
  {
    id: "prod-4",
    title: "Outdoor Waterproof LED Floodlight (100W)",
    handle: "outdoor-led-floodlight-100w",
    thumbnail:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600",
    categories: [{ id: "cat-4", name: "Floodlights", handle: "floodlights" }],
    variants: [
      {
        id: "var-4",
        title: "Default",
        inventory_quantity: 22,
        prices: [{ id: "pr-4", currency_code: "KES", amount: 450000 }],
      },
    ],
  },
]

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  // Fetched Parent Category Handles
  "indoor-lighting":
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600",
  "outdoor-lighting":
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=600",
  "commercial-lighting":
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
  "solar-solutions":
    "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=600",
  "smart-lighting":
    "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=600",
  "electrical-accessories":
    "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80&w=600",
  "decorative-lighting":
    "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=600",
  "industrial-lighting":
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600",

  // Specific Subcategory Handles
  "led-bulbs":
    "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=300",
  "led-panels":
    "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=300",
  "chandeliers":
    "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=300",
  "floodlights":
    "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=300",
  "switches-sockets":
    "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80&w=300",
}
const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600"

const getCategoryImageUrl = (category: ProductCategory) => {
  // 1. Try to read from metadata.image or metadata.images
  const metaImage = category.metadata?.image || category.metadata?.images
  if (metaImage) {
    if (typeof metaImage === "string") return metaImage
    if (Array.isArray(metaImage) && metaImage.length > 0 && typeof metaImage[0] === "string") {
      return metaImage[0]
    }
  }

  // 2. Try to read from product_category_images returned by Medusa
  if (category.product_category_images && category.product_category_images.length > 0) {
    const primaryImg = category.product_category_images.find((img) => img.type === "thumbnail") || category.product_category_images[0]
    if (primaryImg?.url) {
      return primaryImg.url
    }
  }

  // 3. Fallback to hardcoded map or default image
  return (
    FALLBACK_CATEGORY_IMAGES[category.handle] ||
    DEFAULT_FALLBACK_IMAGE
  )
}

export default async function Page() {
  const heroes = await sanityService.getHeroes().catch((err) => {
    console.error("Failed to fetch heroes from Sanity:", err)
    return []
  })

  const { product_categories: liveCategories } = await medusa.getCategories().catch((err) => {
    console.error("Failed to fetch product categories:", err)
    return { product_categories: [] }
  })

  const { collections } = await medusa.getCollections().catch((err) => {
    console.error("Failed to fetch product collections:", err)
    return { collections: [] }
  })

  const { products: liveProducts } = await medusa.getProducts({ limit: 100 }).catch((err) => {
    console.error("Failed to fetch products:", err)
    return { products: [], count: 0 }
  })

  // Extract parent categories only
  const childIds = new Set<string>()
  for (const cat of liveCategories) {
    if (cat.category_children) {
      for (const child of cat.category_children) {
        childIds.add(child.id)
      }
    }
  }

  const parentCategories = liveCategories.filter((cat) => !childIds.has(cat.id))

  let displayedCategories = parentCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    href: `/shop?category=${cat.handle}`,
    image: getCategoryImageUrl(cat),
  }))

  if (displayedCategories.length === 0) {
    displayedCategories = [
      { id: "fallback-cat-1", name: "LED Bulbs", href: "/shop?category=led-bulbs", image: FALLBACK_CATEGORY_IMAGES["led-bulbs"] },
      { id: "fallback-cat-2", name: "LED Panels", href: "/shop?category=led-panels", image: FALLBACK_CATEGORY_IMAGES["led-panels"] },
      { id: "fallback-cat-3", name: "Chandeliers", href: "/shop?category=chandeliers", image: FALLBACK_CATEGORY_IMAGES["chandeliers"] },
      { id: "fallback-cat-4", name: "Floodlights", href: "/shop?category=floodlights", image: FALLBACK_CATEGORY_IMAGES["floodlights"] },
      { id: "fallback-cat-5", name: "Switches & Sockets", href: "/shop?category=switches-sockets", image: FALLBACK_CATEGORY_IMAGES["switches-sockets"] },
    ]
  }

  // Filter collections that have products (natively linked or matching a product tag)
  const collectionsWithProducts = collections.map((col) => {
    const colProducts = liveProducts.filter((p) => 
      p.collection_id === col.id ||
      p.tags?.some((t) => {
        const tagVal = t.value.toLowerCase().trim();
        const colHandle = col.handle.toLowerCase().trim();
        const colTitle = col.title.toLowerCase().trim();
        return tagVal === colHandle || tagVal === colTitle || tagVal.replace(/\s+/g, '-') === colHandle;
      })
    )
    return {
      ...col,
      products: colProducts,
    }
  }).filter((col) => col.products.length > 0)

  // Find featured collection (e.g. handle matches "featured-showroom-deals", or "featured-products", or contains "featured" or "deals")
  const featuredCollection = collectionsWithProducts.find(
    (col) =>
      col.handle === "featured-showroom-deals" ||
      col.handle === "featured-products" ||
      col.handle.toLowerCase().includes("featured") ||
      col.handle.toLowerCase().includes("deals")
  ) || collectionsWithProducts[0]

  const otherCollectionsWithProducts = featuredCollection
    ? collectionsWithProducts.filter((col) => col.id !== featuredCollection.id)
    : []

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <HeroCarousel initialSlides={heroes} />

      <main className="flex-grow">
        {/* Core Value Props */}
        <section className="border-b border-border bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    Showroom Quality Guarantee
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    100% genuine premium fixtures from Kijabe Street.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    Personalized Shipping
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Delivery coordinates confirmed via phone call.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    Instant M-Pesa Checkout
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Secure Safaricom STK push prompts directly to your phone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Explore Categories
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Find the perfect curated lighting categories for your spaces.
              </p>
            </div>

            <ExploreCategories categories={displayedCategories} />
          </div>
        </section>

        {/* Featured Showroom Deals (from Medusa Collection or Fallback) */}
        {featuredCollection ? (
          <section className="border-t border-b border-border/50 bg-muted/20 py-16 first-of-type:border-t-0">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    {featuredCollection.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {featuredCollection.description || "Premium lighting items at unmatched prices."}
                  </p>
                </div>
                <Link href={`/shop?collection=${featuredCollection.handle}`}>
                  <Button
                    variant="ghost"
                    className="flex cursor-pointer items-center gap-1 text-sm font-semibold hover:text-amber-500"
                  >
                    View Collection <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                {featuredCollection.products.slice(0, 4).map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </div>
          </section>
        ) : (
          /* Fallback: Mock Featured Products when no collections exist */
          <section className="border-t border-b border-border/50 bg-muted/20 py-16 first-of-type:border-t-0">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Featured Showroom Deals
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Premium lighting items at unmatched prices.
                  </p>
                </div>
                <Link href="/shop">
                  <Button
                    variant="ghost"
                    className="flex cursor-pointer items-center gap-1 text-sm font-semibold hover:text-amber-500"
                  >
                    View All Shop <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                {MOCK_FEATURED_PRODUCTS.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Other Collections with Products Sections */}
        {otherCollectionsWithProducts.length > 0 &&
          otherCollectionsWithProducts.map((col) => (
            <section key={col.id} className="border-b border-border/50 bg-muted/20 py-16">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 flex items-end justify-between">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      {col.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {col.description || `Premium items in our ${col.title} collection.`}
                    </p>
                  </div>
                  <Link href={`/shop?collection=${col.handle}`}>
                    <Button
                      variant="ghost"
                      className="flex cursor-pointer items-center gap-1 text-sm font-semibold hover:text-amber-500"
                    >
                      View Collection <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                  {col.products.slice(0, 4).map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              </div>
            </section>
          ))}

        {/* Lighting Calculator Preview */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white shadow-xl md:flex-row md:p-12">
            <div className="max-w-md space-y-4">
              <span className="block text-xs font-bold tracking-wider text-amber-400 uppercase">
                Interactive Tool
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Not Sure How Many Bulbs You Need?
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                Use our Room Lighting Calculator to input your room dimensions
                and calculate recommended light levels (Lux/Lumens) and fixture
                quantities automatically.
              </p>
              <Link href="/calculator" className="mt-2 inline-block">
                <Button className="cursor-pointer bg-amber-500 font-bold text-white hover:bg-amber-600">
                  Launch Lighting Calculator
                </Button>
              </Link>
            </div>
            <div className="relative aspect-square w-64 shrink-0 md:w-80">
              <Image
                src="https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=400"
                alt="Lighting tool vector"
                fill
                className="rounded-2xl border border-slate-800 object-cover"
              />
            </div>
          </div>
        </section>

        {/* Why Choose LUMI */}
        <section className="border-t border-border bg-muted/40 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Why Choose LUMI Lighting
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We deliver lighting solutions engineered to last and designed to
                impress.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-4">
              <div className="rounded-2xl border border-border bg-background p-6">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-lg font-bold text-amber-500">
                  1
                </div>
                <h3 className="text-sm font-bold">Luxury Aesthetics</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Curated catalog of modern chandelier designs and minimalist
                  panels.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-6">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-lg font-bold text-amber-500">
                  2
                </div>
                <h3 className="text-sm font-bold">Energy Savings</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  LED drivers calibrated to minimize power bills by up to 80%.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-6">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-lg font-bold text-amber-500">
                  3
                </div>
                <h3 className="text-sm font-bold">Expert Consultation</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Free lux calculations for contractors, hotels, and building
                  projects.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-6">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-lg font-bold text-amber-500">
                  4
                </div>
                <h3 className="text-sm font-bold">Daraja M-Pesa API</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Swift one-click checkout using M-Pesa STK push callbacks.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
