import { NextResponse } from "next/server"
import { auth, currentUser, createClerkClient } from "@clerk/nextjs/server"

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.redirect(new URL("/sign-in", request.url))
    }

    const secretKey = process.env.CLERK_SECRET_KEY
    if (secretKey) {
      const clerk = createClerkClient({ secretKey })
      
      // Update publicMetadata to ensure member role & status
      if (user.publicMetadata?.role !== "member") {
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: {
            ...user.publicMetadata,
            role: "member",
            isMember: true,
            memberType: "client",
            memberSince: user.publicMetadata?.memberSince || new Date().toISOString(),
          },
        })
      }
    }

    const { searchParams } = new URL(request.url)
    const redirectUrl = searchParams.get("redirect") || "/dashboard"
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    console.error("Failed to sync member status:", error)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
}
