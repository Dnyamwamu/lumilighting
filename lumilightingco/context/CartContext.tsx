"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { Cart } from "@/lib/medusa"
import {
  retrieveCart,
  addToCartAction,
  updateLineItemAction,
  removeFromCartAction,
} from "@/app/actions/cart"

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  isCartOpen: boolean
  setIsCartOpen: (isOpen: boolean) => void
  addToCart: (variantId: string, quantity?: number) => Promise<void>
  updateLineItem: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)

  // Initialize or fetch cart on mount
  useEffect(() => {
    async function initCart() {
      try {
        const existingCart = await retrieveCart()
        setCart(existingCart)
      } catch (error) {
        console.error("Failed to initialize cart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initCart()
  }, [])

  const refreshCart = async () => {
    try {
      const updatedCart = await retrieveCart()
      setCart(updatedCart)
    } catch (error) {
      console.error("Failed to refresh cart:", error)
    }
  }

  const addToCart = async (variantId: string, quantity = 1) => {
    setIsLoading(true)
    try {
      const result = await addToCartAction(variantId, quantity)
      if (!result.success || !result.cart) {
        throw new Error(result.error || "Cart not updated")
      }
      setCart(result.cart)
      setIsCartOpen(true) // Open the cart drawer automatically when item is added!
    } catch (error) {
      console.error("Failed to add item to cart:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateLineItem = async (itemId: string, quantity: number) => {
    setIsLoading(true)
    try {
      const result = await updateLineItemAction(itemId, quantity)
      if (!result.success || !result.cart) {
        throw new Error(result.error || "Cart not updated")
      }
      setCart(result.cart)
    } catch (error) {
      console.error("Failed to update cart item quantity:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = async (itemId: string) => {
    setIsLoading(true)
    try {
      const result = await removeFromCartAction(itemId)
      if (!result.success || !result.cart) {
        throw new Error(result.error || "Cart not updated")
      }
      setCart(result.cart)
    } catch (error) {
      console.error("Failed to remove item from cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateLineItem,
        removeFromCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
