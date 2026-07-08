import React from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { sanityService } from "@/lib/sanity"
import FAQClient from "./FAQClient"

export default async function FAQPage() {
  const faqs = await sanityService.getFAQs().catch((err) => {
    console.error("Failed to fetch FAQs from Sanity:", err)
    return []
  })

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow">
        <FAQClient initialFaqs={faqs} />
      </main>
      <Footer />
    </div>
  )
}
