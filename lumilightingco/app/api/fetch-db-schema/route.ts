import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("http://medusa:9000/db-schema?t=9", {
      cache: "no-store",
    })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || error }, { status: 500 })
  }
}
