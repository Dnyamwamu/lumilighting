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

export default function HeroCarousel({
  initialSlides = [],
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // If no slides are returned from Sanity, fallback to local poster images
  const slides =
    initialSlides.length > 0
      ? initialSlides.map((slide) => {
          const titleParts = slide.title.split(",")
          const mainTitle = titleParts[0] + (titleParts.length > 1 ? "," : "")
          const highlight = titleParts.slice(1).join(" ").trim()

          return {
            id: slide._id,
            image: slide.backgroundImage
              ? urlFor(slide.backgroundImage).url()
              : "/lumi-poster1.jpeg",
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
      : [
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
        ]

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault()
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section className="relative shrink-0 overflow-hidden bg-slate-950 py-20 text-white md:py-32">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 -z-10 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-40" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={`Lighting Showroom Background ${index + 1}`}
            fill
            className={`object-cover transition-transform duration-[6000ms] ease-out ${
              index === currentSlide ? "scale-105" : "scale-100"
            }`}
            priority={index === 0}
          />
        </div>
      ))}

      <div className="absolute top-1/2 left-1/4 -z-10 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/20 blur-[130px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 md:text-left lg:px-8">
        <div className="relative mx-auto min-h-[420px] max-w-2xl md:mx-0 md:min-h-[350px]">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-x-0 top-0 transition-all duration-700 ease-in-out ${
                index === currentSlide
                  ? "pointer-events-auto z-10 translate-y-0 opacity-100"
                  : "pointer-events-none z-0 translate-y-4 opacity-0"
              }`}
            >
              {index === currentSlide && (
                <>
                  <div className="relative mx-auto mb-6 h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-amber-500/20 bg-slate-900 shadow-lg shadow-amber-500/10 md:mx-0">
                    <Image
                      src="/lumi-lighting-co-logo.jpg"
                      alt="LUMI Logo"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="mb-6 inline-flex animate-pulse items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                    <Sparkles className="h-3 w-3" />
                    {slide.badge}
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                    {slide.title}{" "}
                    {slide.highlight && (
                      <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                        {slide.highlight}
                      </span>
                    )}
                  </h1>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                    {slide.description}
                  </p>
                  <div className="mt-10 flex flex-wrap justify-center gap-4 md:justify-start">
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
                        className="h-12 cursor-pointer border-slate-700 px-6 text-slate-200 hover:bg-slate-900"
                      >
                        Room Calculator
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-700 bg-slate-900/60 text-white transition-all hover:bg-amber-500 hover:text-white"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-700 bg-slate-900/60 text-white transition-all hover:bg-amber-500 hover:text-white"
        aria-label="Next Slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
              index === currentSlide ? "w-8 bg-amber-500" : "w-2 bg-slate-500"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
