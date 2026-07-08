"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CollectionItem {
  id: string
  name: string
  href: string
  image: string
}

interface ExploreCollectionsProps {
  collections?: CollectionItem[]
  categories?: CollectionItem[]
}

export default function ExploreCategories({ collections, categories }: ExploreCollectionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const items = collections || categories || []

  // CSS classes for responsive limiting:
  // - On mobile (2 columns), 2 rows is 4 items. Items index >= 4 are hidden.
  // - On desktop (5 columns), 2 rows is 10 items. Items index >= 10 are hidden.
  const getItemClassName = (index: number) => {
    const baseClass =
      "group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-border/40"
    
    if (isExpanded) {
      return baseClass
    }

    let responsiveClass = ""
    if (index >= 4) {
      responsiveClass += " hidden md:block"
    }
    if (index >= 10) {
      responsiveClass += " md:hidden"
    }

    return `${baseClass}${responsiveClass}`
  }

  // Determine button container visibility
  const showMoreButtonContainerClass = () => {
    const base = "mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in duration-300"
    
    if (items.length <= 4) {
      return "hidden"
    }
    
    if (items.length <= 10) {
      return `${base} md:hidden`
    }
    
    return base
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
        {items.map((col, idx) => (
          <Link
            key={col.id}
            href={col.href}
            className={getItemClassName(idx)}
          >
            {/* Glassmorphic overlay at bottom */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            
            {col.image && (
              <Image
                src={col.image}
                alt={col.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            )}
            
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white tracking-wide drop-shadow-md">
                {col.name}
              </h3>
              <div className="rounded-full bg-amber-500/10 p-1.5 text-amber-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 backdrop-blur-xs">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className={showMoreButtonContainerClass()}>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          className="w-full sm:w-auto h-12 cursor-pointer gap-2 rounded-xl font-bold border-amber-500/30 hover:border-amber-500 text-foreground hover:bg-amber-500/5 transition-all px-6 min-w-[160px]"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show More <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>

        <Link href="/shop" className="w-full sm:w-auto">
          <Button
            variant="default"
            className="w-full sm:w-auto h-12 cursor-pointer gap-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all px-6 min-w-[160px]"
          >
            Shop All Categories <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
