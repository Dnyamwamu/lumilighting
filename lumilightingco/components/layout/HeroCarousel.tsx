"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { urlFor } from "@/sanity/lib/image"
import { HeroSlide } from "@/lib/sanity"

interface HeroCarouselProps {
  initialSlides?: HeroSlide[]
}

const FALLBACK_SLIDES = [
  {
    id: "fallback-1",
    image: "/lumi-poster1.jpeg",
    badge: "Premium Architectural Lighting",
    title: "Illuminating Spaces,",
    highlight: "Brilliantly.",
    description:
      "Experience the luxury showroom collection at LUMI Lighting. Our energy-efficient LED technology and high-end fixtures elevate any interior.",
    ctaText: "Explore Showroom",
    ctaLink: "/shop",
  },
  {
    id: "fallback-2",
    image: "/lumi-poster2.jpeg",
    badge: "Luxury Showroom Collection",
    title: "Transforming Homes with",
    highlight: "Modern Elegance.",
    description:
      "Discover architectural luminaires designed to complement contemporary lifestyles. Elevate your living areas with curated pendant lights and panel fixtures.",
    ctaText: "Explore Showroom",
    ctaLink: "/shop",
  },
  {
    id: "fallback-3",
    image: "/lumilamp1.jpeg",
    badge: "Designer Pendant Lights",
    title: "Crafted for Modern",
    highlight: "Ambiance.",
    description:
      "Elevate your interior design with custom-crafted pendant lights, dimmable LED fixtures, and luxury chandeliers.",
    ctaText: "View Collection",
    ctaLink: "/shop",
  },
]

export default function HeroCarousel({
  initialSlides = [],
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Format slides from Sanity or use fallback slides
  const slides =
    initialSlides.length > 0
      ? initialSlides.map((slide, index) => {
        const titleParts = slide.title.split(",")
        const mainTitle = titleParts[0] + (titleParts.length > 1 ? "," : "")
        const highlight = titleParts.slice(1).join(" ").trim()

        let imageUrl = FALLBACK_SLIDES[index % FALLBACK_SLIDES.length].image
        if (slide.backgroundImage) {
          try {
            const url = urlFor(slide.backgroundImage).url()
            if (url) imageUrl = url
          } catch (err) {
            console.error("Failed to build image URL from Sanity:", err)
          }
        }

        return {
          id: slide._id || `sanity-slide-${index}`,
          image: imageUrl,
          badge: "Premium Architectural Lighting",
          title: mainTitle,
          highlight: highlight || undefined,
          description:
            slide.subtitle ||
            "Experience the luxury showroom collection at LUMI Lighting. Our energy-efficient LED technology and high-end fixtures elevate any interior.",
          ctaText: slide.ctaText || "Explore Showroom",
          ctaLink: slide.ctaLink || "/shop",
        }
      })
      : FALLBACK_SLIDES

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section className="relative shrink-0 overflow-hidden bg-slate-950 py-16 text-white md:py-24 lg:py-28">
      {/* Background Hero Slides */}
      {slides.map((slide, index) => (
        <div
          key={`bg-${slide.id}`}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-45" : "opacity-0 pointer-events-none"
            }`}
        >
          <Image
            src={slide.image}
            alt={`Lighting Background ${index + 1}`}
            fill
            className={`object-cover filter blur-[2px] transition-transform duration-[6000ms] ease-out ${index === currentSlide ? "scale-105" : "scale-100"
              }`}
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/50 md:to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
        </div>
      ))}

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 z-0 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/20 blur-[130px] pointer-events-none" />

      {/* Main Slide Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[520px] sm:min-h-[460px] md:min-h-[420px] flex items-center">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`w-full grid grid-cols-1 items-center gap-8 lg:grid-cols-12 transition-all duration-700 ease-in-out ${index === currentSlide
                  ? "relative pointer-events-auto z-10 translate-y-0 opacity-100"
                  : "absolute inset-0 pointer-events-none z-0 translate-y-4 opacity-0"
                }`}
            >
              {/* Left Column: Text & CTAs */}
              <div className="text-center md:text-left lg:col-span-7">
                <div className="relative mx-auto mb-5 h-12 w-36 shrink-0 md:mx-0">
                  <Image
                    src="/lumi-logo-yellow-clean.png"
                    alt="LUMI Logo"
                    fill
                    className="object-contain drop-shadow-md"
                    priority
                  />
                </div>
                <div className="mb-4 inline-flex animate-pulse items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  {slide.badge}
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {slide.title}{" "}
                  {slide.highlight && (
                    <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                      {slide.highlight}
                    </span>
                  )}
                </h1>
                <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-slate-300 mx-auto md:mx-0">
                  {slide.description}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
                  <Link href={slide.ctaLink}>
                    <Button
                      size="lg"
                      className="h-12 cursor-pointer gap-2 rounded-xl bg-amber-500 px-6 font-bold text-white shadow-lg shadow-amber-500/25 hover:bg-amber-600"
                    >
                      {slide.ctaText} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/calculator">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 cursor-pointer border-slate-700 bg-slate-900/60 px-6 text-slate-200 hover:bg-slate-900 hover:border-slate-500"
                    >
                      Room Calculator
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Prominent Featured Image Card on Slider */}
              <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
                <div className="group relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/80 p-2.5 shadow-2xl shadow-amber-500/15 backdrop-blur-md transition-all duration-500 hover:border-amber-500/50">
                  <div className="relative h-full w-full overflow-hidden rounded-2xl">
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Badge on image card */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                      <span className="rounded-lg bg-slate-950/80 px-2.5 py-1 font-semibold border border-white/10 backdrop-blur-md">
                        {slide.badge}
                      </span>
                      <span className="rounded-lg bg-amber-500/90 text-white font-bold px-2.5 py-1 backdrop-blur-md">
                        Slide {index + 1} / {slides.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-3 sm:left-6 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-white shadow-lg backdrop-blur-md transition-all hover:bg-amber-500 hover:border-amber-500 hover:text-white"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-3 sm:right-6 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-white shadow-lg backdrop-blur-md transition-all hover:bg-amber-500 hover:border-amber-500 hover:text-white"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
          {slides.map((s, index) => (
            <button
              key={`indicator-${s.id}`}
              onClick={() => setCurrentSlide(index)}
              className={`group relative h-3 cursor-pointer rounded-full transition-all duration-300 ${index === currentSlide ? "w-10 bg-amber-500" : "w-3 bg-slate-600 hover:bg-slate-400"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span className="sr-only">Slide {index + 1}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
