import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log(
      "--- Received M-Pesa Callback payload: ---",
      JSON.stringify(body, null, 2)
    )

    const callbackData = body.Body?.stkCallback
    if (!callbackData) {
      return NextResponse.json(
        { error: "Invalid callback payload structure" },
        { status: 400 }
      )
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } =
      callbackData

    // ResultCode 0 represents success
    if (ResultCode === 0) {
      const callbackMetadata = callbackData.CallbackMetadata?.Item || []

      let amount = 0
      let transactionCode = ""
      let transactionDate = ""
      let phoneNumber = ""

      for (const item of callbackMetadata) {
        switch (item.Name) {
          case "Amount":
            amount = item.Value
            break
          case "MpesaReceiptNumber":
            transactionCode = item.Value
            break
          case "TransactionDate":
            transactionDate = item.Value
            break
          case "PhoneNumber":
            phoneNumber = item.Value
            break
        }
      }

      console.log(`[PAYMENT SUCCESS] M-Pesa Payment Received:
        - MerchantRequestID: ${MerchantRequestID}
        - CheckoutRequestID: ${CheckoutRequestID}
        - Amount: KES ${amount}
        - Transaction Code: ${transactionCode}
        - Date: ${transactionDate}
        - Customer Phone: ${phoneNumber}
      `)

      // Log success to Medusa
      try {
        const medusaUrl =
          process.env.MEDUSA_BACKEND_URL || "http://localhost:9001"
        const logRes = await fetch(
          `${medusaUrl}/store/mpesa/transactions/callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key":
                process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
            },
            body: JSON.stringify({
              checkoutRequestId: CheckoutRequestID,
              status: "success",
              resultCode: ResultCode,
              resultDesc: ResultDesc,
              mpesaReceiptNumber: transactionCode,
              transactionDate: transactionDate,
            }),
          }
        )
        if (!logRes.ok) {
          console.error(
            "Failed to update M-Pesa success status in Medusa:",
            await logRes.text()
          )
        }
      } catch (logErr) {
        console.error("Error updating M-Pesa success status in Medusa:", logErr)
      }

      // Here you would connect with Medusa API to update payment status or order:
      // const order = await updateMedusaPayment(CheckoutRequestID, transactionCode, amount);

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Callback processed successfully",
      })
    } else {
      console.warn(`[PAYMENT FAILED] M-Pesa payment failed or was cancelled by user:
        - CheckoutRequestID: ${CheckoutRequestID}
        - ResultCode: ${ResultCode}
        - ResultDesc: ${ResultDesc}
      `)

      // Log failure to Medusa
      try {
        const medusaUrl =
          process.env.MEDUSA_BACKEND_URL || "http://localhost:9001"
        const logRes = await fetch(
          `${medusaUrl}/store/mpesa/transactions/callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-publishable-api-key":
                process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
            },
            body: JSON.stringify({
              checkoutRequestId: CheckoutRequestID,
              status: "failed",
              resultCode: ResultCode,
              resultDesc: ResultDesc,
            }),
          }
        )
        if (!logRes.ok) {
          console.error(
            "Failed to update M-Pesa failure status in Medusa:",
            await logRes.text()
          )
        }
      } catch (logErr) {
        console.error("Error updating M-Pesa failure status in Medusa:", logErr)
      }

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: `Processed failure callback: ${ResultDesc}`,
      })
    }
  } catch (error) {
    console.error("Error in M-Pesa Callback route:", error)
    return NextResponse.json(
      { error: "An error occurred while processing the M-Pesa callback." },
      { status: 500 }
    )
  }
}
