const MEDUSA_BACKEND_URL = "http://localhost:9001"
const PUBLISHABLE_KEY =
  "pk_2057cfa2ae21763877eac38d2a967f140fe2a867030e9412ff47200320f0bab8"

const headers = {
  "Content-Type": "application/json",
  "x-publishable-api-key": PUBLISHABLE_KEY,
}

async function runTest() {
  try {
    console.log("1. Fetching products...")
    const productsRes = await fetch(`${MEDUSA_BACKEND_URL}/store/products`, {
      headers,
    })
    if (!productsRes.ok) {
      throw new Error(
        `Failed to fetch products: ${productsRes.status} ${await productsRes.text()}`
      )
    }
    const productsData = await productsRes.json()

    // Find the Vintage Edison Bulb
    const product =
      productsData.products.find(
        (p) => p.handle === "vintage-edison-bulb-4w"
      ) || productsData.products[0]
    if (!product) {
      throw new Error("No products found in Medusa!")
    }
    const variant = product.variants[0]
    if (!variant) {
      throw new Error(`Product ${product.title} has no variants.`)
    }
    console.log(
      `Found product: "${product.title}" with variant ID: "${variant.id}"`
    )

    console.log("\n2. Creating a cart with kes currency...")
    const createCartRes = await fetch(`${MEDUSA_BACKEND_URL}/store/carts`, {
      method: "POST",
      headers,
      body: JSON.stringify({ currency_code: "kes" }),
    })
    const createCartText = await createCartRes.text()
    console.log(`Create Cart Status: ${createCartRes.status}`)
    console.log(`Create Cart Response: ${createCartText}`)

    if (!createCartRes.ok) {
      throw new Error(`Failed to create cart.`)
    }

    const { cart } = JSON.parse(createCartText)
    console.log(`Created Cart ID: "${cart.id}"`)

    console.log(`\n3. Adding variant "${variant.id}" to cart "${cart.id}"...`)
    const addToCartRes = await fetch(
      `${MEDUSA_BACKEND_URL}/store/carts/${cart.id}/line-items`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          variant_id: variant.id,
          quantity: 1,
        }),
      }
    )
    const addToCartText = await addToCartRes.text()
    console.log(`Add to Cart Status: ${addToCartRes.status}`)
    console.log(`Add to Cart Response: ${addToCartText}`)
  } catch (error) {
    console.error("Test run failed:", error)
  }
}

runTest()
