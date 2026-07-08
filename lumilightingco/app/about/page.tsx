import React from "react"
import Image from "next/image"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Target, Eye, ShieldCheck, Award } from "lucide-react"
import { sanityService } from "@/lib/sanity"
import { urlFor } from "@/sanity/lib/image"

export default async function AboutPage() {
  const sanityAbout = await sanityService.getAboutContent().catch((err) => {
    console.error("Failed to fetch about content from Sanity:", err)
    return null
  })

  const title = sanityAbout?.title || "About LUMI Lighting."
  const description =
    sanityAbout?.description ||
    "East Africa's premier lighting showroom provider, redefining residential and architectural spaces with class-leading luminary engineering."
  const mission =
    sanityAbout?.mission ||
    "To supply premium-grade, energy-saving, and highly-durable lighting and electrical fixtures to homeowners, developers, and contractors across Kenya, ensuring design-forward excellence at competitive pricing."
  const vision =
    sanityAbout?.vision ||
    "To become the largest, most trusted lighting showroom marketplace in East Africa, powering smart building cities with next-generation LEDs, smart controls, and sustainable architectural design options."

  const heroImageUrl = sanityAbout?.heroImage
    ? urlFor(sanityAbout.heroImage).url()
    : "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=1200"

  const features =
    sanityAbout?.features && sanityAbout.features.length > 0
      ? sanityAbout.features
      : [
        {
          title: "CE & RoHS Certified",
          description:
            "Certified compliance with electrical safety codes for residential stability.",
        },
        {
          title: "Engineered Longevity",
          description:
            "All LED light cores operate up to 50,000 hours with negligible decay rate.",
        },
        {
          title: "Reflectance Calibrated",
          description:
            "High CRI (Color Rendering Index) > 80, showing colors in their true natural light.",
        },
      ]

  const icons = [ShieldCheck, Award, Target]

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-grow">
        {/* Banner Section */}
        <section className="relative shrink-0 bg-slate-950 py-16 text-center text-white md:py-24">
          <div className="absolute inset-0 -z-10 opacity-20">
            <Image
              src={heroImageUrl}
              alt="About LUMI"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="mx-auto max-w-7xl px-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
              {description}
            </p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {/* Mission Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-xs">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold">Our Mission</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {mission}
                </p>
              </div>
            </div>

            {/* Vision Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-xs">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Eye className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold">Our Vision</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {vision}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="border-t border-b border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Our Quality Guarantee
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Every fixture passing through our 14 Kijabe Street Showroom undergoes
              strict lux calibration and driver assessments.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, idx) => {
                const IconComponent = icons[idx % icons.length]
                return (
                  <div key={idx} className="space-y-3 p-4">
                    <IconComponent className="mx-auto h-10 w-10 text-amber-500" />
                    <h3 className="text-base font-bold">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
