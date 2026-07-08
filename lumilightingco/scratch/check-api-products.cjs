// eslint-disable-next-line @typescript-eslint/no-require-imports
const http = require("http")

const options = {
  hostname: "127.0.0.1",
  port: 9001,
  path: "/store/products",
  method: "GET",
  headers: {
    "x-publishable-api-key":
      "pk_635782dd7316c54cba43848486e6ba1ae0d9d09d8a3008d6e6260f3a4450b7d2",
  },
}

const req = http.request(options, (res) => {
  let data = ""
  res.on("data", (chunk) => {
    data += chunk
  })
  res.on("end", () => {
    try {
      const json = JSON.parse(data)
      if (json.products && json.products.length > 0) {
        console.log("SUCCESS: Fetched products!")
        console.log("Product Title:", json.products[0].title)
        console.log(
          "Variants:",
          JSON.stringify(json.products[0].variants, null, 2)
        )
      } else {
        console.log("No products returned:", json)
      }
    } catch (e) {
      console.error("Failed to parse JSON:", e.message)
      console.log("Raw response:", data.substring(0, 500))
    }
  })
})

req.on("error", (e) => {
  console.error("Request failed:", e.message)
})

req.end()
