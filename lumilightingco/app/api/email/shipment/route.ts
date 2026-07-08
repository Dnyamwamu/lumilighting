import { NextResponse } from "next/server"
import { sendOrderShipmentEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const order = await request.json()
    console.log(
      `[STOREFRONT EMAIL API] Sending order shipment email for Order: ${order.display_id ? `LUMI-${order.display_id}` : order.id}`
    )

    if (!order || !order.email) {
      return NextResponse.json(
        { error: "Missing order details or email address" },
        { status: 400 }
      )
    }

    await sendOrderShipmentEmail(order)

    return NextResponse.json({
      success: true,
      message: `Order shipment email sent successfully to ${order.email}`,
    })
  } catch (error) {
    console.error("Error in order shipment email API route:", error)
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send shipment email"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
