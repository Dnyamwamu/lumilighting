"use client"

import React from "react"
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ShopFiltersProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  selectedCategory: string
  setSelectedCategory: (val: string) => void
  selectedCollection?: string
  setSelectedCollection?: (val: string) => void
  priceRange: number
  setPriceRange: (val: number) => void
  selectedBrand: string
  setSelectedBrand: (val: string) => void
  sortBy: string
  setSortBy: (val: string) => void
  categories: { name: string; handle: string; depth?: number }[]
  brands: string[]
}

export default function ShopFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedCollection,
  setSelectedCollection,
  priceRange,
  setPriceRange,
  selectedBrand,
  setSelectedBrand,
  sortBy,
  setSortBy,
  categories,
  brands,
}: ShopFiltersProps) {
  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <SlidersHorizontal className="h-5 w-5 text-amber-500" />
        <h3 className="text-base font-bold">Filter Products</h3>
      </div>

      {/* Search Bar */}
      <div className="space-y-2">
        <label
          htmlFor="search-input"
          className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
        >
          Search
        </label>
        <div className="relative">
          <input
            id="search-input"
            type="text"
            placeholder="Search bulb, panel, etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2.5 pl-9 text-sm focus:border-amber-500 focus:outline-none"
          />
          <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="block text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Categories
        </label>
        <div className="flex flex-col gap-1.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory("")}
            className={`cursor-pointer rounded-lg px-2.5 py-1 text-left text-sm transition-colors ${
              selectedCategory === ""
                ? "bg-amber-500 font-semibold text-white"
                : "text-foreground hover:bg-muted/50"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const depth = cat.depth || 0;
            return (
              <button
                key={cat.handle}
                onClick={() => setSelectedCategory(cat.handle)}
                style={{ paddingLeft: `${10 + depth * 12}px` }}
                className={`cursor-pointer rounded-lg py-1 pr-2.5 text-left text-sm transition-colors ${
                  selectedCategory === cat.handle
                    ? "bg-amber-500 font-semibold text-white"
                    : "text-foreground hover:bg-muted/50"
                } ${depth > 0 ? "text-xs text-muted-foreground hover:text-foreground" : "font-medium"}`}
              >
                {depth > 0 ? `↳ ${cat.name}` : cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="price-range"
            className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
          >
            Max Price
          </label>
          <span className="text-sm font-semibold text-amber-500">
            KES {priceRange.toLocaleString()}
          </span>
        </div>
        <input
          id="price-range"
          type="range"
          min="100"
          max="50000"
          step="500"
          value={priceRange}
          onChange={(e) => setPriceRange(parseInt(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-amber-500"
        />
      </div>

      {/* Brand Filter */}
      <div className="space-y-2">
        <label className="block text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Brand
        </label>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setSelectedBrand("")}
            className={`cursor-pointer rounded-lg px-2.5 py-1 text-left text-sm transition-colors ${
              selectedBrand === ""
                ? "bg-amber-500 font-semibold text-white"
                : "text-foreground hover:bg-muted/50"
            }`}
          >
            All Brands
          </button>
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`cursor-pointer rounded-lg px-2.5 py-1 text-left text-sm transition-colors ${
                selectedBrand === brand
                  ? "bg-amber-500 font-semibold text-white"
                  : "text-foreground hover:bg-muted/50"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By Filter */}
      <div className="space-y-2 border-t border-border/60 pt-2">
        <label
          htmlFor="sort-select"
          className="flex items-center gap-1 text-xs font-bold tracking-wider text-muted-foreground uppercase"
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-amber-500" /> Sort By
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full rounded-lg border border-border bg-background p-2 text-sm focus:border-amber-500 focus:outline-none"
        >
          <option value="popular">Most Popular</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">Newest Arrivals</option>
        </select>
      </div>

      {/* Clear Filters */}
      <Button
        variant="ghost"
        onClick={() => {
          setSearchQuery("")
          setSelectedCategory("")
          if (setSelectedCollection) {
            setSelectedCollection("")
          }
          setPriceRange(50000)
          setSelectedBrand("")
          setSortBy("popular")
        }}
        className="w-full cursor-pointer border border-border text-xs text-muted-foreground hover:bg-muted/30 hover:text-foreground"
      >
        Clear All Filters
      </Button>
    </div>
  )
}
