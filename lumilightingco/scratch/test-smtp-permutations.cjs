// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodemailer = require("nodemailer")

const email = "info@lumilighting.co.ke"
const pass = "Lumilightingco@123!"

const configs = [
  {
    name: "Port 465 (SSL/TLS)",
    host: "smtp.titan.email",
    port: 465,
    secure: true,
    auth: { user: email, pass: pass },
    tls: { rejectUnauthorized: false },
  },
  {
    name: "Port 587 (STARTTLS)",
    host: "smtp.titan.email",
    port: 587,
    secure: false,
    auth: { user: email, pass: pass },
    tls: { rejectUnauthorized: false },
  },
]

async function testConfig(config) {
  console.log(`\nTesting: ${config.name}...`)
  const transporter = nodemailer.createTransport(config)
  try {
    await new Promise((resolve, reject) => {
      transporter.verify((err, success) => {
        if (err) reject(err)
        else resolve(success)
      })
    })
    console.log(`✅ ${config.name} Succeeded!`)
    return true
  } catch (err) {
    console.error(`❌ ${config.name} Failed:`, err.message)
    return false
  }
}

async function run() {
  for (const config of configs) {
    await testConfig(config)
  }
}

run()
