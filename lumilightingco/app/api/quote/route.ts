import { NextResponse } from "next/server"
import { sendQuoteEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, email, projectDescription, products } = body

    // Validation
    if (!name || !phone || !email || !projectDescription) {
      return NextResponse.json(
        {
          error:
            "Required fields: name, phone, email, and projectDescription must be provided.",
        },
        { status: 400 }
      )
    }

    console.log(`[QUOTE REQUEST RECEIVED]
      - Customer Name: ${name}
      - Contact: ${phone} | ${email}
      - Project Description: ${projectDescription}
      - Interested Products: ${JSON.stringify(products || [])}
    `)

    // Send the notifications using Nodemailer
    await sendQuoteEmail({ name, phone, email, projectDescription, products })

    return NextResponse.json({
      success: true,
      message:
        "Your quotation request has been submitted successfully. A LUMI project assistant will contact you shortly.",
    })
  } catch (error) {
    console.error("Error in Quote Request API route:", error)
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to submit quotation request."
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
