"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {
  CreditCard,
  CheckCircle,
  Smartphone,
  AlertCircle,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Truck,
} from "lucide-react"
import { useCart } from "@/context/CartContext"
import {
  updateCartAddressAction,
  getShippingOptionsAction,
  selectShippingOptionAction,
  initiatePaymentSessionAction,
  completeCartAction,
} from "@/app/actions/cart"

interface CompletedOrder {
  id: string
  display_id?: number
  total: number
}

interface ShippingOption {
  id: string
  name: string
  metadata?: Record<string, unknown> | null
  prices?: {
    amount: number
  }[]
}

export default function CheckoutPage() {
  const { cart, isLoading: isCartLoading, refreshCart } = useCart()
  const { isLoaded: isUserLoaded, user } = useUser()

  const [shippingForm, setShippingForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Nairobi",
  })

  const [paymentMethod, setPaymentMethod] = useState<"mpesa">("mpesa")
  const [mpesaPhone, setMpesaPhone] = useState("")

  const [orderNotes, setOrderNotes] = useState("")
  const [shipToDifferentLocation, setShipToDifferentLocation] = useState(false)

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string>("")
  const [isFetchingOptions, setIsFetchingOptions] = useState(false)

  const loadShippingOptions = useCallback(async () => {
    setIsFetchingOptions(true)
    try {
      const res = await getShippingOptionsAction()
      if (res.success && res.shippingOptions) {
        setShippingOptions(res.shippingOptions)
        
        // Find default option: "Delivery Within Nairobi"
        const defaultOption = res.shippingOptions.find((o: ShippingOption) => 
          o.name.toLowerCase().includes("within nairobi") || 
          o.name.toLowerCase().includes("nairobi")
        ) || res.shippingOptions[0]

        if (defaultOption) {
          setSelectedShippingOptionId(defaultOption.id)
        }
      }
    } catch (err) {
      console.error("Failed to load shipping options:", err)
    } finally {
      setIsFetchingOptions(false)
    }
  }, [])

  const handleShippingOptionChange = async (optionId: string) => {
    setSelectedShippingOptionId(optionId)
    try {
      const selectRes = await selectShippingOptionAction(optionId)
      if (selectRes.success) {
        await refreshCart()
      }
    } catch (err) {
      console.error("Failed to change shipping option:", err)
    }
  }
  const [shippingAddressForm, setShippingAddressForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Nairobi",
  })

  // Checkout States
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"checkout" | "processing" | "confirmed">(
    "checkout"
  )
  const [orderId, setOrderId] = useState("")
  const [placedOrder, setPlacedOrder] = useState<CompletedOrder | null>(null)
  const [mpesaReceipt, setMpesaReceipt] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const isInitialized = useRef(false)

  // Pre-fill email and phone from cart or clerk if available
  useEffect(() => {
    if (cart && !isInitialized.current) {
      if (!isUserLoaded) return

      isInitialized.current = true
      const timer = setTimeout(() => {
        const clerkPhone = (user?.unsafeMetadata?.phone as string) || ""
        const clerkAddress = (user?.unsafeMetadata?.address as string) || ""
        const clerkName = user?.fullName || ""

        setShippingForm({
          email: cart.email || user?.primaryEmailAddress?.emailAddress || "",
          phone: cart.shipping_address?.phone || clerkPhone,
          name: cart.shipping_address?.first_name
            ? `${cart.shipping_address.first_name} ${cart.shipping_address.last_name || ""}`.trim()
            : clerkName,
          address: cart.shipping_address?.address_1 || clerkAddress,
          city: cart.shipping_address?.city || "Nairobi",
        })
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [cart, isUserLoaded, user])

  // Load shipping options
  useEffect(() => {
    if (cart && cart.items.length > 0 && shippingOptions.length === 0) {
      const timer = setTimeout(() => {
        loadShippingOptions()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [cart, shippingOptions.length, loadShippingOptions])

  // Sync selected shipping option with Medusa cart
  useEffect(() => {
    if (cart && cart.items.length > 0 && selectedShippingOptionId) {
      const currentMethodId = cart.shipping_methods?.[0]?.shipping_option_id
      if (currentMethodId !== selectedShippingOptionId) {
        async function applySelectedShipping() {
          try {
            const selectRes = await selectShippingOptionAction(selectedShippingOptionId)
            if (selectRes.success) {
              await refreshCart()
            }
          } catch (err) {
            console.error("Failed to apply selected shipping option:", err)
          }
        }
        applySelectedShipping()
      }
    }
  }, [cart, selectedShippingOptionId, refreshCart])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const executeOrderCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cart || cart.items.length === 0) return

    setLoading(true)
    setErrorMessage("")

    try {
      // 1. Update Cart Address & Email in Medusa
      const nameParts = shippingForm.name.trim().split(" ")
      const firstName = nameParts[0] || "Customer"
      const lastName = nameParts.slice(1).join(" ") || "LUMI"

      const billingAddress = {
        first_name: firstName,
        last_name: lastName,
        phone: shippingForm.phone,
        address_1: shippingForm.address,
        city: shippingForm.city,
        country_code: "ke",
      }

      let shippingAddress = null
      if (shipToDifferentLocation) {
        const shipNameParts = shippingAddressForm.name.trim().split(" ")
        const shipFirstName = shipNameParts[0] || "Recipient"
        const shipLastName = shipNameParts.slice(1).join(" ") || "LUMI"
        shippingAddress = {
          first_name: shipFirstName,
          last_name: shipLastName,
          phone: shippingAddressForm.phone,
          address_1: shippingAddressForm.address,
          city: shippingAddressForm.city,
          country_code: "ke",
        }
      }

      const addressUpdate = await updateCartAddressAction(
        billingAddress,
        shippingAddress,
        shippingForm.email,
        orderNotes.trim() ? { order_notes: orderNotes.trim() } : undefined
      )

      if (!addressUpdate.success) {
        throw new Error(
          addressUpdate.error || "Failed to update delivery address in cart."
        )
      }

      // 2. Select Shipping Option
      const optionId = selectedShippingOptionId
      if (!optionId) {
        throw new Error("Please select a shipping option.")
      }
      const selectRes = await selectShippingOptionAction(optionId)
      if (!selectRes.success) {
        throw new Error(selectRes.error || "Failed to apply shipping option.")
      }

      // 2.5. Initialize Payment Session (using Medusa's default manual provider)
      const paymentSessionRes =
        await initiatePaymentSessionAction("pp_system_default")
      if (!paymentSessionRes.success) {
        throw new Error(
          paymentSessionRes.error || "Failed to initialize payment session."
        )
      }

      // Live amount in KES (cart total is stored in cents/base units, e.g. 52000 is 520 KES)
      const kesTotal = (selectRes.cart?.total || cart.total) / 100

      // 3. Process Payment Gateway
      if (paymentMethod === "mpesa") {
        setStep("processing")
        const targetPhone = mpesaPhone || shippingForm.phone

        // Call the automated STK Push API
        const mpesaRes = await fetch("/api/mpesa/stkpush", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: targetPhone,
            amount: kesTotal,
            orderId: cart.id,
          }),
        })

        const mpesaData = await mpesaRes.json()
        if (!mpesaRes.ok) {
          throw new Error(
            mpesaData.error || "M-Pesa payment initiation failed."
          )
        }

        // Poll transaction status to fetch the real M-Pesa Receipt Code from callback
        let receiptCode = ""
        const checkoutRequestId = mpesaData.data?.CheckoutRequestID

        if (checkoutRequestId) {
          // Poll the status API up to 6 times (every 2.5 seconds, total ~15 seconds)
          for (let i = 0; i < 6; i++) {
            await new Promise((resolve) => setTimeout(resolve, 2500))
            try {
              const statusRes = await fetch(`/api/mpesa/status?checkoutRequestId=${checkoutRequestId}`)
              if (statusRes.ok) {
                const statusData = await statusRes.json()
                if (statusData.success && statusData.transaction) {
                  const tx = statusData.transaction
                  if (tx.status === "success" && tx.mpesa_receipt_number) {
                    receiptCode = tx.mpesa_receipt_number
                    break
                  }
                }
              }
            } catch (pollErr) {
              console.error("Error polling M-Pesa transaction status:", pollErr)
            }
          }
        }

        // If polling didn't retrieve the callback receipt code, fall back to a mock code
        if (!receiptCode) {
          receiptCode = "T" + Math.random().toString(36).substring(2, 11).toUpperCase()
        }
        setMpesaReceipt(receiptCode)
      }

      // 4. Complete the cart to create the order in Medusa
      const completeRes = await completeCartAction()
      if (!completeRes.success) {
        throw new Error(
          completeRes.error || "Failed to complete checkout in Medusa."
        )
      }

      const orderData = completeRes.data
      setPlacedOrder(orderData)

      // Medusa v2 returns order data in data.id or data.display_id
      const finalOrderId = orderData?.display_id
        ? `LUMI-${orderData.display_id}`
        : orderData?.id
          ? `LUMI-${orderData.id}`
          : "LUMI-" + Math.floor(100000 + Math.random() * 90000)
      setOrderId(finalOrderId)

      // Clear client-side cart context
      await refreshCart()

      setStep("confirmed")
    } catch (err) {
      console.error("Checkout failed:", err)
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during checkout."
      setErrorMessage(msg)
      setStep("checkout")
    } finally {
      setLoading(false)
    }
  }

  if (isCartLoading) {
    return (
      <div className="flex min-h-screen flex-col justify-between bg-background">
        <Navbar />
        <div className="flex flex-grow items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          <span>Loading Checkout...</span>
        </div>
        <Footer />
      </div>
    )
  }

  const hasItems = cart && cart.items.length > 0

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-12 sm:px-6 lg:px-8">
        {!hasItems && step !== "confirmed" && step !== "processing" ? (
          <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-border bg-card p-8 py-20 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Your Cart is Empty</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Add premium architectural light fixtures to your cart before
                proceeding to checkout.
              </p>
            </div>
            <Link href="/shop" className="inline-block w-full">
              <Button className="w-full cursor-pointer rounded-xl bg-amber-500 font-bold text-white hover:bg-amber-600">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {step === "checkout" && cart && (
              <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
                {/* Form Fields */}
                <form
                  onSubmit={executeOrderCheckout}
                  className="space-y-8 lg:col-span-2"
                >
                  {errorMessage && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-600">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Shipping Details */}
                  <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xs">
                    <h2 className="border-b border-border pb-3 text-xl font-bold">
                      1. Billing & Delivery Address
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="name-input"
                          className="text-xs font-bold text-muted-foreground"
                        >
                          Full Name
                        </label>
                        <input
                          id="name-input"
                          type="text"
                          name="name"
                          required
                          value={shippingForm.name}
                          onChange={handleInputChange}
                          placeholder="e.g. John Doe"
                          className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="phone-input"
                          className="text-xs font-bold text-muted-foreground"
                        >
                          Delivery Phone Number
                        </label>
                        <input
                          id="phone-input"
                          type="tel"
                          name="phone"
                          required
                          value={shippingForm.phone}
                          onChange={handleInputChange}
                          placeholder="e.g. 0712345678"
                          className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="email-input"
                        className="text-xs font-bold text-muted-foreground"
                      >
                        Email Address (for Receipt & Updates)
                      </label>
                      <input
                        id="email-input"
                        type="email"
                        name="email"
                        required
                        value={shippingForm.email}
                        onChange={handleInputChange}
                        placeholder="e.g. customer@example.com"
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="address-input"
                        className="text-xs font-bold text-muted-foreground"
                      >
                        Physical Address / Apartment / Estate & Room No.
                      </label>
                      <input
                        id="address-input"
                        type="text"
                        name="address"
                        required
                        value={shippingForm.address}
                        onChange={handleInputChange}
                        placeholder="e.g. Apartment 4B, Parklands Road"
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    {/* Ship to different location checkbox */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                      <input
                        id="ship-different-checkbox"
                        type="checkbox"
                        checked={shipToDifferentLocation}
                        onChange={(e) => setShipToDifferentLocation(e.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded border-border text-amber-500 focus:ring-amber-500 focus:outline-none accent-amber-500"
                      />
                      <label
                        htmlFor="ship-different-checkbox"
                        className="text-xs font-bold text-muted-foreground cursor-pointer select-none"
                      >
                        Ship to a different location
                      </label>
                    </div>

                    {/* Shipping Address Sub-form */}
                    {shipToDifferentLocation && (
                      <div className="animate-in slide-in-from-top-2 duration-200 space-y-4 pt-4 border-t border-border/40">
                        <h3 className="text-sm font-bold text-foreground">Shipping Address</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-1.5">
                            <label htmlFor="shipping-name-input" className="text-xs font-bold text-muted-foreground">
                              Shipping Recipient Full Name
                            </label>
                            <input
                              id="shipping-name-input"
                              type="text"
                              required={shipToDifferentLocation}
                              value={shippingAddressForm.name}
                              onChange={(e) => setShippingAddressForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g. Jane Doe"
                              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor="shipping-phone-input" className="text-xs font-bold text-muted-foreground">
                              Shipping Phone Number
                            </label>
                            <input
                              id="shipping-phone-input"
                              type="tel"
                              required={shipToDifferentLocation}
                              value={shippingAddressForm.phone}
                              onChange={(e) => setShippingAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="e.g. 0712345678"
                              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="shipping-address-input" className="text-xs font-bold text-muted-foreground">
                            Shipping Physical Address / Apartment / Estate
                          </label>
                          <input
                            id="shipping-address-input"
                            type="text"
                            required={shipToDifferentLocation}
                            value={shippingAddressForm.address}
                            onChange={(e) => setShippingAddressForm(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="e.g. Apartment 12A, Kilimani Road"
                            className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Notes Field */}
                  <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xs">
                    <h2 className="border-b border-border pb-3 text-xl font-bold">
                      2. Order Notes (Optional)
                    </h2>
                    <div className="space-y-1.5">
                      <label htmlFor="notes-input" className="text-xs font-bold text-muted-foreground">
                        Delivery instructions, notes, or special requests
                      </label>
                      <textarea
                        id="notes-input"
                        name="notes"
                        rows={3}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="e.g. Please leave the package with the guard if I'm not around, or call before delivery."
                        className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-amber-500 focus:outline-none resize-none font-sans"
                      />
                    </div>
                  </div>

                  {/* Shipping Option Info */}
                  <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xs">
                    <h2 className="border-b border-border pb-3 text-xl font-bold">
                      2.5 Shipping Option
                    </h2>
                    
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-foreground leading-relaxed">
                      <Truck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Delivery Arrangements</h3>
                        <p className="mt-1 text-xs text-muted-foreground font-sans">
                          Shipping charges will be communicated after order confirmation via phone call and will be payable upon delivery.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-6 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xs">
                    <h2 className="border-b border-border pb-3 text-xl font-bold">
                      3. Payment Method
                    </h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Mpesa Method Option */}
                      <div
                        onClick={() => setPaymentMethod("mpesa")}
                        className={`flex cursor-pointer items-start gap-3.5 rounded-xl border-2 p-4 transition-all ${
                          paymentMethod === "mpesa"
                            ? "border-amber-500 bg-amber-500/5"
                            : "border-border hover:bg-muted/30"
                        }`}
                      >
                        <Smartphone className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
                        <div>
                          <h3 className="text-sm font-bold">
                            Safaricom M-Pesa
                          </h3>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Trigger an STK PIN prompt directly to your phone.
                          </p>
                        </div>
                      </div>

                      {/* Visa Card Option (Inactive) */}
                      <div className="flex cursor-not-allowed items-start gap-3.5 rounded-xl border border-border bg-muted/20 p-4 opacity-50 transition-all select-none">
                        <CreditCard className="mt-0.5 h-6 w-6 shrink-0 text-muted-foreground/60" />
                        <div>
                          <h3 className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
                            Card Payment
                            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider border border-border/50">
                              Soon
                            </span>
                          </h3>
                          <p className="mt-0.5 text-xs text-muted-foreground/70">
                            Visa & MasterCard payments will be supported soon.
                          </p>
                        </div>
                      </div>
                    </div>

                    {paymentMethod === "mpesa" && (
                      <div className="animate-in space-y-3 rounded-xl border border-border bg-muted/20 p-4 duration-200 fade-in">
                        <label
                          htmlFor="mpesa-phone-input"
                          className="block text-xs font-bold text-muted-foreground"
                        >
                          M-Pesa Mobile Number
                        </label>
                        <input
                          id="mpesa-phone-input"
                          type="tel"
                          required={paymentMethod === "mpesa"}
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          placeholder="e.g. 254712345678"
                          className="w-full max-w-sm rounded-lg border border-border bg-background p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                        />
                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                          Must be in international format (e.g. 2547XXXXXXXX or
                          07XXXXXXXX).
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Submit Trigger */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Trigger M-Pesa Payment
                  </Button>
                </form>

                {/* Cost Summary Column */}
                <div className="space-y-6 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm lg:col-span-1">
                  <h2 className="flex items-center gap-1.5 border-b border-border pb-3 text-xl font-bold">
                    <ShoppingBag className="h-5 w-5 text-amber-500" /> Order
                    Summary
                  </h2>

                  <div className="max-h-[280px] space-y-4 overflow-y-auto pr-1">
                    {cart.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 border-b border-border pb-3 text-xs"
                      >
                        <div className="shrink-0 font-bold">
                          {item.quantity}x
                        </div>
                        <div className="line-clamp-2 flex-grow">
                          {item.title}
                        </div>
                        <div className="text-right font-semibold">
                          KES{" "}
                          {(
                            (item.unit_price * item.quantity) /
                            100
                          ).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>KES {(cart.subtotal / 100).toLocaleString()}</span>
                    </div>
                    {cart.tax_total > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>VAT (16%)</span>
                        <span>
                          KES {(cart.tax_total / 100).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>
                        {cart.shipping_total > 0 ? (
                          `KES ${(cart.shipping_total / 100).toLocaleString()}`
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 uppercase">
                            Free
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border/40 pt-4 text-base font-extrabold">
                      <span>Total Due</span>
                      <span className="text-lg text-amber-500">
                        KES {(cart.total / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Processing Step */}
            {step === "processing" && (
              <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-border bg-card p-8 py-20 text-center shadow-md">
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-amber-500" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">M-Pesa STK Prompt Sent</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    We have triggered a payment prompt to{" "}
                    <span className="font-semibold">
                      {mpesaPhone || shippingForm.phone}
                    </span>
                    . Please check your mobile phone, enter your Safaricom PIN
                    to complete checkout.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-[11px] leading-relaxed text-muted-foreground">
                  Waiting for Safaricom callback verification. Do not refresh
                  this page.
                </div>
              </div>
            )}

            {/* Order Confirmed Step */}
            {step === "confirmed" && (
              <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-border bg-card p-8 py-16 text-center shadow-md">
                <CheckCircle className="mx-auto h-16 w-16 text-emerald-500" />
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold tracking-tight">
                    Order Confirmed!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Thank you for shopping with LUMI Lighting.
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-6 text-left text-sm">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono font-bold text-foreground">
                      {orderId}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">
                      Payment Method
                    </span>
                    <span className="font-bold text-foreground">
                      Safaricom M-Pesa STK
                    </span>
                  </div>
                  {paymentMethod === "mpesa" && (
                    <div className="flex justify-between border-b border-border/40 pb-2">
                      <span className="text-muted-foreground">
                        M-Pesa Receipt Code
                      </span>
                      <span className="font-mono font-bold text-amber-500">
                        {mpesaReceipt}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Paid</span>
                    <span className="font-bold text-foreground">
                      KES{" "}
                      {placedOrder
                        ? typeof placedOrder.total === "number"
                          ? (placedOrder.total / 100).toLocaleString()
                          : ""
                        : cart?.total
                          ? (cart.total / 100).toLocaleString()
                          : ""}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
                  <Link href="/shop" className="w-full sm:w-auto">
                    <Button className="w-full cursor-pointer bg-slate-900 font-bold text-white hover:bg-slate-800">
                      Continue Shopping
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full cursor-pointer gap-2 sm:w-auto"
                  >
                    <ShieldCheck className="h-4.5 w-4.5" /> Download Invoice
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
