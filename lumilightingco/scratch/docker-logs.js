// eslint-disable-next-line @typescript-eslint/no-require-imports
const http = require("http")
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs")

const options = {
  socketPath: "/var/run/docker.sock",
  path: "/containers/lumi_backend/logs?stdout=true&stderr=true&tail=50",
  method: "GET",
}

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`)

  let data = ""
  res.on("data", (chunk) => {
    // Docker log stream has an 8-byte header for each frame:
    // [stream_type (1 byte), 3 bytes padding, 4 bytes size (big endian)]
    // Let's decode it simply by stripping non-ascii or printing the chunk.
    process.stdout.write(
      chunk.toString("utf8").replace(/[\x00-\x1F\x7F-\x9F]/g, (char) => {
        // Keep newlines and standard whitespaces
        if (char === "\n" || char === "\r" || char === "\t") return char
        return ""
      })
    )
  })

  res.on("end", () => {
    console.log("\n--- End of Logs ---")
  })
})

req.on("error", (e) => {
  console.error(`Problem with request: ${e.message}`)
})

req.end()
