// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodemailer = require("nodemailer")

const email = "info@lumilighting.co.ke"
const pass = "Lumilightingco@123!"

const configs = [
  {
    name: "US Server - Port 465 (SSL/TLS)",
    host: "smtp.titan.email",
    port: 465,
    secure: true,
    auth: { user: email, pass: pass },
    tls: { rejectUnauthorized: false },
  },
  {
    name: "US Server - Port 587 (STARTTLS)",
    host: "smtp.titan.email",
    port: 587,
    secure: false,
    auth: { user: email, pass: pass },
    tls: { rejectUnauthorized: false },
  },
  {
    name: "EU Server (smtp0101) - Port 465 (SSL/TLS)",
    host: "smtp0101.titan.email",
    port: 465,
    secure: true,
    auth: { user: email, pass: pass },
    tls: { rejectUnauthorized: false },
  },
  {
    name: "EU Server (smtp0101) - Port 587 (STARTTLS)",
    host: "smtp0101.titan.email",
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
  let successFound = false
  for (const config of configs) {
    const success = await testConfig(config)
    if (success) {
      successFound = true
      console.log(`\n🎉 Success! Working configuration is:`)
      console.log(`SMTP_HOST="${config.host}"`)
      console.log(`SMTP_PORT="${config.port}"`)
      console.log(`SMTP_SECURE="${config.secure}"`)
      break
    }
  }
  if (!successFound) {
    console.log("\n❌ All configurations failed.")
    console.log("If your credentials are correct, please check:")
    console.log(
      "1. Go to Titan Webmail (https://app.titan.email/) -> Settings -> 'Configure 3rd party apps' and check if 'Third-party email access' is enabled."
    )
    console.log(
      "2. In the same Settings page, verify the exact SMTP hostname and port listed for your account."
    )
  }
}

run()
