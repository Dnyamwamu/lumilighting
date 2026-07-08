"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, ChevronDown, ChevronUp, ChevronRight } from "lucide-react"

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    analytics: true,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("lumi_cookie_consent")
    if (!consent) {
      // Defer state updates to avoid synchronous setState warning and provide a slide-in delay
      const timer = setTimeout(() => {
        setMounted(true)
        setIsOpen(true)
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      // Defer setting mounted state to the next tick of the event loop
      const timer = setTimeout(() => {
        setMounted(true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!mounted || !isOpen) return null

  const handleAcceptAll = () => {
    const consentData = {
      accepted: true,
      preferences: { essential: true, analytics: true },
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("lumi_cookie_consent", JSON.stringify(consentData))
    setIsOpen(false)
  }

  const handleRejectAll = () => {
    const consentData = {
      accepted: false,
      preferences: { essential: true, analytics: false },
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("lumi_cookie_consent", JSON.stringify(consentData))
    setIsOpen(false)
  }

  const handleSavePreferences = () => {
    const consentData = {
      accepted: true,
      preferences,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem("lumi_cookie_consent", JSON.stringify(consentData))
    setIsOpen(false)
  }

  return (
    <div className="fixed right-4 bottom-4 left-4 z-50 animate-in duration-500 ease-out slide-in-from-bottom md:left-auto md:max-w-md">
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 text-slate-200 shadow-2xl backdrop-blur-md md:p-6">
        {/* Banner Header */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
            <Shield className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold tracking-tight text-white">
              Cookie Preferences
            </h4>
            <p className="text-xs leading-relaxed text-slate-400">
              We use cookies to enhance your shopping experience, persist your
              active cart, and analyze our traffic. Read our{" "}
              <Link
                href="/privacy"
                className="font-semibold text-amber-500 hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
          </div>
        </div>

        {/* Expandable Details Drawer */}
        {showDetails && (
          <div className="animate-in space-y-3.5 border-t border-slate-800 pt-4 duration-300 fade-in">
            {/* Essential Cookies */}
            <div className="space-y-1 rounded-xl border border-slate-900 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Essential Cookies
                </span>
                <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  Required
                </span>
              </div>
              <p className="text-[11px] leading-normal text-slate-400">
                These cookies are necessary for the basic functionality of the
                store, such as keeping your shopping cart active across page
                reloads (e.g. <code>_medusa_cart_id</code>) and managing secure
                customer sessions.
              </p>
            </div>

            {/* Analytics & Performance */}
            <div className="space-y-1.5 rounded-xl border border-slate-900 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Performance & Analytics
                </span>
                <label className="relative inline-flex cursor-pointer items-center select-none">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        analytics: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-4.5 w-8 rounded-full bg-slate-800 peer-checked:bg-amber-500 after:absolute after:top-0.5 after:left-[2px] after:h-3.5 after:w-3.5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <p className="text-[11px] leading-normal text-slate-400">
                Helps us understand how visitors interact with the storefront,
                track popular products, and locate performance bottlenecks so we
                can improve layout and speed.
              </p>
            </div>
          </div>
        )}

        {/* Buttons / Actions */}
        <div className="flex flex-col gap-2 border-t border-slate-800/40 pt-1">
          <div className="flex gap-2">
            <button
              onClick={showDetails ? handleSavePreferences : handleAcceptAll}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition-all hover:bg-amber-600 hover:shadow-lg"
            >
              {showDetails ? "Save Preferences" : "Accept All"}
            </button>
            <button
              onClick={handleRejectAll}
              className="flex-1 cursor-pointer rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 transition-all hover:bg-slate-800"
            >
              Reject All
            </button>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full cursor-pointer items-center justify-center gap-1 py-1.5 text-center text-[10px] font-bold tracking-wider text-slate-500 uppercase transition-all hover:text-slate-300"
          >
            {showDetails ? (
              <>
                Collapse Details <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Customize Settings <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
