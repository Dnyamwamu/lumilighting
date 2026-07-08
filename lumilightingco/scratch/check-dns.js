import dns from "dns"

console.log("Resolving MX records for lumilighting.co.ke...")
dns.resolveMx("lumilighting.co.ke", (err, addresses) => {
  if (err) {
    console.error("DNS Error:", err.message)
  } else {
    console.log("MX Records:", JSON.stringify(addresses, null, 2))
  }
})
