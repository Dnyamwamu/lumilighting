"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { getShippingOptionsAction } from "@/app/actions/cart"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, isLoading, updateLineItem, removeFromCart } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [discountPercent, setDiscountPercent] = useState(0) // We'll keep local discount logic or delegate to backend if applied
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [fetchedShipping, setFetchedShipping] = useState<number | null>(null)

  // Derive estimated shipping from cart and fetched options synchronously during render
  const estimatedShipping =
    cart && cart.items.length > 0
      ? cart.shipping_total > 0
        ? cart.shipping_total / 100
        : fetchedShipping
      : null

  const updateQuantity = async (
    id: string,
    currentQty: number,
    delta: number
  ) => {
    const newQty = currentQty + delta
    if (newQty > 0) {
      await updateLineItem(id, newQty)
    }
  }

  const removeItem = async (id: string) => {
    await removeFromCart(id)
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (promoCode.toUpperCase() === "LUMI20") {
      setDiscountPercent(20)
      setAppliedPromo("LUMI20")
      setPromoCode("")
      toast('Promo code "LUMI20" applied successfully!', { type: "success" })
    } else {
      alert('Invalid promo code! Try "LUMI20" for 20% off.')
    }
  }

  useEffect(() => {
    if (!cart || cart.items.length === 0 || cart.shipping_total > 0) {
      return
    }

    // Otherwise, fetch shipping options dynamically from Medusa
    getShippingOptionsAction().then((res) => {
      if (
        res.success &&
        res.shippingOptions &&
        res.shippingOptions.length > 0
      ) {
        // Find the cheapest option (e.g. Standard Delivery)
        const cheapest = Math.min(
          ...res.shippingOptions.map((o: { amount?: number }) => o.amount || 0)
        )
        setFetchedShipping(cheapest / 100)
      } else {
        setFetchedShipping(null)
      }
    })
  }, [cart])

  // Medusa stores amounts in cents (base units), so we divide by 100 to show in standard KES currency.
  const totals = React.useMemo(() => {
    if (!cart) {
      return { subtotal: 0, discount: 0, shipping: 0, total: 0 }
    }
    const subtotal = cart.subtotal / 100
    const discount = subtotal * (discountPercent / 100)
    const shipping = estimatedShipping || 0
    const total = subtotal - discount + shipping

    return {
      subtotal,
      discount,
      shipping,
      total,
    }
  }, [cart, discountPercent, estimatedShipping])

  if (!isOpen) return null

  const cartItems = cart?.items || []
  const totalItemsCount = cartItems.reduce((c, i) => c + i.quantity, 0)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-in bg-black/60 backdrop-blur-xs transition-opacity duration-300 fade-in"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="flex h-full w-screen max-w-md animate-in flex-col border-l border-border bg-background shadow-2xl duration-350 slide-in-from-right">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <ShoppingBag className="h-5 w-5 text-amber-500" />
              Shopping Cart ({totalItemsCount})
            </h2>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="space-y-4 py-12 text-center">
                <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/30" />
                <div>
                  <h3 className="text-base font-semibold">
                    Your cart is empty
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Explore our showroom to add items.
                  </p>
                </div>
                <Link href="/shop" onClick={onClose}>
                  <Button className="bg-primary text-white hover:bg-primary/95">
                    Shop Now
                  </Button>
                </Link>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemPrice = item.unit_price / 100
                const variantProduct = (
                  item.variant as {
                    product?: {
                      thumbnail?: string
                      images?: Array<{ url: string }>
                    }
                  }
                )?.product
                const thumbnail =
                  item.thumbnail ||
                  variantProduct?.thumbnail ||
                  variantProduct?.images?.[0]?.url ||
                  "/images/placeholder-light.jpg"
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-border/50 bg-muted/20 p-3 transition-all hover:border-amber-500/20"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                      <Image
                        src={thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                          {item.variant?.title || "Default"}
                        </span>
                        <h4 className="mt-0.5 line-clamp-2 text-xs leading-tight font-semibold text-foreground">
                          {item.title}
                        </h4>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Quantity Toggles */}
                        <div className="flex items-center overflow-hidden rounded-lg border border-border bg-background">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity, -1)
                            }
                            disabled={isLoading}
                            className="cursor-pointer p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity, 1)
                            }
                            disabled={isLoading}
                            className="cursor-pointer p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Pricing / Remove */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-extrabold text-foreground">
                            KES {(itemPrice * item.quantity).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                            className="cursor-pointer p-1 text-muted-foreground transition-colors hover:text-red-500 disabled:opacity-50"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Checkout Footer Details */}
          {cartItems.length > 0 && (
            <div className="shrink-0 space-y-4 border-t border-border bg-muted/10 p-6">
              {/* Promo input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. LUMI20)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background p-2.5 pl-8 text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <Tag className="absolute top-3 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer bg-slate-900 text-xs text-white hover:bg-slate-800"
                >
                  Apply
                </Button>
              </form>

              {appliedPromo && (
                <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-xs font-medium text-emerald-600">
                  <span>Promo Code &ldquo;{appliedPromo}&rdquo; applied!</span>
                  <button
                    onClick={() => {
                      setDiscountPercent(0)
                      setAppliedPromo(null)
                    }}
                    className="ml-2 cursor-pointer font-bold text-emerald-700 underline hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Cost Summary */}
              <div className="space-y-2 border-t border-border/40 pt-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">
                    KES {totals.subtotal.toLocaleString()}
                  </span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount (20%)</span>
                    <span>- KES {totals.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">
                    {estimatedShipping === null ? (
                      <span className="text-xs font-normal text-slate-400">
                        Calculated at checkout
                      </span>
                    ) : totals.shipping === 0 ? (
                      <span className="text-[11px] font-bold text-emerald-600 uppercase">
                        Free
                      </span>
                    ) : (
                      `KES ${totals.shipping.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-3 text-base font-extrabold">
                  <span>Total Est.</span>
                  <span className="text-amber-500">
                    KES {totals.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action checkout button */}
              <Link href="/checkout" onClick={onClose}>
                <Button className="mt-3 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600">
                  Proceed to Checkout <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Simple toast helper to avoid importing react-toastify just for a simple notification
function toast(message: string, options?: { type?: "success" | "error" }) {
  console.log(`[Toast ${options?.type || "info"}]: ${message}`)
}
