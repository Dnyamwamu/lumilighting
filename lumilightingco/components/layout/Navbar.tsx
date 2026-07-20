"use client"

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
  Lightbulb,
  ShoppingCart,
  Menu,
  X,
  Calculator,
  BookOpen,
  Info,
  PhoneCall,
  Sparkles,
  Search,
  Sun,
  Moon,
  HelpCircle,
  Home,
  Heart,
  Store,
} from "lucide-react"
import CartDrawer from "../cart/CartDrawer"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { Product, ProductCategory, ProductCollection, medusa } from "@/lib/medusa"

function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      if (active) {
        setMounted(true)
      }
    }, 0)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [])

  if (!mounted) {
    return <div className="h-9 w-9" />
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="cursor-pointer rounded-lg p-2 text-foreground transition-colors hover:bg-muted/50"
      aria-label="Toggle Theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5 animate-in text-amber-500 duration-500 spin-in-180" />
      ) : (
        <Moon className="h-5 w-5 animate-in text-slate-700 duration-500 spin-in-180 dark:text-slate-300" />
      )}
    </button>
  )
}

function SearchParamsSync({
  setSearchQuery,
  setSearchCategory,
}: {
  setSearchQuery: (q: string) => void
  setSearchCategory: (c: string) => void
}) {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""

  useEffect(() => {
    setSearchQuery(q)
    setSearchCategory(category)
  }, [q, category, setSearchQuery, setSearchCategory])

  return null
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { cart, isCartOpen, setIsCartOpen } = useCart()
  const { wishlist } = useWishlist()
  const pathname = usePathname()
  const { isSignedIn } = useUser()

  // Megamenu & Dynamic Categories/Collections
  const [isMegamenuOpen, setIsMegamenuOpen] = useState(false)
  const [activeMobileAccordion, setActiveMobileAccordion] = useState<string | null>(null)
  const [liveCategories, setLiveCategories] = useState<ProductCategory[]>([])
  const [collections, setCollections] = useState<ProductCollection[]>([])
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function fetchNavbarData() {
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
        console.error("Failed to fetch navbar categories/collections:", err)
      }
    }
    fetchNavbarData()
  }, [])

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)
    setIsMegamenuOpen(true)
  }

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setIsMegamenuOpen(false)
    }, 150)
  }

  const childIds = useMemo(() => {
    const ids = new Set<string>()
    for (const cat of liveCategories) {
      if (cat.category_children) {
        for (const child of cat.category_children) {
          ids.add(child.id)
        }
      }
    }
    return ids
  }, [liveCategories])

  const parentCategories = useMemo(() => {
    return liveCategories.filter((cat) => !childIds.has(cat.id))
  }, [liveCategories, childIds])

  const categoryGroups = useMemo(() => {
    const findByName = (name: string) =>
      liveCategories.find((c) => c.name.toLowerCase() === name.toLowerCase())
    const findChildren = (parentName: string) => {
      const parent = findByName(parentName)
      if (!parent) return []
      return (parent.category_children || [])
        .map((childRef) => liveCategories.find((c) => c.id === childRef.id))
        .filter((c): c is ProductCategory => !!c)
    }

    return {
      indoor: findChildren("Indoor Lighting"),
      outdoor: findChildren("Outdoor Lighting"),
      commercial: findChildren("Commercial Lighting"),
      industrial: findChildren("Industrial Lighting"),
      accessories: findChildren("Electrical Accessories"),
      solar: findChildren("Solar Lighting"),
      smart: findChildren("Smart Lighting"),
      components: findChildren("Lighting Components"),
      decorative: findChildren("Decorative Lighting"),
    }
  }, [liveCategories])

  // Search States & Refs
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchCategory, setSearchCategory] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Close search and clear states cleanly (no cascading effects)
  const handleCloseSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery("")
    setSearchCategory("")
    setSearchResults([])
    setIsSearchLoading(false)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }

  // Debounced search event handler (replaces useEffect fetching to avoid sync triggers)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!query.trim()) {
      setSearchResults([])
      setIsSearchLoading(false)
      return
    }

    setIsSearchLoading(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await medusa.searchProducts(query)
        setSearchResults(data.hits || [])
      } catch (err) {
        console.error("Failed to search products via Meilisearch:", err)
      } finally {
        setIsSearchLoading(false)
      }
    }, 300)
  }

  const filteredSearchResults = useMemo(() => {
    if (!searchCategory) return searchResults
    return searchResults.filter((product) =>
      product.categories?.some((cat) => cat.handle === searchCategory)
    )
  }, [searchResults, searchCategory])

  const handleSearchSubmit = () => {
    const trimmedQuery = searchQuery.trim()
    const catQuery = searchCategory ? `category=${searchCategory}` : ""
    const qQuery = trimmedQuery ? `q=${encodeURIComponent(trimmedQuery)}` : ""
    const params = [qQuery, catQuery].filter(Boolean).join("&")

    window.location.href = `/shop${params ? `?${params}` : ""}`
    handleCloseSearch()
  }

  const handleCategorySelect = (category: string) => {
    setSearchCategory(category)
    const trimmedQuery = searchQuery.trim()
    const catQuery = category ? `category=${category}` : ""
    const qQuery = trimmedQuery ? `q=${encodeURIComponent(trimmedQuery)}` : ""
    const params = [qQuery, catQuery].filter(Boolean).join("&")

    window.location.href = `/shop${params ? `?${params}` : ""}`
    handleCloseSearch()
  }

  // Shortcut key listeners (Cmd+K / Ctrl+K and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        handleCloseSearch()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const cartItemCount =
    cart?.items.reduce((count, item) => count + item.quantity, 0) || 0

  const topNavLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "About Us", href: "/about", icon: Info },
    { name: "Blog & Guides", href: "/blog", icon: BookOpen },
    { name: "FAQs", href: "/faq", icon: HelpCircle },
    { name: "Contact", href: "/contact", icon: PhoneCall },
  ]

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsSync
          setSearchQuery={setSearchQuery}
          setSearchCategory={setSearchCategory}
        />
      </Suspense>
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md overflow-visible">
        {/* Scoped CSS for Illuminating Light Effect */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes headerGlow {
            0%, 100% {
              opacity: 0.55;
              filter: blur(15px) brightness(1);
            }
            50% {
              opacity: 0.85;
              filter: blur(22px) brightness(1.25);
            }
          }
          .header-light-beam {
            animation: headerGlow 7s ease-in-out infinite;
          }
        ` }} />

        {/* Top Glowing Edge Ray */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent pointer-events-none z-50" />
        
        {/* Soft Radial Spotlight Halo */}
        <div 
          className="header-light-beam absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[55px] pointer-events-none mix-blend-screen z-50 transition-all" 
          style={{ 
            backgroundImage: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.08) 35%, rgba(245, 158, 11, 0) 70%)' 
          }}
        />

        {/* Row 1: Logo & Branding, Top Nav Links, Actions */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-9 w-28 shrink-0">
              <Image
                src="/lumi-logo-yellow-shadow.png"
                alt="LUMI Logo"
                fill
                className="object-contain drop-shadow-sm"
                priority
              />
            </div>
            <span className="font-bold text-xs tracking-widest text-amber-500 uppercase">
              Lighting
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-6 md:flex">
            {topNavLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${isActive
                    ? "mt-0.5 border-b-2 border-primary pb-1 text-primary"
                    : "text-muted-foreground"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Action buttons (Auth, Cart, Mobile Menu toggle) */}
          <div className="flex items-center gap-3.5">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wishlist Link */}
            <Link
              href="/dashboard?tab=wishlist"
              className="relative cursor-pointer rounded-lg p-2 text-foreground transition-colors hover:bg-muted/50"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 animate-in items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white duration-200 zoom-in">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative cursor-pointer rounded-lg p-2 text-foreground transition-colors hover:bg-muted/50"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 animate-in items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white duration-200 zoom-in">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Clerk Authentication */}
            <div className="hidden sm:block">
              {isSignedIn ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-sm font-medium">
                      Dashboard
                    </Button>
                  </Link>
                  <UserButton
                    appearance={{
                      elements: {
                        userButtonAvatarBox:
                          "w-9 h-9 border border-border shadow-sm",
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <Button
                      variant="ghost"
                      className="cursor-pointer text-sm font-medium hover:bg-muted/50"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="cursor-pointer bg-primary text-primary-foreground shadow-md shadow-primary/10 transition-all duration-200 hover:bg-primary/95">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer rounded-lg p-2 text-foreground hover:bg-muted/50 md:hidden"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Dedicated Meilisearch Bar (Visible on Mobile & Desktop) */}
        <div className="border-t border-border/30 bg-muted/5 py-2.5 px-3 sm:px-6 sm:py-3">
          <div className="mx-auto max-w-7xl flex items-center justify-center gap-2 sm:gap-3">
            <div className="relative flex h-10 sm:h-11 items-center w-full max-w-3xl rounded-xl border border-border/50 bg-background/50 focus-within:border-amber-500 focus-within:bg-background focus-within:ring-1 focus-within:ring-amber-500 transition-all duration-300 overflow-hidden shadow-sm hover:border-border/80">
              <div className="flex items-center h-full border-r border-border/40 shrink-0 bg-muted/5">
                <select
                  value={searchCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit()
                    }
                  }}
                  className="h-full bg-transparent pl-2.5 sm:pl-4 pr-1 text-[11px] sm:text-xs font-bold tracking-wider text-muted-foreground/80 hover:text-amber-500 focus:outline-none cursor-pointer max-w-[90px] sm:max-w-[140px] truncate"
                >
                  <option value="" className="bg-background text-foreground font-sans">All</option>
                  {parentCategories.map((cat) => (
                    <option key={cat.id} value={cat.handle} className="bg-background text-foreground font-sans">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-grow h-full flex items-center">
                <input
                  type="text"
                  placeholder="Search lights, switches, bulbs..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit()
                    }
                  }}
                  className="w-full h-full bg-transparent pr-8 sm:pr-10 pl-8 sm:pl-10 text-xs sm:text-sm placeholder:text-muted-foreground/60 focus:outline-none"
                />
                <Search className="absolute left-2.5 sm:left-3.5 h-4 w-4 sm:h-4.5 sm:w-4.5 text-muted-foreground" />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 sm:right-3.5 rounded p-0.5 text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                )}
              </div>

              <button
                onClick={handleSearchSubmit}
                className="h-full px-3.5 sm:px-5 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-colors duration-200 shrink-0 flex items-center justify-center gap-1"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || searchCategory) && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSearchCategory("")
                  window.location.href = "/shop"
                }}
                className="h-10 sm:h-11 px-2.5 sm:px-4 cursor-pointer rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold transition-all duration-200 shrink-0 flex items-center gap-1 shadow-sm hover:border-amber-500/30 hover:text-amber-500 animate-in slide-in-from-right-2 fade-in"
                title="Clear all search filters"
              >
                <X className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Collections sub-nav */}
        <div className="border-t border-border/10 bg-amber-500">
          <div className="mx-auto flex h-11 sm:h-12 max-w-7xl items-center px-4 sm:px-6 lg:px-8 justify-center">
            <div className="flex items-center justify-start md:justify-center gap-5 sm:gap-6 overflow-x-auto scrollbar-none py-1 w-full">
              {/* Special Store Icon link with Category Dropdown */}
              <div className="group relative shrink-0 flex items-center">
                <a
                  href="/shop"
                  aria-label="Shop All"
                  title="Shop All"
                  className="flex items-center justify-center p-1.5 rounded-lg text-amber-950 hover:bg-amber-600/30 transition-colors"
                >
                  <Store className="h-4.5 w-4.5 stroke-[2.2]" />
                </a>
                <div className="absolute left-0 top-full z-50 hidden min-w-[220px] rounded-xl border border-border/80 bg-background/95 p-3.5 shadow-2xl backdrop-blur-md group-hover:block animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="mb-2 text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase px-2.5">
                    Browse Categories
                  </div>
                  <ul className="space-y-1">
                    {parentCategories.map((cat) => (
                      <li key={cat.id}>
                        <a
                          href={`/shop?category=${cat.handle}`}
                          className="block rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-amber-500 transition-colors"
                        >
                          {cat.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Collections with Category Dropdowns */}
              {collections.map((col) => (
                <div key={col.id} className="group relative shrink-0">
                  <a
                    href={`/shop?collection=${col.handle}`}
                    className="flex items-center gap-1.5 py-2 text-xs font-bold text-amber-950/80 transition-colors hover:text-amber-950"
                  >
                    <span>{col.title}</span>
                    {col.metadata?.badge && (
                      <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-sm shrink-0">
                        {String(col.metadata.badge)}
                      </span>
                    )}
                  </a>
                  <div className="absolute left-0 top-full z-50 hidden min-w-[220px] rounded-xl border border-border/80 bg-background/95 p-3.5 shadow-2xl backdrop-blur-md group-hover:block animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="mb-2 text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase px-2.5">
                      Filter by Category
                    </div>
                    <ul className="space-y-1">
                      {parentCategories.map((cat) => (
                        <li key={cat.id}>
                          <a
                            href={`/shop?collection=${col.handle}&category=${cat.handle}`}
                            className="block rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-amber-500 transition-colors"
                          >
                            {cat.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 4: Product Tags sub-nav */}
        <div className="border-t border-border/20 bg-background/50">
          <div className="mx-auto flex h-9 sm:h-10 max-w-7xl items-center px-4 sm:px-6 lg:px-8 justify-center">
            <div className="flex items-center justify-start md:justify-center gap-5 sm:gap-6 overflow-x-auto scrollbar-none py-1 w-full text-xs font-semibold text-muted-foreground/80">
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground/50 uppercase pr-1 select-none shrink-0">Quick Tags:</span>
              <a href="/shop?tag=Featured" className="hover:text-amber-500 transition-colors flex items-center gap-1 shrink-0">★ Featured</a>
              <a href="/shop?tag=Best+Seller" className="hover:text-amber-500 transition-colors flex items-center gap-1 shrink-0">🔥 Best Sellers</a>
              <a href="/shop?tag=New+Arrival" className="hover:text-amber-500 transition-colors flex items-center gap-1 shrink-0">✨ New Arrivals</a>
              <a href="/shop?tag=Trending" className="hover:text-amber-500 transition-colors flex items-center gap-1 shrink-0">⚡ Trending</a>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="animate-in border-b border-border/40 bg-background px-4 py-4 duration-200 fade-in md:hidden">
            <nav className="flex flex-col gap-4">
              {/* Static Links */}
              {topNavLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 py-2 text-sm font-medium transition-colors ${isActive
                      ? "font-bold text-primary"
                      : "text-muted-foreground"
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                )
              })}

              {/* Mobile Tags Navigation */}
              <div className="flex flex-col gap-1.5 border-t border-border/40 pt-4 mb-2">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1">
                  Browse by Tag
                </span>
                <div className="flex flex-wrap gap-2 py-1">
                  <a
                    href="/shop?tag=Featured"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-amber-500 hover:text-amber-500 transition-all flex items-center gap-1"
                  >
                    ★ Featured
                  </a>
                  <a
                    href="/shop?tag=Best+Seller"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-amber-500 hover:text-amber-500 transition-all flex items-center gap-1"
                  >
                    🔥 Best Sellers
                  </a>
                  <a
                    href="/shop?tag=New+Arrival"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-amber-500 hover:text-amber-500 transition-all flex items-center gap-1"
                  >
                    ✨ New Arrivals
                  </a>
                  <a
                    href="/shop?tag=Trending"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-amber-500 hover:text-amber-500 transition-all flex items-center gap-1"
                  >
                    ⚡ Trending
                  </a>
                </div>
              </div>

              {/* Mobile Collections and Categories */}
              <div className="flex flex-col gap-1 border-t border-border/40 pt-4">
                <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-2">
                  Shop by Collection
                </span>

                {/* Special "Shop All" mobile accordion */}
                <div className="flex flex-col">
                  <button
                    onClick={() =>
                      setActiveMobileAccordion(
                        activeMobileAccordion === "shop-all" ? null : "shop-all"
                      )
                    }
                    className="flex w-full items-center justify-between py-1.5 text-sm font-medium text-foreground transition-colors"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-amber-500">
                      <Store className="h-4 w-4" />
                      Shop All Products
                    </span>
                    <span className="text-[10px] font-bold text-amber-500">
                      {activeMobileAccordion === "shop-all" ? "Hide" : "Show"}
                    </span>
                  </button>

                  {activeMobileAccordion === "shop-all" && (
                    <div className="mt-1 ml-4 flex flex-col gap-2 border-l border-border/60 pl-3 py-1">
                      <a
                        href="/shop"
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-bold text-amber-500"
                      >
                        Browse All Products
                      </a>
                      {parentCategories.map((cat) => (
                        <a
                          key={cat.id}
                          href={`/shop?category=${cat.handle}`}
                          onClick={() => setIsOpen(false)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          {cat.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Individual Collections mobile accordions */}
                {collections.map((col) => (
                  <div key={col.id} className="flex flex-col mt-1">
                    <button
                      onClick={() =>
                        setActiveMobileAccordion(
                          activeMobileAccordion === col.id ? null : col.id
                        )
                      }
                      className="flex w-full items-center justify-between py-1.5 text-sm font-medium text-foreground transition-colors"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-semibold">
                        <span>{col.title}</span>
                        {col.metadata?.badge && (
                          <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shrink-0">
                            {String(col.metadata.badge)}
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-bold text-amber-500">
                        {activeMobileAccordion === col.id ? "Hide" : "Show"}
                      </span>
                    </button>

                    {activeMobileAccordion === col.id && (
                      <div className="mt-1 ml-4 flex flex-col gap-2 border-l border-border/60 pl-3 py-1">
                        <a
                          href={`/shop?collection=${col.handle}`}
                          onClick={() => setIsOpen(false)}
                          className="text-xs font-bold text-amber-500"
                        >
                          View Collection
                        </a>
                        {parentCategories.map((cat) => (
                          <a
                            key={cat.id}
                            href={`/shop?collection=${col.handle}&category=${cat.handle}`}
                            onClick={() => setIsOpen(false)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            {cat.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile Auth Button */}
              <div className="mt-2 border-t border-border/40 pt-4">
                {isSignedIn ? (
                  <div className="flex items-center justify-between">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        User Dashboard
                      </Button>
                    </Link>
                    <UserButton />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <SignInButton mode="modal">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="w-full bg-primary text-primary-foreground">
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Meilisearch Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex animate-in items-start justify-center bg-background/80 p-2 sm:p-4 pt-3 sm:pt-16 backdrop-blur-md duration-200 fade-in">
          <div
            className="absolute inset-0 bg-transparent"
            onClick={handleCloseSearch}
          />
          <div className="relative flex max-h-[90vh] sm:max-h-[80vh] w-full max-w-2xl animate-in flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xl duration-200 zoom-in-95">
            {/* Input Header */}
            <div className="relative flex shrink-0 items-center border-b border-border/80 bg-muted/20 p-2 sm:p-3 gap-1.5 sm:gap-2 overflow-hidden">
              {/* Category Select Pill */}
              <div className="flex items-center shrink-0 rounded-xl border border-border/80 bg-background px-2 py-1.5 shadow-xs">
                <select
                  value={searchCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="bg-transparent text-[11px] sm:text-xs font-bold text-amber-500 focus:outline-none cursor-pointer max-w-[80px] sm:max-w-[130px] truncate"
                >
                  <option value="" className="bg-background text-foreground font-sans">All</option>
                  {parentCategories.map((cat) => (
                    <option key={cat.id} value={cat.handle} className="bg-background text-foreground font-sans">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Input Box */}
              <div className="relative flex flex-1 items-center min-w-0 rounded-xl border border-border/80 bg-background px-2.5 py-1.5 focus-within:border-amber-500/50 focus-within:ring-2 focus-within:ring-amber-500/20">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search lights, bulbs..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchSubmit()
                    }
                  }}
                  className="w-full border-0 bg-transparent py-1 px-2 text-xs sm:text-base placeholder:text-muted-foreground/60 focus:outline-none text-foreground"
                />
                {isSearchLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-amber-500 shrink-0" />
                ) : searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      setSearchResults([])
                      setIsSearchLoading(false)
                      if (searchTimeoutRef.current) {
                        clearTimeout(searchTimeoutRef.current)
                      }
                    }}
                    className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted shrink-0"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {/* Search Submit Button */}
              <button
                onClick={handleSearchSubmit}
                className="h-9 sm:h-10 px-3 sm:px-5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-amber-950 font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 shrink-0 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Search</span>
              </button>

              {/* Close Modal Button */}
              <button
                onClick={handleCloseSearch}
                className="cursor-pointer rounded-xl border border-border/80 bg-background p-2 text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 shadow-xs"
                title="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results / Content Area */}
            <div className="flex-grow space-y-4 overflow-y-auto p-3 sm:p-4">
              {searchQuery.trim() === "" ? (
                // Quick Links
                <div className="space-y-3">
                  <h3 className="text-[11px] sm:text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Vintage Edison Bulb",
                      "LED Panel",
                      "Chandelier",
                      "Outdoor Floodlight",
                      "Smart Switch",
                    ].map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearchChange(term)}
                        className="cursor-pointer rounded-xl border border-border/80 bg-muted/50 px-3 py-1.5 text-xs font-medium transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-500"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : isSearchLoading && searchResults.length === 0 ? (
                // Loading Spinner
                <div className="space-y-2 py-10 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-amber-500" />
                  <p className="text-xs text-muted-foreground">
                    Searching catalog...
                  </p>
                </div>
              ) : filteredSearchResults.length > 0 ? (
                // Hits List
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2 text-[11px] sm:text-xs text-muted-foreground">
                    <span>Products Found ({filteredSearchResults.length})</span>
                    <a
                      href={`/shop?q=${encodeURIComponent(searchQuery)}${searchCategory ? `&category=${searchCategory}` : ""}`}
                      onClick={handleCloseSearch}
                      className="font-bold text-amber-500 hover:underline"
                    >
                      View All in Shop &rarr;
                    </a>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredSearchResults.map((hit) => {
                      const priceObj = hit.variants?.[0]?.prices?.[0]
                      const priceFormatted = priceObj
                        ? new Intl.NumberFormat("en-KE", {
                            style: "currency",
                            currency: priceObj.currency_code || "KES",
                            minimumFractionDigits: 0,
                          }).format(priceObj.amount / 100)
                        : null

                      return (
                        <Link
                          key={hit.id}
                          href={`/product/${hit.handle}`}
                          onClick={handleCloseSearch}
                          className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border/40 bg-muted/10 p-2.5 sm:p-3 transition-all hover:border-amber-500/30 hover:bg-amber-500/5 group"
                        >
                          {/* Thumbnail */}
                          <div className="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/40">
                            <Image
                              src={
                                hit.thumbnail || "/images/placeholder-light.jpg"
                              }
                              alt={hit.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          {/* Title and Category info */}
                          <div className="min-w-0 flex-grow">
                            <h4 className="truncate text-xs sm:text-sm font-bold text-foreground group-hover:text-amber-500 transition-colors">
                              {hit.title}
                            </h4>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              {hit.categories && hit.categories.length > 0 && (
                                <span className="rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 text-[10px] font-bold">
                                  {hit.categories[0]?.name}
                                </span>
                              )}
                              {priceFormatted && (
                                <span className="text-xs font-extrabold text-foreground">
                                  {priceFormatted}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ) : (
                // Empty State
                <div className="space-y-3 py-10 text-center">
                  <Search className="mx-auto h-8 w-8 text-muted-foreground/30" />
                  <h4 className="text-sm font-bold">No results found</h4>
                  <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                    We couldn&apos;t find any products matching &quot;
                    {searchQuery}&quot;. Check spelling or try a different term.
                  </p>
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div className="flex shrink-0 items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-2 text-[10px] text-muted-foreground">
              <span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
