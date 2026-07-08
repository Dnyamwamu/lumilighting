"use client"

import React, { useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    projectDescription: "",
    products: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          products: formData.products
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit quote request.")
      }

      setSuccess(true)
      setFormData({
        name: "",
        phone: "",
        email: "",
        projectDescription: "",
        products: "",
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-7xl flex-grow px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Contact Our Showroom
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Have questions about a custom lighting project, bulk ordering, or
            M-Pesa payments? Get in touch with us.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Contact Details Column */}
          <div className="space-y-6 lg:col-span-1">
            <h2 className="border-b border-border pb-2 text-2xl font-bold">
              Showroom Contacts
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 rounded-xl border border-border bg-muted/20 p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <h3 className="text-sm font-semibold">Location Address</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Lumi Showroom, 14 Kijabe Street, Nairobi, Kenya
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-border bg-muted/20 p-4">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <h3 className="text-sm font-semibold">Phone Hotlines</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <a
                      href="tel: +254706504644"
                      className="block transition-colors hover:text-amber-500"
                    >
                      +254 706 504 644
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-border bg-muted/20 p-4">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <h3 className="text-sm font-semibold">Email Inquiries</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <a
                      href="mailto:info@lumilighting.co.ke"
                      className="block transition-colors hover:text-amber-500"
                    >
                      info@lumilighting.co.ke
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-border bg-muted/20 p-4">
                <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div>
                  <h3 className="text-sm font-semibold">WhatsApp Live Chat</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Quick assistance via chat.
                  </p>
                  <a
                    href="https://wa.me/254729686414?text=Hello%20LUMI%20Lighting%2C%20please%20assist%20me%20with%20an%20order."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-xs font-bold text-amber-500 hover:underline"
                  >
                    Open Chat &rarr;
                  </a>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-muted p-4 text-center">
              <div className="space-y-1">
                <MapPin className="mx-auto h-8 w-8 text-amber-500" />
                <span className="block text-xs font-semibold">
                  Google Map Showroom Pin
                </span>
                <p className="text-[10px] text-muted-foreground">
                  14 Kijabe Street showroom coordinate marker.
                </p>
              </div>
            </div>
          </div>

          {/* Quotation Request Form Column */}
          <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm lg:col-span-2">
            <h2
              className="mb-6 border-b border-border pb-2 text-2xl font-bold"
              id="quote"
            >
              Request Contractor Quotation
            </h2>

            {success ? (
              <div className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center text-emerald-600">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="text-lg font-bold">
                  Quotation Request Received
                </h3>
                <p className="text-sm">
                  Thank you! Your quotation request has been successfully
                  received. A project support member will contact you within 2
                  hours with pricing.
                </p>
                <Button
                  onClick={() => setSuccess(false)}
                  className="mt-4 cursor-pointer bg-slate-900 text-xs text-white hover:bg-slate-800"
                >
                  Submit Another Quote
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Name */}
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                    >
                      Contact Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full rounded-lg border border-border bg-background p-2.5 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 0712345678"
                      className="w-full rounded-lg border border-border bg-background p-2.5 text-sm focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. builder@example.com"
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Products */}
                <div className="space-y-2">
                  <label
                    htmlFor="products"
                    className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                  >
                    Products Interested In (Comma separated)
                  </label>
                  <input
                    id="products"
                    type="text"
                    name="products"
                    value={formData.products}
                    onChange={handleChange}
                    placeholder="e.g. LED Panels 18W, Floodlights 100W, Sockets"
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Project Description */}
                <div className="space-y-2">
                  <label
                    htmlFor="projectDescription"
                    className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                  >
                    Project Details / Message
                  </label>
                  <textarea
                    id="projectDescription"
                    name="projectDescription"
                    required
                    value={formData.projectDescription}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe your project, layout requirements, quantities, or specific lux requirements..."
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {error && (
                  <p className="text-xs font-bold text-red-500">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-500 font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Submitting..." : "Submit Quotation Request"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
