"use client"

import React, { useEffect, useState } from "react"
import { medusa } from "@/lib/medusa"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}


export default function TestCartPage() {
  const [log, setLog] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const addLog = (msg: string) => {
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
  }

  useEffect(() => {
    async function runTest() {
      try {
        addLog("Starting Cart & AddToCart diagnostics...")

        // 1. Get products to find a valid variant ID
        addLog("Fetching products to find a valid variant ID...")
        const prodRes = await medusa.getProducts({ limit: 5 })
        addLog(`Found ${prodRes?.products?.length || 0} products.`)
        
        if (!prodRes?.products || prodRes.products.length === 0) {
          addLog("❌ No products found to test with.")
          setIsLoading(false)
          return
        }

        const testProduct = prodRes.products[0]
        const testVariant = testProduct.variants?.[0]
        addLog(`Using test product: "${testProduct.title}" (ID: ${testProduct.id})`)
        
        if (!testVariant) {
          addLog("❌ No variants found for the product.")
          setIsLoading(false)
          return
        }
        addLog(`Using test variant: "${testVariant.title}" (ID: ${testVariant.id})`)

        // 2. Create a cart with KES
        addLog("Creating a new cart with currency: 'kes'...")
        let cartRes;
        try {
          cartRes = await medusa.createCart("kes")
          addLog(`✅ Cart created successfully! ID: ${cartRes.cart.id}`)
          addLog(`Cart Region ID: ${cartRes.cart.region_id || "None"}`)
          addLog(`Cart Currency Code: ${cartRes.cart.currency_code}`)
        } catch (cartErr: unknown) {
          addLog(`❌ Failed to create cart: ${getErrorMessage(cartErr)}`)
          console.error(cartErr)
          setIsLoading(false)
          return
        }

        // 3. Try to add variant to cart
        addLog(`Attempting to add variant ${testVariant.id} to cart ${cartRes.cart.id}...`)
        try {
          const addRes = await medusa.addToCart(cartRes.cart.id, testVariant.id, 1)
          addLog(`✅ Successfully added to cart! items count: ${addRes.cart.items?.length || 0}`)
        } catch (addErr: unknown) {
          addLog(`❌ Failed to add to cart! Error: ${getErrorMessage(addErr)}`)
          console.error(addErr)
        }

      } catch (err: unknown) {
        addLog(`❌ General Error: ${getErrorMessage(err)}`)
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    runTest()
  }, [])

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", background: "#1e1e1e", color: "#d4d4d4", minHeight: "100vh" }}>
      <h2>Cart Diagnostics</h2>
      {isLoading && <p>Running tests...</p>}
      <div style={{ background: "#252526", padding: "15px", borderRadius: "5px", border: "1px solid #3c3c3c" }}>
        {log.map((line, idx) => (
          <div key={idx} style={{ marginBottom: "5px", color: line.includes("❌") ? "#f44747" : line.includes("✅") ? "#89d4a3" : "#d4d4d4" }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}
