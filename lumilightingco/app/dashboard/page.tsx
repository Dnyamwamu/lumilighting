"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { getCustomerOrdersAction } from "@/app/actions/cart"
import { useWishlist } from "@/context/WishlistContext"
import { useSearchParams, useRouter } from "next/navigation"
import { PUBLISHABLE_KEY } from "@/lib/medusa"
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  FileText,
  Eye,
  Plus,
  Trash2,
  Lock,
  ChevronRight,
  AlertCircle,
  Loader2,
  X,
  Info,
  CheckCircle,
} from "lucide-react"
import Image from "next/image"

interface Address {
  id: string
  name: string
  phone: string
  address: string
  city: string
}

interface OrderItem {
  title: string
  quantity: number
  unit_price: number
}

interface Order {
  id: string
  display_id?: number
  created_at: string
  total: number
  status: string
  payment_status?: string
  currency_code: string
  items: OrderItem[]
  shipping_address?: {
    id?: string
    first_name?: string
    last_name?: string
    phone?: string
    address_1?: string
    address_2?: string
    city?: string
    country_code?: string
  }
}

interface WishlistItem {
  id: string
  title: string
  handle: string
  price: number
  thumbnail: string
}

function DashboardContent() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as "profile" | "orders" | "addresses" | "wishlist" | null
  
  const activeTab = tabParam && ["profile", "orders", "addresses", "wishlist"].includes(tabParam)
    ? tabParam
    : "profile"

  const setActiveTab = (tab: "profile" | "orders" | "addresses" | "wishlist") => {
    router.push(`/dashboard?tab=${tab}`, { scroll: false })
  }

  // Dynamic states
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const { wishlist, removeFromWishlist } = useWishlist()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal & Info Banner states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showAddressInfo, setShowAddressInfo] = useState(false)

  // Profile editing states
  const [isEditing, setIsEditing] = useState(false)
  const [editFirstName, setEditFirstName] = useState("")
  const [editLastName, setEditLastName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState("")
  const [profileError, setProfileError] = useState("")

  const isProfileInitialized = useRef(false)

  // Sync state with Clerk user on load
  useEffect(() => {
    if (user && !isProfileInitialized.current) {
      isProfileInitialized.current = true
      const timer = setTimeout(() => {
        setEditFirstName(user.firstName || "")
        setEditLastName(user.lastName || "")
        setEditPhone((user.unsafeMetadata?.phone as string) || "")
        setEditAddress((user.unsafeMetadata?.address as string) || "")
        if (!user.firstName || !user.lastName) {
          setIsEditing(true)
        }
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSavingProfile(true)
    setProfileSuccess("")
    setProfileError("")

    try {
      await user.update({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        unsafeMetadata: {
          ...user.unsafeMetadata,
          phone: editPhone.trim(),
          address: editAddress.trim(),
        }
      })
      setProfileSuccess("Profile updated successfully!")
      setIsEditing(false)
    } catch (err: unknown) {
      console.error("Failed to update profile:", err)
      const message = err instanceof Error ? err.message : "Failed to update profile. Please try again."
      setProfileError(message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  useEffect(() => {
    if (!isLoaded) return

    let active = true

    const timer = setTimeout(() => {
      if (!active) return

      if (!isSignedIn || !user) {
        setLoading(false)
        return
      }

      const email = user.primaryEmailAddress?.emailAddress
      if (!email) {
        setLoading(false)
        return
      }

      async function loadDashboardData() {
        setLoading(true)
        setError(null)
        try {
          const res = await getCustomerOrdersAction(email as string)
          if (!active) return

          if (res.success && res.orders) {
            setOrders(res.orders)

            // Extract unique addresses from the customer's orders
            const extractedAddresses: Address[] = []
            res.orders.forEach((ord: Order) => {
              const addr = ord.shipping_address
              if (addr) {
                const formattedAddr = [addr.address_1, addr.address_2]
                  .filter(Boolean)
                  .join(", ")

                const name =
                  `${addr.first_name || ""} ${addr.last_name || ""}`.trim() ||
                  "Valued Customer"
                const city = addr.city || "Nairobi"

                // Filter out duplicates
                const isDuplicate = extractedAddresses.some(
                  (a) =>
                    a.address.toLowerCase() === formattedAddr.toLowerCase() &&
                    a.city.toLowerCase() === city.toLowerCase()
                )

                if (!isDuplicate) {
                  extractedAddresses.push({
                    id: addr.id || `addr-${ord.id}`,
                    name: name,
                    phone: addr.phone || "",
                    address: formattedAddr,
                    city: city,
                  })
                }
              }
            })
            setAddresses(extractedAddresses)
          } else {
            setError(res.error || "Failed to fetch your order history.")
          }
        } catch (err) {
          console.error("Failed to load dashboard data:", err)
          if (active) {
            setError(
              "An unexpected error occurred while contacting the servers."
            )
          }
        } finally {
          if (active) setLoading(false)
        }
      }

      loadDashboardData()
    }, 0)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [isLoaded, isSignedIn, user])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  const formatStatus = (status: string, paymentStatus?: string) => {
    if (paymentStatus === "captured") return "Paid"
    if (!status) return "Processing"
    switch (status.toLowerCase()) {
      case "pending":
      case "processing":
        return "Processing"
      case "completed":
      case "delivered":
        return "Delivered"
      case "paid":
        return "Paid"
      case "canceled":
      case "cancelled":
        return "Cancelled"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getStatusStyles = (status: string, paymentStatus?: string) => {
    const formatted = formatStatus(status, paymentStatus)
    switch (formatted) {
      case "Processing":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/25"
      case "Delivered":
      case "Paid":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"
      case "Cancelled":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/25"
      default:
        return "bg-slate-500/10 text-slate-500 border border-slate-500/25"
    }
  }

  const printInvoice = async (order: Order) => {
    try {
      const response = await fetch(`/api/medusa/store/orders/${order.id}/invoices`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_KEY,
        },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch invoice: ${response.statusText}`)
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `invoice-${order.display_id || order.id.substring(0, 8)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error downloading invoice PDF:", err)
      alert("Failed to download invoice PDF from the backend.")
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen flex-col justify-between bg-background">
        <Navbar />
        <div className="flex flex-grow flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="text-sm font-semibold text-muted-foreground">
            Loading User Profile...
          </span>
        </div>
        <Footer />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col justify-between bg-background">
        <Navbar />
        <div className="flex flex-grow flex-col items-center justify-center space-y-4 p-8 text-center">
          <AlertCircle className="h-16 w-16 text-amber-500" />
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Please sign in to access your LUMI Customer Dashboard.
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-12 sm:px-6 lg:px-8">
        {/* Banner/Header */}
        <div className="mb-8 flex flex-col items-center gap-6 border-b border-border pb-8 md:flex-row">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-amber-500 bg-muted">
            <Image
              src={
                user.imageUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
              }
              alt={user.fullName || "User"}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight">
              {user.fullName || "Valued Customer"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Logged in via:{" "}
              <span className="font-semibold text-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </span>
            </p>
          </div>
        </div>

        {/* Dashboard Tabs Layout */}
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-4">
          {/* Navigation Sidebar */}
          <div className="flex shrink-0 flex-col gap-1 rounded-xl border border-border bg-card p-3 text-card-foreground shadow-xs md:col-span-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <User className="h-4.5 w-4.5" /> Profile Settings
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold transition-all ${
                activeTab === "orders"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <ShoppingBag className="h-4.5 w-4.5" /> Order History
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold transition-all ${
                activeTab === "addresses"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <MapPin className="h-4.5 w-4.5" /> Shipping Addresses
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold transition-all ${
                activeTab === "wishlist"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Heart className="h-4.5 w-4.5" /> Saved Wishlist
            </button>
          </div>

          {/* Details Content Display */}
          <div className="min-h-[350px] rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xs md:col-span-3">
            {/* Loading Cover */}
            {loading && activeTab !== "profile" && activeTab !== "wishlist" ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <span className="text-xs text-muted-foreground">
                  Loading information...
                </span>
              </div>
            ) : (
              <>
                {/* PROFILE TAB */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h2 className="text-xl font-bold font-sans">Account Details</h2>
                      {!isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 cursor-pointer rounded-lg text-xs font-bold border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-500 transition-all duration-200"
                          onClick={() => {
                            setEditFirstName(user.firstName || "")
                            setEditLastName(user.lastName || "")
                            setEditPhone((user.unsafeMetadata?.phone as string) || "")
                            setEditAddress((user.unsafeMetadata?.address as string) || "")
                            setIsEditing(true)
                          }}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </div>

                    {profileSuccess && (
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-600 animate-in fade-in duration-200">
                        <CheckCircle className="h-4.5 w-4.5" />
                        <span>{profileSuccess}</span>
                      </div>
                    )}

                    {profileError && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-500 animate-in fade-in duration-200">
                        <AlertCircle className="h-4.5 w-4.5" />
                        <span>{profileError}</span>
                      </div>
                    )}

                    {(!user.firstName || !user.lastName) && !isEditing && (
                      <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-600">
                        <Info className="h-4.5 w-4.5 shrink-0" />
                        <span>
                          Please complete your profile details. Having your first name and last name helps us identify you and deliver your orders accurately.
                        </span>
                      </div>
                    )}

                    {isEditing ? (
                      <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
                          <div className="space-y-1.5">
                            <label htmlFor="profile-firstName-input" className="block text-xs font-bold text-muted-foreground uppercase">
                              First Name
                            </label>
                            <input
                              id="profile-firstName-input"
                              type="text"
                              required
                              value={editFirstName}
                              onChange={(e) => setEditFirstName(e.target.value)}
                              placeholder="e.g. John"
                              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-semibold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/35 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor="profile-lastName-input" className="block text-xs font-bold text-muted-foreground uppercase">
                              Last Name
                            </label>
                            <input
                              id="profile-lastName-input"
                              type="text"
                              required
                              value={editLastName}
                              onChange={(e) => setEditLastName(e.target.value)}
                              placeholder="e.g. Doe"
                              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-semibold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/35 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor="profile-phone-input" className="block text-xs font-bold text-muted-foreground uppercase">
                              Phone Number
                            </label>
                            <input
                              id="profile-phone-input"
                              type="tel"
                              required
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              placeholder="e.g. 0712345678"
                              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-semibold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/35 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label htmlFor="profile-address-input" className="block text-xs font-bold text-muted-foreground uppercase">
                              Physical Address / Apartment / Estate & Room No.
                            </label>
                            <input
                              id="profile-address-input"
                              type="text"
                              required
                              value={editAddress}
                              onChange={(e) => setEditAddress(e.target.value)}
                              placeholder="e.g. Apartment 4B, Parklands Road"
                              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs font-semibold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/35 transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <span className="block text-xs font-bold text-muted-foreground uppercase">
                              Email Address
                            </span>
                            <p className="rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs font-semibold text-muted-foreground cursor-not-allowed select-none">
                              {user.primaryEmailAddress?.emailAddress} (Managed via Clerk Auth)
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <span className="block text-xs font-bold text-muted-foreground uppercase">
                              Security
                            </span>
                            <p className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs font-semibold text-muted-foreground">
                              <Lock className="h-3.5 w-3.5 text-amber-500" />{" "}
                              Managed via Clerk Auth
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isSavingProfile}
                            className="cursor-pointer rounded-lg bg-amber-500 font-bold text-white hover:bg-amber-600 gap-1.5 transition-all duration-200 shadow-xs"
                          >
                            {isSavingProfile ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                          {(user.firstName && user.lastName) && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isSavingProfile}
                              className="cursor-pointer rounded-lg text-xs"
                              onClick={() => {
                                setProfileSuccess("")
                                setProfileError("")
                                setIsEditing(false)
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2">
                        <div className="space-y-1">
                          <span className="block text-xs font-bold text-muted-foreground uppercase">
                            First Name
                          </span>
                          <p className="rounded-lg border border-border/60 bg-muted/20 p-2.5 font-semibold">
                            {user.firstName || "Not Specified"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="block text-xs font-bold text-muted-foreground uppercase">
                            Last Name
                          </span>
                          <p className="rounded-lg border border-border/60 bg-muted/20 p-2.5 font-semibold">
                            {user.lastName || "Not Specified"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="block text-xs font-bold text-muted-foreground uppercase">
                            Phone Number
                          </span>
                          <p className="rounded-lg border border-border/60 bg-muted/20 p-2.5 font-semibold">
                            {(user.unsafeMetadata?.phone as string) || "Not Specified"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="block text-xs font-bold text-muted-foreground uppercase">
                            Physical Address / Apartment / Estate & Room No.
                          </span>
                          <p className="rounded-lg border border-border/60 bg-muted/20 p-2.5 font-semibold">
                            {(user.unsafeMetadata?.address as string) || "Not Specified"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="block text-xs font-bold text-muted-foreground uppercase">
                            Email Address
                          </span>
                          <p className="rounded-lg border border-border/60 bg-muted/20 p-2.5 font-semibold">
                            {user.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="block text-xs font-bold text-muted-foreground uppercase">
                            Security
                          </span>
                          <p className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs font-semibold text-muted-foreground">
                            <Lock className="h-3.5 w-3.5 text-amber-500" />{" "}
                            Managed via Clerk Auth
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === "orders" && (
                  <div className="space-y-6">
                    <h2 className="border-b border-border pb-3 text-xl font-bold">
                      Order Invoices
                    </h2>

                    {error && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-500">
                        <AlertCircle className="h-4.5 w-4.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    {orders.length === 0 ? (
                      <div className="space-y-3 py-12 text-center">
                        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="text-sm font-bold">No Orders Found</h3>
                        <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                          Your order history is currently empty. Make purchases
                          in the shop to see your orders here.
                        </p>
                        <Link href="/shop" className="inline-block pt-2">
                          <Button
                            size="sm"
                            className="cursor-pointer rounded-lg bg-amber-500 font-bold text-white hover:bg-amber-600"
                          >
                            Explore Products
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                          <thead>
                            <tr className="border-b border-border text-xs font-bold text-muted-foreground uppercase">
                              <th className="px-4 py-3">Order ID</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Total</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((ord) => (
                              <tr
                                key={ord.id}
                                className="border-b border-border/40 hover:bg-muted/10"
                              >
                                <td className="px-4 py-4 font-mono font-bold">
                                  LUMI-
                                  {ord.display_id ||
                                    ord.id.substring(0, 8).toUpperCase()}
                                </td>
                                <td className="px-4 py-4">
                                  {formatDate(ord.created_at)}
                                </td>
                                <td className="px-4 py-4 font-bold">
                                  KES {(ord.total / 100).toLocaleString()}
                                </td>
                                <td className="px-4 py-4">
                                  <span
                                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusStyles(ord.status, ord.payment_status)}`}
                                  >
                                    {formatStatus(ord.status, ord.payment_status)}
                                  </span>
                                </td>
                                <td className="flex items-center justify-end gap-2.5 px-4 py-4 text-right">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 cursor-pointer gap-1.5"
                                    onClick={() => setSelectedOrder(ord)}
                                  >
                                    <Eye className="h-4 w-4" /> View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 cursor-pointer gap-1.5"
                                    onClick={() => printInvoice(ord)}
                                  >
                                    <FileText className="h-4 w-4 text-amber-500" />{" "}
                                    Invoice
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* ADDRESSES TAB */}
                {activeTab === "addresses" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h2 className="text-xl font-bold">Shipping Address</h2>
                      <Button
                        size="sm"
                        className="cursor-pointer gap-1.5 bg-slate-900 text-xs text-white hover:bg-slate-800"
                        onClick={() => setShowAddressInfo(true)}
                      >
                        <Plus className="h-4 w-4" /> Add Address
                      </Button>
                    </div>

                    {showAddressInfo && (
                      <div className="flex animate-in items-start justify-between gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-600 duration-200 fade-in">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 shrink-0" />
                          <span>
                            Shipping addresses are populated and saved
                            automatically from your previous completed orders.
                            To add a new address, perform checkout with the new
                            details.
                          </span>
                        </div>
                        <button
                          onClick={() => setShowAddressInfo(false)}
                          className="cursor-pointer rounded-full p-0.5 hover:bg-amber-500/10"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {addresses.length === 0 ? (
                      <div className="space-y-2 py-12 text-center">
                        <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="text-sm font-bold">
                          No Addresses Saved
                        </h3>
                        <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                          No shipping addresses have been recorded yet.
                          Addresses are saved automatically during checkout.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className="relative space-y-3 rounded-xl border border-border bg-muted/10 p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-sm font-bold">
                                  {addr.name}
                                </h4>
                                <span className="text-[10px] font-bold text-amber-500 uppercase">
                                  {addr.city}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {addr.address}
                            </p>
                            {addr.phone && (
                              <p className="text-xs text-muted-foreground">
                                Phone:{" "}
                                <span className="font-semibold">
                                  {addr.phone}
                                </span>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* WISHLIST TAB */}
                {activeTab === "wishlist" && (
                  <div className="space-y-6">
                    <h2 className="border-b border-border pb-3 text-xl font-bold">
                      My Saved Products
                    </h2>

                    {wishlist.length === 0 ? (
                      <div className="space-y-3 py-12 text-center">
                        <Heart className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
                        <h3 className="text-sm font-bold">
                          Your Wishlist is Empty
                        </h3>
                        <p className="mx-auto max-w-xs text-xs text-muted-foreground">
                          Explore our premium catalog of architectural lights
                          and tap the heart icon to save products here.
                        </p>
                        <Link href="/shop" className="inline-block pt-2">
                          <Button
                            size="sm"
                            className="cursor-pointer rounded-lg bg-amber-500 font-bold text-white hover:bg-amber-600"
                          >
                            View Catalog
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {wishlist.map((item) => (
                          <div
                            key={item.id}
                            className="relative flex gap-4 rounded-xl border border-border/60 p-3 hover:border-amber-500/20"
                          >
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                              <Image
                                src={
                                  item.thumbnail ||
                                  "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=400"
                                }
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-grow flex-col justify-between">
                              <div>
                                <h4 className="line-clamp-1 text-xs font-bold">
                                  {item.title}
                                </h4>
                                <span className="mt-1 block text-xs font-bold text-foreground">
                                  KES {item.price.toLocaleString()}
                                </span>
                              </div>
                              <Link
                                href={`/product/${item.handle}`}
                                className="flex items-center text-[10px] font-bold text-amber-500 hover:underline"
                              >
                                View details{" "}
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                            </div>
                            <button
                              onClick={() => removeFromWishlist(item.id)}
                              className="absolute top-3 right-3 cursor-pointer p-1 text-muted-foreground transition-colors hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* ORDER DETAILS MODAL DIALOG */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200 fade-in">
          <div className="flex max-h-[85vh] w-full max-w-2xl animate-in flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl duration-200 zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-extrabold">
                  Order Details
                  <span
                    className={`text-2xs inline-block rounded-full px-2 py-0.5 font-semibold ${getStatusStyles(selectedOrder.status, selectedOrder.payment_status)}`}
                  >
                    {formatStatus(selectedOrder.status, selectedOrder.payment_status)}
                  </span>
                </h3>
                <p className="text-2xs mt-0.5 text-muted-foreground">
                  ID:{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {selectedOrder.id}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-grow space-y-6 overflow-y-auto p-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-muted/10 p-4 text-xs sm:grid-cols-2">
                <div>
                  <span className="block font-semibold text-muted-foreground">
                    Order Reference:
                  </span>
                  <span className="font-bold text-amber-500">
                    LUMI-
                    {selectedOrder.display_id ||
                      selectedOrder.id.substring(0, 8).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="block font-semibold text-muted-foreground">
                    Date Placed:
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatDate(selectedOrder.created_at)}
                  </span>
                </div>
              </div>

              {/* Shipping Details */}
              {selectedOrder.shipping_address && (
                <div className="space-y-2 text-xs">
                  <h4 className="flex items-center gap-1.5 text-sm font-bold tracking-wider text-muted-foreground uppercase">
                    <MapPin className="h-4 w-4 text-amber-500" /> Delivery
                    Address
                  </h4>
                  <div className="space-y-1 rounded-xl border border-border/60 bg-card p-4">
                    <p className="text-sm font-bold">
                      {selectedOrder.shipping_address.first_name || ""}{" "}
                      {selectedOrder.shipping_address.last_name || ""}
                    </p>
                    <p className="text-muted-foreground">
                      {[
                        selectedOrder.shipping_address.address_1,
                        selectedOrder.shipping_address.address_2,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedOrder.shipping_address.city}, KE
                    </p>
                    {selectedOrder.shipping_address.phone && (
                      <p className="mt-1 text-muted-foreground">
                        Phone:{" "}
                        <span className="font-semibold text-foreground">
                          {selectedOrder.shipping_address.phone}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-bold tracking-wider text-muted-foreground uppercase">
                  <ShoppingBag className="h-4 w-4 text-amber-500" /> Products
                  Purchased
                </h4>
                <div className="overflow-hidden rounded-xl border border-border">
                  <div className="divide-y divide-border/60 bg-card">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 text-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground">
                            {item.title}
                          </p>
                          <p className="text-muted-foreground">
                            Qty:{" "}
                            <span className="font-semibold text-foreground">
                              {item.quantity}
                            </span>{" "}
                            &times; KES{" "}
                            {(item.unit_price / 100).toLocaleString()}
                          </p>
                        </div>
                        <span className="font-bold text-foreground">
                          KES{" "}
                          {(
                            (item.unit_price * item.quantity) /
                            100
                          ).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-border bg-muted/10 p-4">
              <div className="text-left">
                <span className="text-2xs block font-semibold text-muted-foreground uppercase">
                  Total Paid
                </span>
                <span className="text-lg font-extrabold text-amber-500">
                  KES {(selectedOrder.total / 100).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer gap-1.5 text-xs font-bold"
                  onClick={() => printInvoice(selectedOrder)}
                >
                  <FileText className="h-4 w-4 text-amber-500" /> Invoice PDF
                </Button>
                <Button
                  className="cursor-pointer bg-slate-900 text-xs font-bold text-white hover:bg-slate-800"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default function CustomerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col justify-between bg-background">
          <Navbar />
          <div className="flex flex-grow flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <span className="text-sm font-semibold text-muted-foreground">
              Loading...
            </span>
          </div>
          <Footer />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
