import { NextResponse } from "next/server"
import { createClerkClient } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const eventType = payload.type

    if (eventType === "user.created") {
      const { id: userId, email_addresses, first_name, last_name } = payload.data
      const primaryEmail = email_addresses?.[0]?.email_address

      const secretKey = process.env.CLERK_SECRET_KEY
      if (secretKey && userId) {
        const clerk = createClerkClient({ secretKey })

        // Automatically assign member status & role to the user
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            role: "member",
            isMember: true,
            memberType: "client",
            memberSince: new Date().toISOString(),
          },
          unsafeMetadata: {
            status: "active",
            registeredEmail: primaryEmail,
            name: `${first_name || ""} ${last_name || ""}`.trim(),
          },
        })

        console.log(`Successfully assigned member role to new Clerk user: ${userId} (${primaryEmail})`)
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" })
  } catch (error) {
    console.error("Clerk Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
