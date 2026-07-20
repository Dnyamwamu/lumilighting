"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { medusa } from "@/lib/medusa"

export default function Footer() {
  const [collections, setCollections] = useState<{ name: string; href: string }[]>([
    { name: "Indoor Lighting", href: "/shop?collection=indoor-lighting" },
    { name: "Outdoor Lighting", href: "/shop?collection=outdoor-lighting" },
    { name: "Commercial Lighting", href: "/shop?collection=commercial-lighting" },
    { name: "Residential Lighting", href: "/shop?collection=residential-lighting" },
    { name: "New Arrivals", href: "/shop?collection=new-arrivals" },
  ])

  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await medusa.getCollections()
        if (res?.collections && res.collections.length > 0) {
          const formatted = res.collections.map((col) => ({
            name: col.title,
            href: `/shop?collection=${col.handle}`,
          }))
          setCollections(formatted)
        }
      } catch (err) {
        console.error("Failed to fetch collections for footer:", err)
      }
    }
    fetchCollections()
  }, [])

  const quickLinks = [
    { name: "Store Catalog", href: "/shop" },
    { name: "Lighting Room Calculator", href: "/calculator" },
    { name: "Contractor Inquiries / Quote", href: "/contact#quote" },
    { name: "Blog & Articles", href: "/blog" },
    { name: "About Our Showroom", href: "/about" },
    { name: "Frequently Asked Questions (FAQs)", href: "/faq" },
    { name: "Return & Refund Policy", href: "/returns" },
  ]

  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-10 w-32 shrink-0">
                <Image
                  src="/lumi-logo-yellow-shadow.png"
                  alt="LUMI Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">
                Lighting
              </span>
            </Link>
            <p className="max-w-sm text-xs font-extrabold tracking-widest text-amber-500 uppercase">
              &ldquo;OUR QUALITY MARKS THE END OF THE TUNNEL.&rdquo;
            </p>
            <div className="flex flex-col space-y-2.5 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>Mon - Sat: 8:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {/* Product Collections */}
              <div>
                <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
                  Collections
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {collections.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate-400 transition-colors hover:text-amber-500"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Links */}
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
                  Useful Links
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {quickLinks.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate-400 transition-colors hover:text-amber-500"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Showroom Contacts */}
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-white uppercase">
                Nairobi Showroom
              </h3>
              <ul role="list" className="mt-4 space-y-3">
                <li className="flex items-start gap-2.5 text-sm text-slate-400">
                  <MapPin className="h-5 w-5 shrink-0 text-amber-500" />
                  <span>Lumi Showroom, 14 Kijabe Street, Nairobi, Kenya</span>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Phone className="h-4 w-4 shrink-0 text-amber-500" />
                  <a
                    href="tel:+254706504644"
                    className="transition-colors hover:text-amber-500"
                  >
                    +254 706 504644
                  </a>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Mail className="h-4 w-4 shrink-0 text-amber-500" />
                  <a
                    href="mailto:info@lumilighting.co.ke"
                    className="transition-colors hover:text-amber-500"
                  >
                    info@lumilighting.co.ke
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal / Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-900 pt-8 md:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} LUMI Lighting. All rights
            reserved. Built with care by{" "}
            <Link
              href="https://curlycraftsolutions.co.ke"
              className="font-bold hover:text-amber-500"
            >
              CurlyCraft Solutions
            </Link>
          </p>
          <div className="flex gap-6 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-amber-500">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-amber-500">
              Terms of Service
            </Link>
            <Link href="/returns" className="hover:text-amber-500">
              Return Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
