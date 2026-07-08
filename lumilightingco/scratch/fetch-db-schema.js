// eslint-disable-next-line @typescript-eslint/no-require-imports
const http = require("http")

http
  .get("http://localhost:9001/db-schema?t=9", (res) => {
    console.log(`STATUS: ${res.statusCode}`)
    let data = ""
    res.on("data", (chunk) => {
      data += chunk
    })
    res.on("end", () => {
      console.log("BODY:")
      console.log(data)
    })
  })
  .on("error", (e) => {
    console.error(`Error: ${e.message}`)
  })
