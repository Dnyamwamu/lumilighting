"use client"

import React, { useState, useMemo } from "react"
import { Lightbulb, Info, RefreshCw, Layers, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RoomType {
  name: string
  lux: number
  description: string
}

const ROOM_TYPES: RoomType[] = [
  {
    name: "Living Room",
    lux: 150,
    description: "Relaxed, warm ambient lighting",
  },
  {
    name: "Kitchen / Dining",
    lux: 300,
    description: "Bright, task-focused illumination",
  },
  {
    name: "Bedroom",
    lux: 150,
    description: "Cozy, low-level restful lighting",
  },
  {
    name: "Bathroom",
    lux: 250,
    description: "Clear, shadow-free mirror lighting",
  },
  {
    name: "Office / Study",
    lux: 400,
    description: "High concentration, task-level lighting",
  },
  {
    name: "Hallway / Stairs",
    lux: 100,
    description: "Safe, clear path lighting",
  },
]

export default function LightingCalculator() {
  const [length, setLength] = useState<number>(5)
  const [width, setWidth] = useState<number>(4)
  const [height, setHeight] = useState<number>(2.8)
  const [roomTypeIndex, setRoomTypeIndex] = useState<number>(0)

  const selectedRoom = ROOM_TYPES[roomTypeIndex]

  const calculations = useMemo(() => {
    const area = length * width

    // Height correction factor (base height 2.5m)
    const heightFactor = height > 2.5 ? height / 2.5 : 1

    // Total Lumens needed = Area * Lux * Height Factor
    const requiredLumens = Math.round(area * selectedRoom.lux * heightFactor)

    // Recommendation 1: LED Panels (18W, ~1500 lumens each)
    const panelCount = Math.ceil(requiredLumens / 1500)
    const panelTotalWattage = panelCount * 18

    // Recommendation 2: LED Bulbs (9W, ~800 lumens each)
    const bulbCount = Math.ceil(requiredLumens / 800)
    const bulbTotalWattage = bulbCount * 9

    return {
      area: area.toFixed(1),
      requiredLumens,
      panelCount,
      panelTotalWattage,
      bulbCount,
      bulbTotalWattage,
    }
  }, [length, width, height, selectedRoom])

  const resetCalculator = () => {
    setLength(5)
    setWidth(4)
    setHeight(2.8)
    setRoomTypeIndex(0)
  }

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xl">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-900 bg-gradient-to-r from-slate-900 to-slate-950 p-6 text-white md:flex-row md:items-center md:p-8">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Lightbulb className="h-6 w-6 animate-pulse text-amber-500" />
            LUMI Lighting Room Calculator
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Calculate exact light requirements and product recommendations for
            your space.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetCalculator}
          className="flex cursor-pointer items-center gap-1.5 border-slate-800 bg-slate-900/50 text-white hover:bg-slate-900"
        >
          <RefreshCw className="h-4 w-4" /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2 md:p-8">
        {/* INPUTS PANEL */}
        <div className="space-y-6">
          <h3 className="border-b border-border pb-2 text-lg font-semibold">
            1. Room Dimensions
          </h3>

          {/* Length Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <label htmlFor="length-slider">Length (meters)</label>
              <span className="font-bold text-primary">{length} m</span>
            </div>
            <input
              id="length-slider"
              type="range"
              min="2"
              max="15"
              step="0.5"
              value={length}
              onChange={(e) => setLength(parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-amber-500"
            />
          </div>

          {/* Width Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <label htmlFor="width-slider">Width (meters)</label>
              <span className="font-bold text-primary">{width} m</span>
            </div>
            <input
              id="width-slider"
              type="range"
              min="2"
              max="15"
              step="0.5"
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-amber-500"
            />
          </div>

          {/* Height Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <label htmlFor="height-slider">Ceiling Height (meters)</label>
              <span className="font-bold text-primary">{height} m</span>
            </div>
            <input
              id="height-slider"
              type="range"
              min="2.0"
              max="5.0"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-amber-500"
            />
          </div>

          {/* Room Type Selector */}
          <div className="space-y-2">
            <label htmlFor="room-type-select" className="text-sm font-medium">
              2. Select Room Type
            </label>
            <select
              id="room-type-select"
              value={roomTypeIndex}
              onChange={(e) => setRoomTypeIndex(parseInt(e.target.value))}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-sm shadow-sm focus:border-amber-500 focus:outline-none"
            >
              {ROOM_TYPES.map((room, idx) => (
                <option key={room.name} value={idx}>
                  {room.name} ({room.lux} Lux)
                </option>
              ))}
            </select>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              {selectedRoom.description}
            </p>
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="space-y-6 rounded-2xl border border-border/40 bg-muted/30 p-6">
          <h3 className="border-b border-border pb-2 text-lg font-semibold">
            3. Recommended Layout
          </h3>

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/50 bg-background p-4 text-center">
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Total Area
              </span>
              <p className="mt-1 text-xl font-extrabold text-foreground">
                {calculations.area} m²
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-background p-4 text-center">
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Required Lumens
              </span>
              <p className="mt-1 text-xl font-extrabold text-amber-500">
                {calculations.requiredLumens} lm
              </p>
            </div>
          </div>

          {/* Recommendations list */}
          <div className="space-y-4">
            {/* Panel recommendation */}
            <div className="flex items-start gap-4 rounded-xl border border-border bg-background p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Layers className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">
                  Option A: LED Panels (18W)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Best for modern ceilings, clean appearance.
                </p>
                <div className="mt-2 flex gap-4">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Quantity: </span>
                    <strong className="text-foreground">
                      {calculations.panelCount} units
                    </strong>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Total Power: </span>
                    <strong className="text-foreground">
                      {calculations.panelTotalWattage}W
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulb recommendation */}
            <div className="flex items-start gap-4 rounded-xl border border-border bg-background p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Zap className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">
                  Option B: LED Bulbs (9W)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Best for chandeliers, spotlights, or sconces.
                </p>
                <div className="mt-2 flex gap-4">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Quantity: </span>
                    <strong className="text-foreground">
                      {calculations.bulbCount} bulbs
                    </strong>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Total Power: </span>
                    <strong className="text-foreground">
                      {calculations.bulbTotalWattage}W
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            * Estimates are based on optimal reflectance parameters in standard
            residential settings.
          </div>
        </div>
      </div>
    </div>
  )
}
