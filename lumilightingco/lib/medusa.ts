/* eslint-disable @typescript-eslint/no-explicit-any */
const isServer = typeof window === "undefined"
export const MEDUSA_BACKEND_URL = isServer
  ? process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "http://localhost:9001"
  : process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "/api/medusa"

export const PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const headers = {
  "Content-Type": "application/json",
  "x-publishable-api-key": PUBLISHABLE_KEY,
}

interface MedusaRequestInit extends RequestInit {
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
}

async function medusaRequest(endpoint: string, options: MedusaRequestInit = {}) {
  const url = `${MEDUSA_BACKEND_URL}${endpoint}`
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`Medusa API Error (${res.status}): ${errorText}`)
    }

    return await res.json()
  } catch (error) {
    console.error(`Error requesting Medusa endpoint ${endpoint}:`, error)
    throw error
  }
}

// Typings
export interface Product {
  id: string
  title: string
  handle: string
  subtitle?: string
  description?: string
  thumbnail?: string
  collection_id?: string
  images?: { url: string }[]
  options?: any[]
  variants: Variant[]
  metadata?: Record<string, any>
  categories?: ProductCategory[]
  tags?: { id: string; value: string }[]
}

export interface Variant {
  id: string
  title: string
  sku?: string
  inventory_quantity: number
  prices: Price[]
}

export interface Price {
  id: string
  currency_code: string
  amount: number // In base units (e.g. 100 for 1.00 KES)
}

export interface ProductCategoryImage {
  id: string
  url: string
  file_id: string
  type: "thumbnail" | "image"
  category_id: string
}

export interface ProductCategory {
  id: string
  name: string
  handle: string
  description?: string
  category_children?: ProductCategory[]
  product_category_images?: ProductCategoryImage[]
}

export interface ProductCollection {
  id: string
  title: string
  handle: string
  description?: string
  metadata?: Record<string, any>
}

export interface Cart {
  id: string
  email?: string
  shipping_address?: any
  billing_address?: any
  items: CartItem[]
  shipping_methods?: any[]
  promotions?: any[]
  subtotal: number
  tax_total: number
  shipping_total: number
  discount_total: number
  total: number
  currency_code: string
  region_id?: string
}

export interface CartItem {
  id: string
  title: string
  description?: string
  thumbnail?: string
  unit_price: number
  quantity: number
  variant_id: string
  variant: Variant
}

export interface Review {
  id: string
  title?: string
  content: string
  rating: number
  first_name: string
  last_name: string
  product_id: string
  customer_id?: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export const medusa = {
  // Products
  async getProducts(params?: {
    q?: string
    category_id?: string
    limit?: number
    offset?: number
  }): Promise<{ products: Product[]; count: number }> {
    const query = new URLSearchParams()
    query.append("fields", "*variants.prices,*categories,*tags")
    if (params?.q) query.append("q", params.q)
    if (params?.category_id) query.append("category_id", params.category_id)
    if (params?.limit) query.append("limit", String(params.limit))
    if (params?.offset) query.append("offset", String(params.offset))

    const queryString = query.toString()
    const endpoint = `/store/products${queryString ? `?${queryString}` : ""}`
    return medusaRequest(endpoint, { next: { revalidate: 60 } })
  },

  async getProductByHandle(handle: string): Promise<{ product: Product }> {
    const data = await medusaRequest(
      `/store/products?handle=${handle}&fields=*variants.prices,*categories,*tags`,
      { next: { revalidate: 60 } }
    )
    if (!data.products || data.products.length === 0) {
      throw new Error(`Product with handle "${handle}" not found`)
    }
    return { product: data.products[0] }
  },

  // Categories
  async getCategories(): Promise<{ product_categories: ProductCategory[] }> {
    return medusaRequest(
      "/store/product-categories?include_descendants_tree=true",
      { next: { revalidate: 120 } }
    )
  },

  // Collections
  async getCollections(): Promise<{ collections: ProductCollection[] }> {
    const res = await medusaRequest("/store/collections", { next: { revalidate: 120 } })
    if (res?.collections) {
      res.collections.sort((a, b) => {
        const aIsIndoor = a.handle?.toLowerCase().includes("indoor") || a.title?.toLowerCase().includes("indoor")
        const bIsIndoor = b.handle?.toLowerCase().includes("indoor") || b.title?.toLowerCase().includes("indoor")
        if (aIsIndoor && !bIsIndoor) return -1
        if (!aIsIndoor && bIsIndoor) return 1
        return 0
      })
    }
    return res
  },

  // Carts
  async createCart(currencyCode = "kes"): Promise<{ cart: Cart }> {
    return medusaRequest("/store/carts", {
      method: "POST",
      body: JSON.stringify({ currency_code: currencyCode }),
    })
  },

  async getCart(cartId: string): Promise<{ cart: Cart }> {
    return medusaRequest(`/store/carts/${cartId}`, { cache: "no-store" })
  },

  async addToCart(
    cartId: string,
    variantId: string,
    quantity = 1
  ): Promise<{ cart: Cart }> {
    return medusaRequest(`/store/carts/${cartId}/line-items`, {
      method: "POST",
      body: JSON.stringify({ variant_id: variantId, quantity }),
    })
  },

  async updateCartItem(
    cartId: string,
    itemId: string,
    quantity: number
  ): Promise<{ cart: Cart }> {
    return medusaRequest(`/store/carts/${cartId}/line-items/${itemId}`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    })
  },

