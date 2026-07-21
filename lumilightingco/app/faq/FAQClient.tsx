"use client"

import React, { useState, useMemo } from "react"
import { Search, ChevronDown, HelpCircle, RefreshCw } from "lucide-react"

export interface FAQ {
  _id: string
  question: string
  answer: string
  category: string
}

export default function FAQClient({ initialFaqs }: { initialFaqs: FAQ[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [openId, setOpenId] = useState<string | null>(null)

  const faqs = initialFaqs || []

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(faqs.map((f) => f.category || "General"))
    return ["All", ...Array.from(cats)]
  }, [faqs])

  // Filter FAQs based on active tab and search query
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "All" ||
        (faq.category || "General") === activeCategory
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [faqs, activeCategory, searchQuery])

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-3 text-center">
        <span className="block text-xs font-bold tracking-wider text-amber-500 uppercase">
          Support Hub
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground">
          Find answers regarding products, showroom location, delivery, warranties,
          bulk ordering, and expert lighting advice.
        </p>
      </div>

      {/* Search & Tabs Controls */}
      <div className="space-y-6">
        <div className="relative mx-auto max-w-md">
          <Search className="absolute top-1/2 left-4.5 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-card py-3 pr-6 pl-12 text-sm shadow-xs transition-all outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category)
                setOpenId(null) // Close open items on tab change
              }}
              className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                activeCategory === category
                  ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion Grid */}
      <div className="mx-auto max-w-3xl space-y-4">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq._id
            return (
              <div
                key={faq._id}
                className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs transition-all hover:border-amber-500/20"
              >
                <button
                  onClick={() => toggleAccordion(faq._id)}
                  className="flex w-full cursor-pointer items-center justify-between p-5 text-left text-sm font-bold focus:outline-none sm:text-base"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <HelpCircle className="h-5 w-5 shrink-0 text-amber-500" />
                    <span>{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-amber-500" : ""
                    }`}
                  />
                </button>

                {/* Expandable panel */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "max-h-96 border-t border-border/40 opacity-100"
                      : "pointer-events-none max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {faq.answer}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="space-y-2 py-12 text-center text-muted-foreground">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-amber-500/30" />
            <p className="text-sm">
              No FAQs found matching your search parameters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
