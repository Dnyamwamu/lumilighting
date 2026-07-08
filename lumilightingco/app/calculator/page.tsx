import React from "react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import LightingCalculator from "@/components/calculator/LightingCalculator"

export default function CalculatorPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto max-w-7xl flex-grow space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="block text-xs font-bold tracking-wider text-amber-500 uppercase">
            Engineering Tools
          </span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Lux & Lumen Calculator
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Use standard engineering formulas to calculate optimal luminous flux
            density (Lux) and fixture counts based on room application
            standards.
          </p>
        </div>

        <div className="pt-6">
          <LightingCalculator />
        </div>
      </main>

      <Footer />
    </div>
  )
}
