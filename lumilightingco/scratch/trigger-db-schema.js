async function run() {
  try {
    console.log("Fetching http://localhost:9001/db-schema...")
    const res = await fetch("http://localhost:9001/db-schema")
    console.log("Status:", res.status)
    const json = await res.json()
    console.log("Response:", JSON.stringify(json, null, 2))
  } catch (err) {
    console.error("Error fetching db-schema:", err)
  }
}

run()
