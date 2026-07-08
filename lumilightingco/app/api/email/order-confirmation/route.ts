import { NextResponse } from "next/server"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const order = await request.json()
    console.log(
      `[STOREFRONT EMAIL API] Sending order confirmation email for Order Reference: ${order.display_id ? `LUMI-${order.display_id}` : order.id}`
    )

    if (!order || !order.email) {
      return NextResponse.json(
        { error: "Missing order details or recipient email address" },
        { status: 400 }
      )
    }

    await sendOrderConfirmationEmail(order)

    return NextResponse.json({
      success: true,
      message: `Order confirmation email sent successfully to ${order.email}`,
    })
  } catch (error) {
    console.error("Error in order confirmation email API route:", error)
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to send confirmation email"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