  async removeFromCart(
    cartId: string,
    itemId: string
  ): Promise<{ cart: Cart }> {
    await medusaRequest(
      `/store/carts/${cartId}/line-items/${itemId}`,
      {
        method: "DELETE",
      }
    )
    return medusa.getCart(cartId)
  },

  async updateCartAddress(
    cartId: string,
    billingAddress: {
      first_name: string
      last_name: string
      phone: string
      address_1: string
      city: string
      country_code: string
      postal_code?: string
    },
    shippingAddress: {
      first_name: string
      last_name: string
      phone: string
      address_1: string
      city: string
      country_code: string
      postal_code?: string
    },
    email: string,
    metadata?: Record<string, any>
  ): Promise<{ cart: Cart }> {
    return medusaRequest(`/store/carts/${cartId}`, {
      method: "POST",
      body: JSON.stringify({
        billing_address: billingAddress,
        shipping_address: shippingAddress,
        email,
        metadata,
      }),
    })
  },

  async applyDiscount(cartId: string, code: string): Promise<{ cart: Cart }> {
    return medusaRequest(`/store/carts/${cartId}/promotions`, {
      method: "POST",
      body: JSON.stringify({ promo_codes: [code] }),
    })
  },

  async removeDiscount(cartId: string, code: string): Promise<{ cart: Cart }> {
    return medusaRequest(`/store/carts/${cartId}/promotions`, {
      method: "DELETE",
      body: JSON.stringify({ promo_codes: [code] }),
    })
  },

  // Shipping
  async getShippingOptions(
    cartId: string
  ): Promise<{ shipping_options: any[] }> {
    return medusaRequest(`/store/shipping-options?cart_id=${cartId}`, {
      cache: "no-store",
    })
  },

  async selectShippingMethod(
    cartId: string,
    optionId: string
  ): Promise<{ cart: Cart }> {
    return medusaRequest(`/store/carts/${cartId}/shipping-methods`, {
      method: "POST",
      body: JSON.stringify({ option_id: optionId }),
    })
  },

  async createPaymentCollection(
    cartId: string
  ): Promise<{ payment_collection: { id: string } }> {
    return medusaRequest(`/store/payment-collections`, {
      method: "POST",
      body: JSON.stringify({ cart_id: cartId }),
    })
  },

  async initiatePaymentSession(
    paymentCollectionId: string,
    providerId: string
  ): Promise<{ payment_collection: any }> {
    return medusaRequest(
      `/store/payment-collections/${paymentCollectionId}/payment-sessions`,
      {
        method: "POST",
        body: JSON.stringify({ provider_id: providerId }),
      }
    )
  },

  // Checkout Completion
  async completeCart(
    cartId: string
  ): Promise<{ type: string; order?: any; cart?: any; data?: any }> {
    return medusaRequest(`/store/carts/${cartId}/complete`, {
      method: "POST",
    })
  },

  // Customer Orders
  async getCustomerOrders(email: string): Promise<{ orders: any[] }> {
    return medusaRequest(
      `/store/customer-orders?email=${encodeURIComponent(email)}`,
      {
        cache: "no-store",
      }
    )
  },

  // Product Reviews
  async getReviews(
    productId: string
  ): Promise<{ reviews: Review[]; count: number; average_rating: number }> {
    return medusaRequest(`/store/products/${productId}/reviews`, {
      cache: "no-store",
    })
  },

  async createReview(reviewData: {
    title?: string
    content: string
    rating: number
    product_id: string
    first_name: string
    last_name: string
  }): Promise<{ review: Review }> {
    return medusaRequest(`/store/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    })
  },

  async searchProducts(query: string): Promise<{ hits: any[] }> {
    return medusaRequest("/store/products/search", {
      method: "POST",
      body: JSON.stringify({ query }),
    })
  },
}
