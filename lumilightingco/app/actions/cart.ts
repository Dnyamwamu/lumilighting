"use server"

import { cookies } from "next/headers"
import { medusa } from "@/lib/medusa"
import { sendOrderConfirmationEmail } from "@/lib/email"

const CART_COOKIE_NAME = "_medusa_cart_id"

// Helper to safely extract error messages from unknown catch variables
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message)
  }
  return "Unknown error occurred"
}

export async function getCartId() {
  const cookieStore = await cookies()
  return cookieStore.get(CART_COOKIE_NAME)?.value || null
}

export async function setCartId(cartId: string) {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE_NAME, cartId, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export async function removeCartId() {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE_NAME, "", {
    maxAge: -1,
  })
}

export async function getOrSetCart(currencyCode = "kes") {
  let cartId = await getCartId()
  let cart = null

  if (cartId) {
    try {
      const res = await medusa.getCart(cartId)
      cart = res.cart
    } catch (error) {
      console.error("Failed to retrieve existing cart:", error)
      // If retrieval fails (e.g. cart expired on backend), we'll create a new one
      cartId = null
    }
  }

  if (!cart) {
    try {
      const res = await medusa.createCart(currencyCode)
      cart = res.cart
      await setCartId(cart.id)
    } catch (error) {
      console.error("Failed to create new cart:", error)
      throw error
    }
  }

  return cart
}

export async function retrieveCart() {
  const cartId = await getCartId()
  if (!cartId) return null
  try {
    const res = await medusa.getCart(cartId)
    return res.cart
  } catch (error) {
    console.error("Failed to retrieve cart:", error)
    return null
  }
}

export async function addToCartAction(variantId: string, quantity = 1) {
  try {
    const cart = await getOrSetCart()
    const res = await medusa.addToCart(cart.id, variantId, quantity)
    return { success: true, cart: res.cart }
  } catch (error) {
    console.error("addToCartAction failed:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateLineItemAction(itemId: string, quantity: number) {
  try {
    const cartId = await getCartId()
    if (!cartId) throw new Error("No cart found")
    const res = await medusa.updateCartItem(cartId, itemId, quantity)
    return { success: true, cart: res.cart }
  } catch (error) {
    console.error("updateLineItemAction failed:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function removeFromCartAction(itemId: string) {
  try {
    const cookieCartId = await getCartId()
    if (!cookieCartId) throw new Error("No cart found")
    const res = await medusa.removeFromCart(cookieCartId, itemId)
    return { success: true, cart: res.cart }
  } catch (error) {
    console.error("removeFromCartAction failed:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateCartAddressAction(
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
  } | null,
  email: string,
  metadata?: Record<string, unknown>
) {
  try {
    const cartId = await getCartId()
    if (!cartId) throw new Error("No cart found")
    const res = await medusa.updateCartAddress(
      cartId,
      billingAddress,
      shippingAddress || billingAddress,
      email,
      metadata
    )
    return { success: true, cart: res.cart }
  } catch (error) {
    console.error("updateCartAddressAction failed:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function getShippingOptionsAction() {
  try {
    const cartId = await getCartId()
    if (!cartId) throw new Error("No cart found")
    const res = await medusa.getShippingOptions(cartId)
    return { success: true, shippingOptions: res.shipping_options }
  } catch (error) {
    console.error("getShippingOptionsAction failed:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function selectShippingOptionAction(optionId: string) {
  try {
    const cartId = await getCartId()
    if (!cartId) throw new Error("No cart found")
    const res = await medusa.selectShippingMethod(cartId, optionId)
    return { success: true, cart: res.cart }
  } catch (error) {
    console.error("selectShippingOptionAction failed:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function initiatePaymentSessionAction(
  providerId: string = "pp_system_default"
) {
  try {
    const cartId = await getCartId()
    if (!cartId) throw new Error("No cart found")

    // 1. Create payment collection for the cart
    const collectionRes = await medusa.createPaymentCollection(cartId)
    const paymentCollectionId = collectionRes.payment_collection.id

    // 2. Initialize the payment session for the collection
    const sessionRes = await medusa.initiatePaymentSession(
      paymentCollectionId,
      providerId
    )
    return { success: true, paymentCollection: sessionRes.payment_collection }
  } catch (error) {
    console.error("initiatePaymentSessionAction failed:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function completeCartAction() {
  try {
    const cartId = await getCartId()
    if (!cartId) throw new Error("No cart found")
    const res = await medusa.completeCart(cartId)

    // Medusa v2 returns order data in res.order (or res.cart if not complete)
    const data = res.order || res.cart || res.data

    // Send order confirmation email asynchronously
    if (res.type === "order" && data) {
      try {
        await sendOrderConfirmationEmail(data)
      } catch (emailErr) {
        console.error("Failed to send order confirmation email:", emailErr)
      }
    }

    // Remove the cart cookie since the cart is completed and can no longer be modified
    await removeCartId()
    return { success: true, type: res.type, data }
  } catch (error) {
    console.error("completeCartAction failed:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function getCustomerOrdersAction(email: string) {
  try {
    const res = await medusa.getCustomerOrders(email)
    return { success: true, orders: res.orders }
  } catch (error) {
    console.error("getCustomerOrdersAction failed:", error)
    return { success: false, error: getErrorMessage(error) }
  }
}
