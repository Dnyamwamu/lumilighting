import { NextResponse } from "next/server"
import { sendOrderFulfillmentEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const order = await request.json()
    console.log(
      `[STOREFRONT EMAIL API] Sending order fulfillment email for Order: ${order.display_id ? `LUMI-${order.display_id}` : order.id}`
    )

    if (!order || !order.email) {
      return NextResponse.json(
        { error: "Missing order details or email address" },
        { status: 400 }
      )
    }

    await sendOrderFulfillmentEmail(order)

    return NextResponse.json({
      success: true,
      message: `Order fulfillment email sent successfully to ${order.email}`,
    })
  } catch (error) {
    console.error("Error in order fulfillment email API route:", error)
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to send fulfillment email"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
