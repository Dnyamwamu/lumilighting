import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/fetch-db-schema",
  "/api/email/order-confirmation",
  "/api/email/fulfillment",
  "/api/email/shipment",
])

export default clerkMiddleware(async (auth, request) => {
  // Temporarily bypass Clerk protection for DB setup
  // if (!isPublicRoute(request)) {
  //   await auth.protect()
  // }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
}
