"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ShopFilters from "@/components/shop/ShopFilters"
import ProductCard from "@/components/shop/ProductCard"
import { Product, ProductCategory, ProductCollection, medusa } from "@/lib/medusa"
import { Grid, List, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"

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

const BRANDS = ["Brand1", "LUMI"]

function ShopContent() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get("q") || ""
  const categoryParam = searchParams.get("category") || ""
  const collectionParam = searchParams.get("collection") || ""
  const tagParam = searchParams.get("tag") || ""

  const [products, setProducts] = useState<Product[]>([])
  const [liveCategories, setLiveCategories] = useState<ProductCategory[]>([])
  const [collections, setCollections] = useState<ProductCollection[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [selectedCollection, setSelectedCollection] = useState(collectionParam)
  const [selectedTag, setSelectedTag] = useState(tagParam)
  const [priceRange, setPriceRange] = useState<number>(50000)
  const [selectedBrand, setSelectedBrand] = useState("")
  const [sortBy, setSortBy] = useState("popular")
  const [isGridView, setIsGridView] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [searchedProductIds, setSearchedProductIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery)

  // Keep track of filter/search states to reset page count during render
  const currentFiltersKey = `${searchQuery}|${selectedCategory}|${selectedCollection}|${selectedTag}|${selectedBrand}|${priceRange}|${sortBy}`
  const [prevFiltersKey, setPrevFiltersKey] = useState(currentFiltersKey)

  // Keep track of the previous parameters as a single object to sync URL to state during render
  const currentParamsKey = `${queryParam}|${categoryParam}|${collectionParam}|${tagParam}`
  const [prevParamsKey, setPrevParamsKey] = useState(currentParamsKey)

  if (currentParamsKey !== prevParamsKey) {
    setPrevParamsKey(currentParamsKey)
    setSearchQuery(queryParam)
    setSelectedCategory(categoryParam)
    setSelectedCollection(collectionParam)
    setSelectedTag(tagParam)
    
    // Always reset other filters (brand, price, sorting) to start fresh when primary URL parameters change
    setSelectedBrand("")
    setPriceRange(50000)
    setSortBy("popular")
  }

  // Adjust searched product IDs when search query is cleared during render to prevent cascading renders
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery)
    if (!searchQuery.trim()) {
      setSearchedProductIds([])
    }
  }

  // Reset current page when filters or queries change during render to prevent cascading renders
  if (currentFiltersKey !== prevFiltersKey) {
    setPrevFiltersKey(currentFiltersKey)
    setCurrentPage(1)
  }

  // Debounced Meilisearch query when searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true)
      try {
        const data = await medusa.searchProducts(searchQuery)
        if (data.hits) {
          setSearchedProductIds(data.hits.map((h: { id: string }) => h.id))
        } else {
          setSearchedProductIds([])
        }
      } catch (err) {
        console.error("Failed to query Meilisearch:", err)
        setSearchedProductIds([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  useEffect(() => {
    async function fetchLiveProducts() {
      try {
        const { products: liveProducts } = await medusa.getProducts({
          limit: 500,
        })
        if (liveProducts) {
          // Merge mock metadata (brand, specs, discount_rate) with live product details if handles match
          const mergedProducts = liveProducts.map((lp) => {
            const mockMeta = PRODUCT_METADATA_LOOKUP[lp.handle]
            return {
              ...lp,
              metadata: {
                ...mockMeta,
                ...lp.metadata,
              },
            }
          })
          setProducts(mergedProducts)
        }
      } catch (err) {
        console.error("Failed to fetch live products from Medusa:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLiveProducts()
  }, [])

  useEffect(() => {
    async function fetchFilterData() {
      try {
        const [catRes, colRes] = await Promise.all([
          medusa.getCategories(),
          medusa.getCollections(),
        ])
        if (catRes?.product_categories) {
          setLiveCategories(catRes.product_categories)
        }
        if (colRes?.collections) {
          setCollections(colRes.collections)
        }
      } catch (err) {
        console.error("Failed to fetch filter data from Medusa:", err)
      }
    }
    fetchFilterData()
  }, [])

  // Lookup active category and collection objects for header display
  const activeCategory = useMemo(() => {
    if (!selectedCategory) return null
    return liveCategories.find((c) => c.handle === selectedCategory) || null
  }, [selectedCategory, liveCategories])

  // Get all handles of selected category and its subcategories (recursively)
  const selectedCategoryHandles = useMemo(() => {
    if (!selectedCategory) return new Set<string>()
    const handles = new Set<string>([selectedCategory])

    const startCat = liveCategories.find((c) => c.handle === selectedCategory)
    if (!startCat) return handles

    const queue = [startCat]
    while (queue.length > 0) {
      const current = queue.shift()!
      if (current.category_children && current.category_children.length > 0) {
        for (const childRef of current.category_children) {
          const fullChild = liveCategories.find((c) => c.id === childRef.id)
          if (fullChild && !handles.has(fullChild.handle)) {
            handles.add(fullChild.handle)
            queue.push(fullChild)
          }
        }
      }
    }
    return handles
  }, [selectedCategory, liveCategories])

  const activeCollection = useMemo(() => {
    if (!selectedCollection) return null
    return collections.find((c) => c.handle === selectedCollection) || null
  }, [selectedCollection, collections])

  // Flatten the category tree recursively to pass to ShopFilters
  const flattenedCategories = useMemo(() => {
    const list: { name: string; handle: string; depth: number }[] = []

    // Helper to find which categories are root categories (not a child of any category)
    const childIds = new Set<string>()
    for (const cat of liveCategories) {
      if (cat.category_children) {
        for (const child of cat.category_children) {
          childIds.add(child.id)
        }
      }
    }

    const roots = liveCategories.filter((cat) => !childIds.has(cat.id))

    function recurse(nodes: ProductCategory[], depth = 0) {
      for (const node of nodes) {
        list.push({
          name: node.name,
          handle: node.handle,
          depth,
        })

        if (node.category_children && node.category_children.length > 0) {
          const fullChildren = node.category_children
            .map((childRef) => liveCategories.find((c) => c.id === childRef.id))
            .filter((c): c is ProductCategory => !!c)
          recurse(fullChildren, depth + 1)
        }
      }
    }

    recurse(roots)
    return list
  }, [liveCategories])

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search Query (using Meilisearch results)
    if (searchQuery) {
      result = searchedProductIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => !!p)
    }

    // Category
    if (selectedCategory) {
      result = result.filter((p) =>
        p.categories?.some((c) => selectedCategoryHandles.has(c.handle))
      )
    }

    // Collection
    if (selectedCollection && collections.length > 0) {
      const activeCol = collections.find((c) => c.handle === selectedCollection)
      if (activeCol) {
        result = result.filter((p) => 
          p.collection_id === activeCol.id ||
          p.tags?.some((t) => {
            const tagVal = t.value.toLowerCase().trim();
            const colHandle = activeCol.handle.toLowerCase().trim();
            const colTitle = activeCol.title.toLowerCase().trim();
            return tagVal === colHandle || tagVal === colTitle || tagVal.replace(/\s+/g, '-') === colHandle;
          })
        )
      }
    }

    // Tag / Badge
    if (selectedTag) {
      const lowerTag = selectedTag.toLowerCase().trim()
      result = result.filter((p) => {
        const badge = String(p.metadata?.badge || "").toLowerCase().trim()
        const hasTag = p.tags?.some((t) => t.value.toLowerCase().trim() === lowerTag)
        return badge === lowerTag || hasTag
      })
    }

    // Brand
    if (selectedBrand) {
      result = result.filter((p) => p.metadata?.brand === selectedBrand)
    }

    // Price range check
    result = result.filter((p) => {
      const defaultVariant = p.variants?.[0]
      const origPrice = defaultVariant?.prices?.[0]
        ? defaultVariant.prices[0].amount / 100
        : 0
      const discount = p.metadata?.discount_rate as number | undefined
      const price = discount ? origPrice * (1 - discount / 100) : origPrice
      return price <= priceRange
    })

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => {
        const priceA = (a.variants?.[0]?.prices?.[0]?.amount || 0) / 100
        const priceB = (b.variants?.[0]?.prices?.[0]?.amount || 0) / 100
        return priceA - priceB
      })
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => {
        const priceA = (a.variants?.[0]?.prices?.[0]?.amount || 0) / 100
        const priceB = (b.variants?.[0]?.prices?.[0]?.amount || 0) / 100
        return priceB - priceA
      })
    }

    return result
  }, [
    products,
    searchQuery,
    searchedProductIds,
    selectedCategory,
    selectedCategoryHandles,
    selectedCollection,
    collections,
    selectedTag,
    selectedBrand,
    priceRange,
    sortBy,
  ])

  const PRODUCTS_PER_PAGE = 100

  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  }, [filteredProducts])

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)
  }, [filteredProducts, currentPage])

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb / Title */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-border/40 pb-6 md:flex-row md:items-end">
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="text-3xl font-extrabold tracking-tight">
              {selectedTag ? `${selectedTag} Products` : (activeCategory?.name || activeCollection?.title || "Store Showroom")}
            </h1>
            {(selectedTag || activeCategory?.description || activeCollection?.description) && (
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                {selectedTag
                  ? `Browse our top-rated ${selectedTag.toLowerCase()} premium light fittings and fixtures.`
                  : (activeCategory?.description || activeCollection?.description)}
              </p>
            )}
            <p className="text-xs font-semibold text-amber-500">
              {isLoading
                ? "Loading showroom..."
                : `Displaying ${filteredProducts.length} premium lighting products`}
            </p>
          </div>

          {/* View controls */}
          <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted/50 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>

            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/20 p-1">
              <button
                onClick={() => setIsGridView(true)}
                className={`cursor-pointer rounded-md p-1.5 ${isGridView ? "bg-background text-primary shadow-xs" : "text-muted-foreground"}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsGridView(false)}
                className={`cursor-pointer rounded-md p-1.5 ${!isGridView ? "bg-background text-primary shadow-xs" : "text-muted-foreground"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-4">
          {/* Desktop Sidebar Filters */}
          <div className="sticky top-20 hidden lg:col-span-1 lg:block">
            <ShopFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedCollection={selectedCollection}
              setSelectedCollection={setSelectedCollection}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sortBy={sortBy}
              setSortBy={setSortBy}
              categories={flattenedCategories}
              collections={collections}
            />
          </div>

          {/* Mobile Sidebar Modal */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                onClick={() => setShowMobileFilters(false)}
              />
              <div className="absolute inset-y-0 left-0 z-10 w-80 max-w-sm animate-in overflow-y-auto border-r border-border bg-background p-6 duration-300 slide-in-from-left">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="rounded-md p-1 text-sm font-bold hover:bg-muted"
                  >
                    Close
                  </button>
                </div>
                <ShopFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedCollection={selectedCollection}
                  setSelectedCollection={setSelectedCollection}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  categories={flattenedCategories}
                  collections={collections}
                />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-muted/20 py-20 text-center">
                <p className="text-base font-semibold">No products found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your filters or keyword query.
                </p>
              </div>
            ) : (
              <div>
                <div
                  className={
                    isGridView
                      ? "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3"
                      : "flex flex-col gap-6"
                  }
                >
                  {paginatedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className={isGridView ? "" : "mx-auto w-full max-w-3xl"}
                    >
                      <ProductCard product={prod} />
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                      Showing{" "}
                      <span className="font-semibold text-foreground">
                        {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-foreground">
                        {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-foreground">
                        {filteredProducts.length}
                      </span>{" "}
                      products
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:hover:bg-background cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </button>
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum)
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              currentPage === pageNum
                                ? "bg-amber-500 text-white"
                                : "border border-border bg-background text-foreground hover:bg-muted/50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => {
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/50 disabled:opacity-50 disabled:hover:bg-background cursor-pointer"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ShopPage() {
  return (
    <React.Suspense
      fallback={
        <div className="relative flex min-h-screen flex-col bg-background text-foreground">
          <Navbar />
          <main className="flex flex-grow items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-500"></div>
          </main>
          <Footer />
        </div>
      }
    >
      <ShopContent />
    </React.Suspense>
  )
}
