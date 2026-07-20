"use client"

import React, { useState, useEffect, useSyncExternalStore } from "react"
import { X } from "lucide-react"

const emptySubscribe = () => () => {}
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export default function WhatsAppWidget() {
  const [showBubble, setShowBubble] = useState(false)
  const isMounted = useIsMounted()

  useEffect(() => {
    // Delay the appearance of the greeting bubble for 4 seconds
    const timer = setTimeout(() => {
      // Only show if the user hasn't closed it in this session
      const dismissed = localStorage.getItem("whatsapp-bubble-dismissed")
      if (!dismissed) {
        setShowBubble(true)
      }
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowBubble(false)
    localStorage.setItem("whatsapp-bubble-dismissed", "true")
  }

  if (!isMounted) return null

  // WhatsApp click link
  const whatsappUrl = `https://wa.me/254706750968?text=${encodeURIComponent(
    "Hello LUMI Lighting, I am browsing your showroom and have a question."
  )}`

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 font-sans max-w-[calc(100vw-2rem)]">
      {/* Greeting Bubble */}
      {showBubble && (
        <div className="relative w-full max-w-[280px] sm:max-w-xs animate-in fade-in slide-in-from-bottom-5 duration-500 flex items-start gap-2.5 sm:gap-3 rounded-2xl border border-emerald-500/20 bg-white p-3.5 sm:p-4 shadow-2xl dark:bg-zinc-950 dark:border-emerald-500/30">
          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              LUMI Showroom Chat
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              Hello! 👋 Need help choosing the right lighting? Chat with us live on WhatsApp.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors shrink-0"
            aria-label="Close message"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          
          {/* Bubble Arrow */}
          <div className="absolute -bottom-2 right-5 h-4 w-4 rotate-45 border-r border-b border-emerald-500/20 bg-white dark:bg-zinc-950 dark:border-emerald-500/30" />
        </div>
      )}

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-emerald-600 hover:shadow-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shrink-0"
        aria-label="Chat on WhatsApp"
      >
        {/* Pulsing Outer Ring */}
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-500/40 opacity-75 duration-1000" />

        {/* WhatsApp Official SVG Logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="h-6 w-6 sm:h-7 sm:w-7 fill-current transition-transform duration-300 group-hover:rotate-12"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>

        {/* Small Tooltip on Hover */}
        <span className="hidden sm:inline-block absolute right-16 scale-0 group-hover:scale-100 transition-all duration-200 origin-right rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-bold text-white shadow-md select-none pointer-events-none whitespace-nowrap">
          Chat with us
        </span>
      </a>
    </div>
  )
}
