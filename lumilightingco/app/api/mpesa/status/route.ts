import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const checkoutRequestId = searchParams.get("checkoutRequestId")
    const cartId = searchParams.get("cartId")

    if (!checkoutRequestId && !cartId) {
      return NextResponse.json(
        { error: "Query parameter checkoutRequestId or cartId is required" },
        { status: 400 }
      )
    }

    const medusaUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9001"
    
    let url = `${medusaUrl}/store/mpesa/transactions`
    if (checkoutRequestId) {
      url += `?checkout_request_id=${checkoutRequestId}`
    } else if (cartId) {
      url += `?cart_id=${cartId}`
    }

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      }
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json(
        { error: `Medusa API returned error: ${res.statusText}`, details: errText },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error("Error in M-Pesa transaction status route:", err)
    return NextResponse.json(
      { error: err.message || "Failed to check transaction status" },
      { status: 500 }
    )
  }
}
