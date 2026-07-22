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
    <section className="relative h-[650px] sm:h-[600px] lg:h-[660px] shrink-0 overflow-hidden bg-slate-950 text-white flex items-center">
      {/* Background Hero Slides */}
      {slides.map((slide, index) => (
        <div
          key={`bg-${slide.id}`}
          className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Desktop Wave Image Container */}
          <div className="absolute right-0 top-0 bottom-0 w-[58%] h-full z-0 overflow-hidden hidden lg:block animate-in fade-in duration-500">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className={`object-cover transition-transform duration-[8000ms] ease-out ${
                index === currentSlide ? "scale-105" : "scale-100"
              }`}
              priority={index === 0}
            />
            {/* Soft gradient fade inside the container */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/25 to-transparent z-10" />

            {/* Organic Wave Split SVG Overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-[140px] h-full z-20 pointer-events-none">
              <svg
                viewBox="0 0 100 1000"
                className="h-full w-full fill-slate-950 text-slate-950"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="waveGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#ea580c" stopOpacity="1" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                {/* Wave mask area (covers left side of image container with background color) */}
                <path d="M 0,0 L 100,0 C 50,250 12,400 12,500 C 12,600 50,750 100,1000 L 0,1000 Z" />
                {/* Glowing neon path on wave boundary */}
                <path
                  d="M 100,0 C 50,250 12,400 12,500 C 12,600 50,750 100,1000"
                  fill="none"
                  stroke="url(#waveGlow)"
                  strokeWidth="3.5"
                  className="animate-pulse-glow"
                />
              </svg>
            </div>
          </div>

          {/* Mobile Background Image (Full Span) */}
          <div className="absolute inset-0 w-full h-full z-0 lg:hidden">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className={`object-cover transition-transform duration-[8000ms] ease-out ${
                index === currentSlide ? "scale-105" : "scale-100"
              }`}
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-slate-950/85" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
          </div>

          {/* Left ambient dark background for text readability */}
          <div className="absolute left-0 top-0 bottom-0 w-[45%] bg-slate-950 z-0 hidden lg:block" />
          {/* Transition gradient between dark left and diagonal image */}
          <div className="absolute left-[40%] top-0 bottom-0 w-[10%] bg-gradient-to-r from-slate-950 to-transparent z-0 hidden lg:block" />
        </div>
      ))}

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 z-10 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

      {/* Main Slide Content Container */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative min-h-[480px] sm:min-h-[420px] lg:min-h-[400px] flex items-center">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`w-full lg:max-w-xl transition-all duration-700 ease-in-out ${
                index === currentSlide
                  ? "relative pointer-events-auto z-10 translate-y-0 opacity-100"
                  : "absolute inset-0 pointer-events-none z-0 translate-y-4 opacity-0"
              }`}
            >
              {/* Text & CTAs */}
              <div className="text-center lg:text-left">
                <div className="relative mx-auto lg:mx-0 mb-5 h-12 w-36 shrink-0">
                  <Image
                    src="/lumi-logo-yellow-clean.png"
                    alt="LUMI Logo"
                    fill
                    className="object-contain drop-shadow-md"
                    priority
                  />
                </div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 text-xs font-bold text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)] backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" />
                  <span className="tracking-widest uppercase text-[10px]">{slide.badge}</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight drop-shadow-md">
                  {slide.title}{" "}
                  {slide.highlight && (
                    <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
                      {slide.highlight}
                    </span>
                  )}
                </h1>
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300 max-w-lg mx-auto lg:mx-0">
                  {slide.description}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
                  <Link href={slide.ctaLink}>
                    <Button
                      size="lg"
                      className="h-12 cursor-pointer gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 font-bold text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center"
                    >
                      {slide.ctaText} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/calculator">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 cursor-pointer border-slate-700 hover:border-amber-500 bg-slate-900/40 hover:bg-slate-950 px-6 text-slate-200 hover:text-white rounded-xl shadow-xs transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center"
                    >
                      Room Calculator
                    </Button>
                  </Link>
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
            className="absolute top-1/2 left-3 sm:left-6 z-30 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-slate-950/40 text-slate-300 hover:text-white hover:border-amber-500/80 hover:bg-slate-950/80 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:scale-110"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-3 sm:right-6 z-30 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-slate-950/40 text-slate-300 hover:text-white hover:border-amber-500/80 hover:bg-slate-950/80 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:scale-110"
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
              className={`group relative h-2.5 cursor-pointer rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "w-8 bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                  : "w-2.5 bg-slate-700 hover:bg-slate-500"
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
