"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface WishlistItem {
  id: string
  title: string
  handle: string
  price: number
  thumbnail: string
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  isInWishlist: (id: string) => boolean
  toggleWishlist: (item: WishlistItem) => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])

  // Load wishlist from localStorage on mount (prevents SSR hydration warnings)
  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      if (!active) return
      try {
        const saved = localStorage.getItem("lumi_wishlist")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            // Filter out any mock products from testing
            const clean = parsed.filter(
              (item) =>
                item &&
                item.id !== "prod-1" &&
                item.id !== "prod-2" &&
                item.id !== "prod-3" &&
                item.id !== "prod-4" &&
                !item.id.startsWith("mock-") &&
                !item.id.startsWith("fallback-")
            )
            setWishlist(clean)
            if (clean.length !== parsed.length) {
              localStorage.setItem("lumi_wishlist", JSON.stringify(clean))
            }
          }
        }
      } catch (e) {
        console.error("Failed to load wishlist from localStorage:", e)
      }
    }, 0)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [])

  // Helper to save to localStorage and update state
  const saveWishlist = (items: WishlistItem[]) => {
    setWishlist(items)
    try {
      localStorage.setItem("lumi_wishlist", JSON.stringify(items))
      // Dispatch a custom event to sync tabs/components if needed
      window.dispatchEvent(new Event("lumi_wishlist_updated"))
    } catch (e) {
      console.error("Failed to save wishlist to localStorage:", e)
    }
  }

  const addToWishlist = (item: WishlistItem) => {
    if (wishlist.some((i) => i.id === item.id)) return
    const updated = [...wishlist, item]
    saveWishlist(updated)
  }

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter((i) => i.id !== id)
    saveWishlist(updated)
  }

  const isInWishlist = (id: string) => {
    return wishlist.some((i) => i.id === id)
  }

  const toggleWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id)
    } else {
      addToWishlist(item)
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
