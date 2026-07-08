import { NextResponse } from "next/server"
import { mpesaService } from "@/lib/mpesa"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phoneNumber, amount, orderId } = body

    if (!phoneNumber || !amount || !orderId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: phoneNumber, amount, and orderId are required.",
        },
        { status: 400 }
      )
    }

    const mpesaResponse = await mpesaService.initiateStkPush(
      phoneNumber,
      amount,
      orderId
    )

    // Log pending transaction to Medusa Analytics Database
    try {
      const medusaUrl =
        process.env.MEDUSA_BACKEND_URL || "http://localhost:9001"
      const logRes = await fetch(`${medusaUrl}/store/mpesa/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key":
            process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({
          merchantRequestId: mpesaResponse.MerchantRequestID,
          checkoutRequestId: mpesaResponse.CheckoutRequestID,
          amount: amount,
          phoneNumber: phoneNumber,
          cartId: orderId,
        }),
      })
      if (!logRes.ok) {
        console.error(
          "Failed to log M-Pesa transaction to Medusa:",
          await logRes.text()
        )
      }
    } catch (logErr) {
      console.error("Error logging M-Pesa transaction to Medusa:", logErr)
    }

    return NextResponse.json({
      success: true,
      message: "STK Push triggered successfully.",
      data: mpesaResponse,
    })
  } catch (error: any) {
    console.error("Error in STK Push API route:", error)
    return NextResponse.json(
      { error: error.message || "Failed to initiate M-Pesa payment." },
      { status: 500 }
    )
  }
}
