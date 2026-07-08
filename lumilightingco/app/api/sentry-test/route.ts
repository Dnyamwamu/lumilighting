import { NextResponse } from "next/server"

export async function GET() {
  // Trigger a test error to verify Sentry captures it
  throw new Error("LUMI Storefront Sentry Test Error!")
  return NextResponse.json({ success: true })
}
