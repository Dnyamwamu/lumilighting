// eslint-disable-next-line @typescript-eslint/no-require-imports
const http = require("http")

const queries = [
  "fields=*variants.prices",
  "fields=+variants.prices",
  "fields=id,title,handle,thumbnail,description,variants.id,variants.title,variants.sku,variants.prices.amount,variants.prices.currency_code",
]

function testQuery(queryStr) {
  return new Promise((resolve) => {
    const options = {
      hostname: "127.0.0.1",
      port: 9001,
      path: `/store/products?${queryStr}`,
      method: "GET",
      headers: {
        "x-publishable-api-key":
          "pk_635782dd7316c54cba43848486e6ba1ae0d9d09d8a3008d6e6260f3a4450b7d2",
      },
    }

    console.log(`\nTesting URL: /store/products?${queryStr}`)
    const req = http.request(options, (res) => {
      let data = ""
      res.on("data", (chunk) => {
        data += chunk
      })
      res.on("end", () => {
        try {
          const json = JSON.parse(data)
          if (json.products && json.products.length > 0) {
            const firstProduct = json.products[0]
            const firstVariant = firstProduct.variants?.[0]
            console.log(
              `- Success! First product variant keys:`,
              Object.keys(firstVariant || {})
            )
            console.log(`- Prices:`, firstVariant?.prices)
            resolve(true)
          } else {
            console.log(`- No products returned or error:`, json)
            resolve(false)
          }
        } catch (e) {
          console.error(`- Parse failed:`, e.message)
          resolve(false)
        }
      })
    })
    req.on("error", (e) => {
      console.error(`- Request failed:`, e.message)
      resolve(false)
    })
    req.end()
  })
}

async function run() {
  for (const q of queries) {
    await testQuery(q)
  }
}

run()
