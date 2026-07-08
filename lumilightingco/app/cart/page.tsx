"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  Percent,
} from "lucide-react"
import { useCart } from "@/context/CartContext"
import { getShippingOptionsAction } from "@/app/actions/cart"

export default function CartPage() {
  const { cart, isLoading, updateLineItem, removeFromCart } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [discountPercent, setDiscountPercent] = useState(0)
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [fetchedShipping, setFetchedShipping] = useState<number | null>(null)

  // Derive estimated shipping from cart and fetched options synchronously during render
  const estimatedShipping =
    cart && cart.items.length > 0
      ? cart.shipping_total > 0
        ? cart.shipping_total / 100
        : fetchedShipping
      : null

  const updateQty = async (id: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta
    if (newQty > 0) {
      await updateLineItem(id, newQty)
    }
  }

  const deleteItem = async (id: string) => {
    await removeFromCart(id)
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (promoCode.toUpperCase() === "LUMI20") {
      setDiscountPercent(20)
      setAppliedPromo("LUMI20")
      setPromoCode("")
    } else {
      alert('Invalid promo code! Try "LUMI20" for 20% off.')
    }
  }

  useEffect(() => {
    if (!cart || cart.items.length === 0 || cart.shipping_total > 0) {
      return
    }

    // Fetch shipping options dynamically from Medusa
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

  const totals = React.useMemo(() => {
    if (!cart) {
      return { subtotal: 0, discount: 0, shipping: 0, total: 0 }
    }
    const subtotal = cart.subtotal / 100
    const discount = subtotal * (discountPercent / 100)
    const shipping = estimatedShipping || 0
    const total = subtotal - discount + shipping
    return { subtotal, discount, shipping, total }
  }, [cart, discountPercent, estimatedShipping])

  const cartItems = cart?.items || []

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 flex items-center gap-2 text-3xl font-extrabold tracking-tight">
          <ShoppingBag className="h-7 w-7 text-amber-500" />
          Your Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-border bg-muted/20 py-20 text-center">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="text-xl font-bold">Your cart is empty</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add items to get started with your showroom order.
            </p>
            <Link href="/shop" className="mt-6 inline-block">
              <Button className="cursor-pointer bg-amber-500 font-bold text-white hover:bg-amber-600">
                Return to Shop
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            {/* Items Column */}
            <div className="space-y-4 lg:col-span-2">
              {cartItems.map((item) => {
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
                    className="flex flex-col items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 text-card-foreground shadow-sm sm:flex-row"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                      <Image
                        src={thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-grow space-y-1 text-center sm:text-left">
                      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        {item.variant?.title || "Default"}
                      </span>
                      <h3 className="line-clamp-2 max-w-md text-sm leading-snug font-bold">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Unit price: KES {itemPrice.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity Actions */}
                    <div className="flex shrink-0 items-center overflow-hidden rounded-lg border border-border bg-background">
                      <button
                        onClick={() => updateQty(item.id, item.quantity, -1)}
                        disabled={isLoading}
                        className="cursor-pointer p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3.5 text-sm font-bold text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity, 1)}
                        disabled={isLoading}
                        className="cursor-pointer p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Price / Delete */}
                    <div className="flex w-full shrink-0 items-center justify-between gap-6 border-t border-border/40 pt-3 sm:w-auto sm:justify-end sm:border-0 sm:pt-0">
                      <span className="text-sm font-extrabold text-foreground">
                        KES {(itemPrice * item.quantity).toLocaleString()}
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        disabled={isLoading}
                        className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
                        title="Remove product"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary Column */}
            <div className="space-y-6 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm lg:col-span-1">
              <h2 className="border-b border-border pb-3 text-xl font-bold">
                Order Summary
              </h2>

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
                <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs font-medium text-emerald-600">
                  <span className="flex items-center gap-1.5">
                    <Percent className="h-3.5 w-3.5" /> Promo &ldquo;
                    {appliedPromo}&rdquo; applied!
                  </span>
                  <button
                    onClick={() => {
                      setDiscountPercent(0)
                      setAppliedPromo(null)
                    }}
                    className="ml-2 cursor-pointer text-[10px] font-bold text-emerald-700 underline hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Cost list */}
              <div className="space-y-3 border-t border-border/40 pt-4 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">
                    KES {totals.subtotal.toLocaleString()}
                  </span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount (20%)</span>
                    <span>- KES {totals.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Estimation</span>
                  <span className="font-semibold text-foreground">
                    {estimatedShipping === null ? (
                      <span className="text-xs font-normal text-slate-400">
                        Calculated at checkout
                      </span>
                    ) : totals.shipping === 0 ? (
                      <span className="text-xs font-bold text-emerald-600 uppercase">
                        Free Delivery
                      </span>
                    ) : (
                      `KES ${totals.shipping.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-4 text-base font-extrabold">
                  <span>Order Total</span>
                  <span className="text-lg text-amber-500">
                    KES {totals.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Proceed */}
              <Link href="/checkout">
                <Button className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600">
                  Proceed to Checkout <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
